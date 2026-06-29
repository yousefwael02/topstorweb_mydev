import React from 'react';
import { Server } from 'lucide-react';

const STATE_CONFIG = {
    up: {
        dot: 'bg-success-500',
        dotLabel: 'text-success-700',
        label: 'Online',
        ring: 'border-brand-500 ring-4 ring-brand-100 bg-brand-50/40',
        iconBg: 'bg-brand-100 text-brand-600',
        resting: 'border-border bg-surface hover:border-border-strong hover:bg-gray-50',
        restingIcon: 'bg-gray-100 text-gray-500',
    },
    down: {
        dot: 'bg-danger-500',
        dotLabel: 'text-danger-700',
        label: 'Offline',
        ring: 'border-brand-500 ring-4 ring-brand-100 bg-brand-50/40',
        iconBg: 'bg-brand-100 text-brand-600',
        resting: 'border-border bg-surface hover:border-border-strong hover:bg-gray-50',
        restingIcon: 'bg-gray-100 text-gray-500',
    },
    discovered: {
        dot: 'bg-brand-500',
        dotLabel: 'text-brand-700',
        label: 'Discovered',
        ring: 'border-brand-500 ring-4 ring-brand-100 bg-brand-50/40',
        iconBg: 'bg-brand-100 text-brand-600',
        resting: 'border-border bg-surface hover:border-border-strong hover:bg-gray-50',
        restingIcon: 'bg-gray-100 text-gray-500',
    },
};

const ServerNode = ({ name, ip, state = 'up', selected = false, className = '', onClick }) => {
    const cfg = STATE_CONFIG[state] ?? STATE_CONFIG.up;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`group flex w-full items-center gap-3 rounded-lg border px-3.5 py-3 text-left min-h-[60px] transition-colors
                ${selected ? cfg.ring : cfg.resting}
                ${className}`}
        >
            <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md ${selected ? cfg.iconBg : cfg.restingIcon}`}>
                <Server className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-gray-800">{name}</span>
                <span className="block truncate font-mono text-xs text-gray-500">{ip}</span>
            </span>
            <span className="flex flex-shrink-0 items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                <span className={`hidden text-[11px] font-medium sm:inline ${cfg.dotLabel}`}>{cfg.label}</span>
            </span>
        </button>
    );
};

export default ServerNode;
