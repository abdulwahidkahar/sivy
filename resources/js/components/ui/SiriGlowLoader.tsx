import { useEffect, useState } from 'react';

export default function SiriGlowLoader({ duration = 5000 }: { duration?: number }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(() => setVisible(false), duration);
        return () => clearTimeout(timeout);
    }, [duration]);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-[180px] h-[180px] rounded-full animate-siri-pulse">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500 via-purple-400 to-blue-400 opacity-80 blur-2xl mix-blend-screen animate-spin-slow" />
                <div className="absolute inset-6 rounded-full bg-black/80 backdrop-blur-xl border border-white/10" />
            </div>
        </div>
    );
}
