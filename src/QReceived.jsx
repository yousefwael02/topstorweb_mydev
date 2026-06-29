import React, { useState, useEffect, useCallback } from 'react';
import {
    RefreshCw,
    Trash2,
    RotateCcw,
    Database,
    HardDrive,
    Server,
    Clock,
    Zap,
    Filter
} from 'lucide-react';
import Button from './components/Common/Button';
import Dropdown from './components/Common/Dropdown';
import {
    fetchSnapshotsInfo,
    deleteSnapshot,
    rollbackSnapshot,
    fetchVolumeList
} from './api/volumes';
import { fetchPoolsInfo } from './api/pools';
import { fetchPartnerList } from './api/partners';

const QReceived = () => {
    // Data state
    const [pools, setPools] = useState([]);
    const [volumes, setVolumes] = useState([]);
    const [partners, setPartners] = useState([]);
    const [allSnapshots, setAllSnapshots] = useState([]);

    // UI state
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Filter state
    const [filters, setFilters] = useState({
        pool: 'Any',
        volume: 'Any',
        sender: 'Any'
    });

    const loadInitialData = useCallback(async () => {
        try {
            const [poolsRes, partnersRes, volumesRes] = await Promise.all([
                fetchPoolsInfo(),
                fetchPartnerList(),
                fetchVolumeList()
            ]);

            // Format pools
            const poolOptions = [{ value: 'Any', label: 'Any' }, ...Object.entries(poolsRes.data.results || {}).map(([id, p]) => ({
                value: p.text,
                label: p.text
            }))];
            setPools(poolOptions);

            // Format partners (senders)
            const senderOptions = [{ value: 'Any', label: 'Any' }, ...Object.entries(partnersRes.data.allpartners || {}).map(([id, p]) => ({
                value: p.alias.split('_')[0],
                label: p.alias.split('_')[0],
                type: p.type
            })).filter(p => p.type.toLowerCase().includes('ender'))];
            setPartners(senderOptions);

            // Format volumes
            const volOptions = [{ value: 'Any', label: 'Any' }, ...(volumesRes.data || []).map(v => ({
                value: v.text,
                label: v.text,
                pool: v.pool
            }))];
            setVolumes(volOptions);

        } catch (err) {
            console.error("Failed to load initial data", err);
            setMessage({ text: 'Failed to load system configuration.', type: 'error' });
        }
    }, []);

    const loadSnapshots = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const res = await fetchSnapshotsInfo();
            // In Qreceived.js, it filters by partnerS !== '-'
            const receivedOnly = (res.data.allsnaps || []).filter(s => s.partnerS && s.partnerS !== '-');
            setAllSnapshots(receivedOnly);
        } catch (err) {
            console.error("Failed to load snapshots", err);
            if (!isSilent) setMessage({ text: 'Failed to synchronize snapshot data.', type: 'error' });
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInitialData();
        loadSnapshots();
        const interval = setInterval(() => loadSnapshots(true), 5000);
        return () => clearInterval(interval);
    }, [loadInitialData, loadSnapshots]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleDelete = async (name) => {
        if (!window.confirm(`Are you sure you want to remove snapshot ${name}?`)) return;
        setActionLoading(`delete-${name}`);
        try {
            await deleteSnapshot(name);
            setMessage({ text: 'Snapshot removed successfully', type: 'success' });
            loadSnapshots(true);
        } catch (err) {
            console.error(`Failed to delete`, err);
            setMessage({ text: 'Failed to remove snapshot', type: 'error' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleRollback = async (name) => {
        if (!window.confirm("Perform rollback? This will restore the volume to this snapshot state.")) return;
        setActionLoading(`rollback-${name}`);
        try {
            await rollbackSnapshot(name);
            setMessage({ text: 'Rollback initiated successfully', type: 'success' });
            loadSnapshots(true);
        } catch (err) {
            console.error("Rollback failed", err);
            setMessage({ text: 'Rollback failed', type: 'error' });
        } finally {
            setActionLoading(null);
        }
    };

    const filteredSnapshots = allSnapshots.filter(snap => {
        const matchPool = filters.pool === 'Any' || snap.pool === filters.pool;
        const matchVolume = filters.volume === 'Any' || snap.volume.split('_')[0] === filters.volume;
        const matchSender = filters.sender === 'Any' || snap.partnerS === filters.sender;
        return matchPool && matchVolume && matchSender;
    });

    if (loading && allSnapshots.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="p-3 sm:p-5">
            <div className="rounded-xl border border-border bg-surface p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Received Snapshots</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage and restore snapshots replicated from remote partners</p>
                    </div>
                    <button
                        onClick={() => loadSnapshots()}
                        className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-xs hover:bg-gray-50 hover:text-brand-600"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {message.text && (
                    <div className={`mt-4 flex items-center gap-3 rounded-md border px-4 py-3 text-sm ${message.type === 'success' ? 'border-success-100 bg-success-50 text-success-600' : 'border-danger-100 bg-danger-50 text-danger-600'}`}>
                        <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`} />
                        {message.text}
                    </div>
                )}

                <div className="mt-6 space-y-6">
                <div className="flex flex-col gap-8">
                            {/* Filter Section Card */}
                            <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm p-6">

                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center">
                                        <Filter size={20} />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-800">Source Filters</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Dropdown
                                        label="Pool"
                                        options={pools}
                                        value={filters.pool}
                                        onChange={(val) => handleFilterChange('pool', val)}
                                        icon={<Database size={16} />}
                                    />
                                    <Dropdown
                                        label="Volume"
                                        options={volumes.filter(v => filters.pool === 'Any' || v.pool === filters.pool)}
                                        value={filters.volume}
                                        onChange={(val) => handleFilterChange('volume', val)}
                                        icon={<HardDrive size={16} />}
                                    />
                                    <Dropdown
                                        label="Sender"
                                        options={partners}
                                        value={filters.sender}
                                        onChange={(val) => handleFilterChange('sender', val)}
                                        icon={<Server size={16} />}
                                    />
                                </div>
                            </div>

                            {/* Received Snapshots List Card */}
                            <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm mb-6">

                                <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-surface-muted">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-md bg-success-50 text-success-600 flex items-center justify-center">
                                            <Zap size={18} />
                                        </div>
                                        <h3 className="text-base font-semibold text-gray-800">Received Snapshots List</h3>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-gray-600">
                                        {filteredSnapshots.length} Found
                                    </span>
                                </div>

                                <div className="p-0 overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-surface-muted">
                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-border">Timestamp</th>
                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-border">Alias</th>
                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-border">Pool / Volume</th>
                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-border">Sender</th>
                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-border">Size / Ratio</th>
                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-border text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {filteredSnapshots.map((snap, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-8 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-gray-700">{snap.date}</span>
                                                            <span className="text-[10px] text-gray-400 font-medium tracking-tight">{snap.time}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <span className="text-xs font-semibold text-brand-600 truncate max-w-[150px] inline-block">
                                                            {snap.name.split('.')[0]}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-gray-600">{snap.pool}</span>
                                                            <span className="text-[10px] text-brand-500 font-semibold uppercase tracking-tight">{snap.volume.split('_')[0]}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-brand-50 text-brand-600 text-[10px] font-semibold">
                                                            {snap.partnerS}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-gray-500 uppercase">{snap.used} MB</span>
                                                            <span className="text-[9px] text-success-500 font-semibold">{snap.refcompressratio}x Ratio</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleRollback(snap.name)}
                                                                className="w-9 h-9 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-all shadow-xs"
                                                                title="Rollback volume"
                                                            >
                                                                <RotateCcw size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(snap.name)}
                                                                disabled={actionLoading === `delete-${snap.name}`}
                                                                className="w-9 h-9 rounded-md bg-danger-50 text-danger-500 flex items-center justify-center hover:bg-danger-500 hover:text-white transition-all shadow-xs"
                                                                title="Delete snapshot"
                                                            >
                                                                {actionLoading === `delete-${snap.name}` ? (
                                                                    <div className="w-4 h-4 border-2 border-danger-200 border-t-danger-500 rounded-full animate-spin"></div>
                                                                ) : <Trash2 size={14} />}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredSnapshots.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" className="px-8 py-20 text-center">
                                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                                            <Zap size={40} className="text-gray-400" />
                                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Received Snapshots Found</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                </div>
            </div>
        </div>
    );
};

export default QReceived;
