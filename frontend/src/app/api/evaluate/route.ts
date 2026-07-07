import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SchemaType } from "@google/generative-ai";
import { getEncoding } from "js-tiktoken";

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

function purgeGarbageTokens(content: string): string {
    let text = content;
    text = text.replace(/diff --git a\/(.*?package-lock\.json|.*?yarn\.lock|.*?pnpm-lock\.yaml)[\s\S]*?(?=diff --git|$)/g, '');
    text = text.replace(/diff --git a\/.*\.svg[\s\S]*?(?=diff --git|$)/g, '');
    text = text.replace(/diff --git a\/.*\.css[\s\S]*?(?=diff --git|$)/g, '');
    text = text.replace(/[A-Za-z0-9+/]{100,}={0,2}/g, '[BASE64_REMOVED]');
    text = text.replace(/diff --git a\/.*\.map[\s\S]*?(?=diff --git|$)/g, '');
    return text;
}

function enforceTokenLimit(text: string, maxTokens: number = 5000): string {
    try {
        const encoding = getEncoding("cl100k_base");
        const tokens = encoding.encode(text);
        if (tokens.length <= maxTokens) return text;
        const headTokens = tokens.slice(0, 2500);
        const tailTokens = tokens.slice(tokens.length - 2500);
        return encoding.decode(headTokens) + "\n\n...[MASSIVE CODE OMITTED FOR SANITY]...\n\n" + encoding.decode(tailTokens);
    } catch (e) {
        return text.length > 20000 ? text.substring(0, 10000) + "\n\n...[OMITTED]...\n\n" + text.substring(text.length - 10000) : text;
    }
}

export async function POST(req: NextRequest) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            function sendEvent(data: any) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            }

            try {
                const { user_id } = await req.json();
                if (!user_id) throw new Error("Missing user_id");

                sendEvent({ status: "log", message: "> INITIATING PIPELINE..." });
                
                const { data: user, error: userError } = await supabase
                    .from('users')
                    .select('access_token')
                    .eq('id', user_id)
                    .single();

                if (userError || !user?.access_token) {
                    throw new Error("Could not retrieve GitHub token.");
                }

                const githubToken = user.access_token;
                sendEvent({ status: "log", message: "> FETCHING REPOSITORIES..." });

                const reposRes = await fetch("https://api.github.com/user/repos?sort=updated&per_page=3&affiliation=owner", {
                    headers: { "Authorization": `Bearer ${githubToken}`, "Accept": "application/vnd.github.v3+json" }
                });
                
                if (!reposRes.ok) throw new Error("Failed to fetch repositories.");
                
                const repos = await reposRes.json();
                if (!repos || repos.length === 0) {
                    sendEvent({ status: "complete", score: 0, critique: "User has zero public commits. Architecturally nonexistent." });
                    controller.close();
                    return;
                }

                let combinedDiff = "";
                sendEvent({ status: "log", message: "> SCRAPING RECENT COMMITS & AST TREES..." });

                for (const repo of repos) {
                    const commitsRes = await fetch(`https://api.github.com/repos/${repo.full_name}/commits?per_page=5`, {
                        headers: { "Authorization": `Bearer ${githubToken}`, "Accept": "application/vnd.github.v3+json" }
                    });
                    
                    if (!commitsRes.ok) continue;
                    const commits = await commitsRes.json();
                    if (!Array.isArray(commits)) continue;
                    
                    for (const commit of commits) {
                        const diffRes = await fetch(`https://api.github.com/repos/${repo.full_name}/commits/${commit.sha}`, {
                            headers: { "Authorization": `Bearer ${githubToken}`, "Accept": "application/vnd.github.v3.diff" }
                        });
                        
                        if (diffRes.ok) {
                            combinedDiff += `\n--- COMMIT SEPARATOR ---\n${await diffRes.text()}`;
                        }
                    }
                }

                if (!combinedDiff.trim()) {
                    sendEvent({ status: "complete", score: 0, critique: "No meaningful code diffs found in recent commits." });
                    controller.close();
                    return;
                }

                sendEvent({ status: "log", message: "> SANITIZING AST TREES..." });
                const cleanedDiff = purgeGarbageTokens(combinedDiff);
                const finalPayload = enforceTokenLimit(cleanedDiff, 2000);

                sendEvent({ status: "log", message: "> INVOKING NEURAL EVALUATOR (GEMINI 2.5 FLASH)..." });
                
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                const systemPrompt = `You are a strict, elite Staff Engineer reviewing a dev's git diffs. You prioritize modularity, security, and performance. Analyze the diffs objectively. Look for tight coupling, memory leaks, N+1 queries, and poor naming.
Output strictly as a JSON object with two fields:
{
  "score": <integer 0-100>,
  "critique": "<exactly 3 highly critical, direct sentences analyzing their mistakes.>"
}`;

                const chat = model.startChat({
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1000,
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: SchemaType.OBJECT,
                            properties: {
                                score: { type: SchemaType.INTEGER },
                                critique: { type: SchemaType.STRING }
                            },
                            required: ["score", "critique"]
                        }
                    }
                });

                let result = await chat.sendMessage([systemPrompt, `User Diffs:\n${finalPayload}`]);
                let responseText = result.response.text();
                
                let evaluation = { score: 0, critique: "PIPELINE FATAL ERROR." };
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) evaluation = JSON.parse(jsonMatch[0]);

                sendEvent({ status: "log", message: "> SAVING EVALUATION TO DATABASE..." });
                const { error: insertError } = await supabase.from('evaluations').insert({
                    user_id: user_id,
                    score: evaluation.score,
                    critique: evaluation.critique
                });

                if (insertError) throw new Error(`Failed to save to database: ${insertError.message}`);

                sendEvent({ status: "complete", score: evaluation.score, critique: evaluation.critique });
            } catch (error: any) {
                console.error("Evaluation Error:", error);
                sendEvent({ status: "error", message: error.message });
            } finally {
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
