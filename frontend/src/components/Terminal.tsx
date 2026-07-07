"use client";
import { usePipelineStore } from '@/store/usePipelineStore';

export const Terminal = () => {
    const { status, logs } = usePipelineStore();

    if (status === 'idle') return null;

    return (
        <div className="bg-black text-white p-6 font-mono text-sm leading-relaxed max-w-2xl w-full border border-gray-900 mt-8">
            <div className="mb-4 text-gray-500">{"// BRUTALBENCH EVALUATION TERMINAL"}</div>
            <div className="text-white mb-2">{"> AUTHENTICATED AS @USER"}</div>
            
            {logs.map((log, i) => (
                <div key={i} className="text-gray-100">{log}</div>
            ))}

            {status === 'running' && (
                <div className="animate-pulse text-white mt-2">_</div>
            )}
            
            {status === 'complete' && (
                <div className="text-white mt-4 font-bold">{"> EVALUATION COMPLETE."}</div>
            )}
        </div>
    );
};
