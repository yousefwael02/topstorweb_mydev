import React from 'react';

const SnapshotPeriodsList = ({ periods, onDelete, type }) => {
    return (
        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
                <div>
                    <h3 className="text-gray-800 font-bold tracking-tight">{type} Periods</h3>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Active Schedules</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <th className="px-5 py-2.5">Sequence ID</th>
                            <th className="px-5 py-4">Volume</th>
                            <th className="px-5 py-2.5">Frequency</th>
                            <th className="px-5 py-2.5">Keep</th>
                            <th className="px-5 py-2.5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {periods.map((period, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/60 transition-colors group/row">
                                <td className="px-6 py-3 text-sm font-bold text-gray-700">{period.id}</td>
                                <td className="px-6 py-3 text-sm font-bold text-brand-500">{period.volume.split('_')[0]}</td>
                                <td className="px-6 py-3 text-sm font-medium text-gray-600">
                                    {type === 'Minutely' && `Every ${period.every} min`}
                                    {type === 'Hourly' && `Every ${period.every} hr at min ${period.sminute}`}
                                    {type === 'Weekly' && `On ${period.every} at ${period.stime}`}
                                </td>
                                <td className="px-6 py-3 text-sm font-medium text-gray-600">{period.keep} snaps</td>
                                <td className="px-6 py-3 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onDelete(period.id)}
                                            className="p-2 text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                                            title="Delete Schedule"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {periods.length === 0 && (
                    <div className="py-8 text-center">
                        <p className="text-gray-400 font-medium tracking-tight">No active {type.toLowerCase()} schedules</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SnapshotPeriodsList;
