import React, { useState, useEffect, useCallback } from 'react';
import { fetchLogs } from './api/logs';
import LogList from './components/LogList';

const QLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = useCallback(async () => {
        try {
            const res = await fetchLogs();
            if (res.data?.alllogs) {
                setLogs(res.data.alllogs);
            }
        } catch (err) {
            console.error("Failed to load logs", err);
            setError("Communication failure with log service");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 2000); // Poll every 2s to match legacy Qlogs.js
        return () => clearInterval(interval);
    }, [loadData]);

    return (
        <div className="p-3 sm:p-5">
            <div className="rounded-xl border border-border bg-surface p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">System Logs</h1>
                        <p className="mt-1 text-sm text-gray-500">System-wide event tracking and audit oversight</p>
                    </div>
                    <button
                        onClick={loadData}
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-xs hover:bg-gray-50 hover:text-brand-600"
                    >
                        <i className="fas fa-sync-alt" /> Refresh
                    </button>
                </div>

                <div className="mt-6">
                    {error && (
                        <div className="mb-4 flex items-center gap-3 rounded-md border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-600">
                            <i className="fas fa-exclamation-triangle" />
                            {error}
                        </div>
                    )}
                    <LogList logs={logs} />
                </div>
            </div>
        </div>
    );
};

export default QLogs;
