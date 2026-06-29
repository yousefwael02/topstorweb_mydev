import React from 'react';

const LogList = ({ logs }) => {
    return (
        <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm mt-4">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                        <i className="fas fa-clipboard-list" />
                    </span>
                    <div>
                        <h3 className="text-base font-semibold text-gray-800">System Event Logs</h3>
                        <p className="text-sm text-gray-500">Real-time monitoring &amp; audit trail</p>
                    </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-gray-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
                    {logs.length} events
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border bg-surface-muted">
                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Timestamp</th>
                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Identity</th>
                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Event Details</th>
                            <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Severity</th>
                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Code</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {logs.map((log, index) => (
                            <LogRow key={`${log.date}-${log.time}-${index}`} log={log} />
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan="5" className="py-16 text-center text-sm text-gray-400">
                                    No system logs available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

const LogRow = ({ log }) => {
    const getSeverityStyles = (type) => {
        switch (type?.toLowerCase()) {
            case 'error':
                return { bg: 'bg-danger-50', text: 'text-danger-600', border: 'border-danger-100', icon: 'fa-exclamation-circle', row: 'bg-danger-50/20 hover:bg-danger-50/40' };
            case 'warning':
                return { bg: 'bg-warning-50', text: 'text-warning-600', border: 'border-warning-100', icon: 'fa-exclamation-triangle', row: 'bg-warning-50/20 hover:bg-warning-50/40' };
            default:
                return { bg: 'bg-brand-50', text: 'text-brand-600', border: 'border-brand-100', icon: 'fa-info-circle', row: 'hover:bg-gray-50/60' };
        }
    };

    const styles = getSeverityStyles(log.type);

    return (
        <tr className={`${styles.row} transition-colors`}>
            <td className="px-5 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                    <span className="font-medium text-gray-700 text-sm">{log.date}</span>
                    <span className="text-xs text-gray-400">{log.time}</span>
                </div>
            </td>
            <td className="px-5 py-4 whitespace-nowrap">
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-700">{log.user}</span>
                    <span className="text-xs text-gray-400 uppercase tracking-tight">{log.host}</span>
                </div>
            </td>
            <td className="px-5 py-4">
                <p className="text-sm text-gray-600 leading-relaxed max-w-xl">{log.msgbody}</p>
            </td>
            <td className="px-5 py-4 text-center">
                <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${styles.bg} ${styles.text} ${styles.border}`}>
                    <i className={`fas ${styles.icon} text-[10px]`} />
                    {log.type}
                </span>
            </td>
            <td className="px-5 py-4 text-right">
                <span className="font-mono text-xs text-gray-400 bg-surface-muted px-2 py-1 rounded border border-border">
                    {log.msgcode}
                </span>
            </td>
        </tr>
    );
};

export default LogList;
