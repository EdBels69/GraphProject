import React from 'react';
import { Card } from './ui/Card';
import { ArrowUpRight, ArrowDownRight, Minus, LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  color?: 'acid' | 'plasma' | 'steel' | 'white';
}

export function StatCard({ title, value, change, trend, icon: Icon, color = 'steel' }: StatCardProps) {
  const trendConfig = {
    up: { color: 'text-acid', icon: <ArrowUpRight className="w-4 h-4" /> },
    down: { color: 'text-plasma-light', icon: <ArrowDownRight className="w-4 h-4" /> },
    neutral: { color: 'text-steel/40', icon: <Minus className="w-4 h-4" /> },
  };

  const colorGlow = {
    acid: 'shadow-glow-acid/10',
    plasma: 'shadow-glow-plasma/10',
    steel: '',
    white: 'shadow-glow-white/5',
  };

  return (
    <Card className={`p-6 relative overflow-hidden group hover:border-white/20 transition-all duration-500 ${colorGlow[color]}`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${color === 'acid' ? 'text-acid' : color === 'plasma' ? 'text-plasma-light' : 'text-steel/40'} group-hover:scale-110 transition-transform`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
          <h3 className="text-[10px] font-display font-bold text-steel/30 tracking-widest uppercase mb-0">{title}</h3>
        </div>

        {trend && (
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5 ${trendConfig[trend].color}`}>
            {trendConfig[trend].icon}
            {change && <span className="text-[10px] font-mono font-bold">{change}</span>}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-display font-bold text-white tracking-widest">
          {value}
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-acid animate-pulse shadow-glow-acid/50" />
      </div>

      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:bg-white/10 transition-colors" />
    </Card>
  );
}
