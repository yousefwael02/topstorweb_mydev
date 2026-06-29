import React from 'react';

const VolumeInsights = ({ volumes }) => {
    const totalVols = volumes.length;
    const onlineVols = volumes.length; // Simplified for now
    const avgCompression = volumes.reduce((acc, vol) => {
        const ratio = parseFloat(vol.refcompressratio) || 1.0;
        return acc + ratio;
    }, 0) / (totalVols || 1);

    return (
        <div className="flex flex-col h-full overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
                <div>
                    <h3 className="text-base font-semibold text-gray-800">CIFS Insights</h3>
                    <p className="text-sm text-gray-500">Operational summary</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                    <i className="fas fa-chart-line text-sm" />
                </span>
            </div>

            <div className="flex-1 space-y-6 p-5">
                <div className="flex gap-4">
                    <div className="flex-1 rounded-md border border-border bg-surface-muted p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Online</p>
                        <p className="text-2xl font-bold text-success-600 tracking-tight">{onlineVols}</p>
                    </div>
                    <div className="flex-1 rounded-md border border-border bg-surface-muted p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Standby</p>
                        <p className="text-2xl font-bold text-gray-300 tracking-tight">0</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Global Compression</p>
                        <p className="text-sm font-semibold text-brand-600">{(avgCompression).toFixed(2)}x</p>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brand-600 rounded-full transition-all duration-700"
                            style={{ width: `${Math.min((avgCompression - 1) * 20, 100)}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-400">Aggregate ZFS efficiency across all CIFS shares</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {volumes.slice(0, 3).map((v, i) => (
                            <div key={i} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-brand-50 text-[9px] font-semibold text-brand-600 overflow-hidden">
                                {v.name.charAt(0)}
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400">
                        {totalVols > 3 ? `+${totalVols - 3} more volumes active` : 'Volume distribution active'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VolumeInsights;
