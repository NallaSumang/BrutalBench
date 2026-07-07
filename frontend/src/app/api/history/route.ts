import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
    try {
        // @ts-ignore
        const session = await getServerSession({
            callbacks: {
              session: ({ session, token }: any) => {
                session.accessToken = token.accessToken as string;
                if(!session.user) session.user = {};
                session.user.id = token.sub as string;
                return session;
              }
            }
        });

        const user_id = (session?.user as any)?.id;
        
        if (!user_id) {
             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: history, error } = await supabase
            .from('evaluations')
            .select('score, critique, created_at')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            throw new Error(`Failed to fetch history: ${error.message}`);
        }

        return NextResponse.json(history);
    } catch (error: any) {
        console.error("History Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
