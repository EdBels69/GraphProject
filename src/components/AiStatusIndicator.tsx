import React, { useEffect, useState } from 'react';
import { Bot, AlertCircle, CheckCircle, Zap, ShieldAlert, Wifi, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/api/endpoints';

interface AIHealth {
    available: boolean;
    provider?: string;
    model?: string;
    error?: string;
    circuitOpen?: boolean;
}

export const AiStatusIndicator: React.FC = () => {
    const { t } = useTranslation();
    const [health, setHealth] = useState<AIHealth | null>(null);
    const [lastChecked, setLastChecked] = useState<Date>(new Date());

    const fetchHealth = async () => {
        try {
            const response = await fetch('/api/ai/health');
            const data = await response.json();
            setHealth(data);
            setLastChecked(new Date());
        } catch (err) {
            setHealth({ available: false, error: 'Connection failed' });
        }
    };

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 60000); // Poll every 60s
        return () => clearInterval(interval);
    }, []);

    if (!health) return null;

    const getStatusColor = () => {
        if (health.circuitOpen) return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
        if (health.available) return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
        return 'text-rose-500 border-rose-500/30 bg-rose-500/10';
    };

    const getStatusIcon = () => {
        if (health.circuitOpen) return <ShieldAlert className="w-3.5 h-3.5" />;
        if (health.available) return <Zap className="w-3.5 h-3.5" />;
        return <AlertCircle className="w-3.5 h-3.5" />;
    };

    const getStatusLabel = () => {
        if (health.circuitOpen) return 'CIRCUIT_OPEN';
        if (health.available) return 'ONLINE';
        return 'OFFLINE';
    };

    return (
        <div className={`flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-all duration-500 ${getStatusColor()}`}>
            <div className="relative">
                <Bot className="w-4 h-4" />
                <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border border-black animate-pulse ${health.available ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </div>

            <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold tracking-tighter uppercase whitespace-nowrap">
                        {health.provider || 'AI_CORE'}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-current opacity-30" />
                    <span className="text-[10px] font-mono font-bold tracking-widest">
                        {getStatusLabel()}
                    </span>
                </div>
                {health.model && (
                    <span className="text-[8px] opacity-60 font-mono truncate max-w-[100px]">
                        {health.model}
                    </span>
                )}
            </div>

            {getStatusIcon()}
        </div>
    );
};
