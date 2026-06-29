import React from 'react';

const MetricCard = ({ title, value, unit, icon, color, trend, trendValue }) => {
    const iconColorClasses = {
        blue: 'bg-brand-50 text-brand-600',
        emerald: 'bg-success-50 text-success-600',
        amber: 'bg-warning-50 text-warning-600',
        indigo: 'bg-brand-50 text-brand-600',
        rose: 'bg-danger-50 text-danger-600',
    };

    const accentColor = iconColorClasses[color] || iconColorClasses.blue;

    return (
        <div className="rounded-lg border border-border bg-surface p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start mb-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-md border border-border ${accentColor}`}>
                    <i className={`fas ${icon} text-base`} />
                </div>
                {trend && (
                    <div className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
                        trend === 'up' ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'
                    }`}>
                        <i className={`fas fa-chevron-${trend} text-[10px]`} />
                        {trendValue}
                    </div>
                )}
            </div>

            <div className="space-y-0.5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h3>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-gray-900 tracking-tight">{value}</span>
                    <span className="text-sm font-medium text-gray-400">{unit}</span>
                </div>
            </div>
        </div>
    );
};

export default MetricCard;
