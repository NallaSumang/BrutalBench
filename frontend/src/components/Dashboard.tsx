"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Terminal } from './Terminal';
import { History } from './History';
import { usePipelineStore } from '@/store/usePipelineStore';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const { data: session, status: authStatus } = useSession();
    const { status, score, critique, setStatus, setResult, addLog, reset } = usePipelineStore();
    
    const startEvaluation = async () => {
        if (!session?.user) return;
        reset();
        setStatus('running');
        try {
            const res = await fetch('/api/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: (session.user as any).id })
            });

            if (!res.ok || !res.body) throw new Error("API Route Failed.");

            const reader = res.body.getReader();
            const decoder = new TextDecoder("utf-8");

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.substring(6));
                            if (data.status === 'log') {
                                addLog(data.message);
                            } else if (data.status === 'complete') {
                                setResult(data.score, data.critique);
                            } else if (data.status === 'error') {
                                throw new Error(data.message);
                            }
                        } catch (e) {
                            console.error("SSE parse error", e);
                        }
                    }
                }
            }
        } catch (error: any) {
            console.error(error);
            setResult(0, error.message || "EVALUATION FAILED.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-mono mb-8 font-bold tracking-tighter uppercase"
            >
                BrutalBench
            </motion.h1>
            
            {authStatus === 'loading' ? (
                <div className="text-gray-500 font-mono">LOADING IDENTITY...</div>
            ) : session ? (
                <div className="flex flex-col items-center w-full max-w-2xl">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between w-full border-b border-gray-900 pb-4 mb-4"
                    >
                        <div className="flex items-center gap-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={session.user?.image || ''} alt="avatar" className="w-12 h-12 grayscale" />
                            <div>
                                <div className="font-mono text-sm text-gray-500">Subject</div>
                                <div className="font-mono text-lg">{session.user?.name || session.user?.email}</div>
                            </div>
                        </div>
                        <button 
                            onClick={() => signOut()}
                            className="px-4 py-2 border border-gray-500 text-gray-500 font-mono text-sm hover:text-white hover:border-white transition-colors"
                        >
                            DISCONNECT
                        </button>
                    </motion.div>

                    {(status === 'idle' || status === 'complete') && (
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startEvaluation}
                            className="px-8 py-4 bg-white text-black font-mono font-bold hover:bg-gray-100 mt-8 transition-transform"
                        >
                            {status === 'complete' ? 'RE-EVALUATE' : 'INITIATE EVALUATION'}
                        </motion.button>
                    )}

                    <Terminal />

                    {status === 'complete' && score !== null && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-8 border-4 border-white p-8 w-full shadow-[8px_8px_0_0_#fff]"
                        >
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.2 }}
                                className="text-8xl font-mono mb-6 text-center font-bold tracking-tighter"
                            >
                                {score}<span className="text-gray-500 text-4xl">/100</span>
                            </motion.div>
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="font-mono text-base leading-loose whitespace-pre-wrap text-gray-100 border-t border-gray-800 pt-6"
                            >
                                {critique}
                            </motion.div>
                        </motion.div>
                    )}

                    <History />
                </div>
            ) : (
                <button 
                    onClick={() => signIn('github')}
                    className="px-8 py-4 bg-white text-black font-mono font-bold hover:bg-gray-100"
                >
                    AUTHENTICATE VIA GITHUB
                </button>
            )}
        </div>
    );
}
