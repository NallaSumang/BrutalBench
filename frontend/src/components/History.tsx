"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePipelineStore } from '@/store/usePipelineStore';

type EvalHistory = {
    score: number;
    critique: string;
    created_at: string;
};

export const History = () => {
    const [history, setHistory] = useState<EvalHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const status = usePipelineStore(state => state.status);

    useEffect(() => {
        // Refetch when status hits complete (i.e. a new evaluation just finished)
        if (status === 'running') return;
        
        fetch('/api/history')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setHistory(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [status]);

    if (loading) return null;
    if (history.length === 0) return null;

    return (
        <div className="w-full max-w-2xl mt-16 mb-16">
            <h2 className="text-2xl font-mono font-bold border-b border-gray-900 pb-2 mb-6 text-gray-400">PREVIOUS EVALUATIONS</h2>
            <div className="flex flex-col gap-6">
                {history.map((item, index) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={item.created_at} 
                        className="border border-gray-800 p-6 bg-[#050505] relative hover:border-gray-500 transition-colors shadow-[4px_4px_0_0_#333]"
                    >
                        <div className="absolute -top-3 -right-3 bg-white text-black font-bold font-mono px-3 py-1 text-sm border-2 border-black">
                            {item.score}/100
                        </div>
                        <div className="text-xs text-gray-500 font-mono mb-3">
                            {new Date(item.created_at).toLocaleString()}
                        </div>
                        <div className="text-sm font-mono text-gray-300 leading-relaxed line-clamp-3">
                            {item.critique}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
