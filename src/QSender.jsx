import React, { useState, useEffect, useCallback } from 'react';
import {
    RefreshCw,
    PlusCircle,
    Trash2,
    RotateCcw,
    Send,
    Clock,
    Calendar,
    Zap,
    Database,
    HardDrive,
    Server
} from 'lucide-react';
import Button from './components/Common/Button';
import Input from './components/Common/Input';
import Dropdown from './components/Common/Dropdown';
import {
    fetchSnapshotsInfo,
    createSnapshot,
    deleteSnapshot,
    rollbackSnapshot,
    deleteSnapshotPeriod,
    fetchVolumeList
} from './api/volumes';
import { fetchPoolsInfo } from './api/pools';
import { fetchPartnerList } from './api/partners';

const QSender = () => {
    // Selection state
    const [pools, setPools] = useState([]);
    const [volumes, setVolumes] = useState([]);
    const [partners, setPartners] = useState([]);

    const [selectedPool, setSelectedPool] = useState('');
    const [selectedVolume, setSelectedVolume] = useState('');
    const [selectedReceiver, setSelectedReceiver] = useState('');

    // Data state
    const [snapshotsInfo, setSnapshotsInfo] = useState({
        once: [],
        allsnaps: [],
        Minutelyperiod: [],
        Hourlyperiod: [],
        Weeklyperiod: []
    });

    // UI state
    const [activeTab, setActiveTab] = useState('Once');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Form states
    const [onceName, setOnceName] = useState('');
    const [minutelyEvery, setMinutelyEvery] = useState(1);
    const [minutelyKeep, setMinutelyKeep] = useState(4);
    const [hourlyEvery, setHourlyEvery] = useState(1);
    const [hourlyMinute, setHourlyMinute] = useState(0);
    const [hourlyKeep, setHourlyKeep] = useState(4);
    const [weeklyDay, setWeeklyDay] = useState('Sat');
    const [weeklyTime, setWeeklyTime] = useState('00:00');
    const [weeklyKeep, setWeeklyKeep] = useState(4);

    const loadInitialData = useCallback(async () => {
        try {
            const [poolsRes, partnersRes] = await Promise.all([
                fetchPoolsInfo(),
                fetchPartnerList()
            ]);

            const poolOptions = Object.entries(poolsRes.data.results || {}).map(([id, p]) => ({
                value: id,
                label: p.text,
                owner: p.owner
            }));
            setPools(poolOptions);

            const partnerOptions = Object.entries(partnersRes.data.allpartners || {}).map(([id, p]) => ({
                value: id,
                label: p.alias.split('_')[0],
                alias: p.alias,
                type: p.type
            })).filter(p => p.type.toLowerCase().includes('ceiver'));
            setPartners(partnerOptions);

        } catch (err) {
            console.error("Failed to load initial data", err);
            setMessage({ text: 'Failed to load system configuration.', type: 'error' });
        }
    }, []);

    const loadVolumes = useCallback(async (poolId) => {
        if (!poolId) {
            setVolumes([]);
            return;
        }
        try {
            const res = await fetchVolumeList();
            const poolLabel = pools.find(p => p.value === poolId)?.label;
            const filteredVolumes = (res.data || []).filter(v => v.pool === poolLabel).map(v => ({
                value: v.id,
                label: v.text,
                fullname: v.fullname
            }));
            setVolumes(filteredVolumes);
        } catch (err) {
            console.error("Failed to load volumes", err);
        }
    }, [pools]);

    const loadSnapshots = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const res = await fetchSnapshotsInfo();
            setSnapshotsInfo({
                once: res.data.once || [],
                allsnaps: res.data.allsnaps || [],
                Minutelyperiod: res.data.Minutelyperiod || [],
                Hourlyperiod: res.data.Hourlyperiod || [],
                Weeklyperiod: res.data.Weeklyperiod || []
            });
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

    useEffect(() => {
        loadVolumes(selectedPool);
    }, [selectedPool, loadVolumes]);

    const handleCreate = async (e) => {
        if (e) e.preventDefault();
        if (!selectedPool || !selectedVolume || !selectedReceiver) return;

        const poolObj = pools.find(p => p.value === selectedPool);
        const volObj = volumes.find(v => v.value === selectedVolume);
        const receiverAlias = partners.find(p => p.value === selectedReceiver)?.alias;

        let payload = {
            snapsel: activeTab,
            pool: poolObj.label,
            volume: volObj.fullname,
            receiver: receiverAlias,
            owner: poolObj.owner
        };

        if (activeTab === 'Once') {
            payload.name = onceName || `${volObj.label}_manual`;
        } else if (activeTab === 'Minutely') {
            payload.every = minutelyEvery;
            payload.keep = minutelyKeep;
        } else if (activeTab === 'Hourly') {
            payload.every = hourlyEvery;
            payload.sminute = hourlyMinute;
            payload.keep = hourlyKeep;
        } else if (activeTab === 'Weekly') {
            payload.stime = weeklyTime;
            payload.every = weeklyDay;
            payload.keep = weeklyKeep;
        }

        setActionLoading('create');
        setMessage({ text: '', type: '' });

        try {
            await createSnapshot(payload);
            setMessage({ text: `Schedule "${activeTab}" established successfully`, type: 'success' });
            setOnceName('');
            loadSnapshots(true);
        } catch (err) {
            console.error("Failed to create", err);
            setMessage({ text: 'Failed to establish schedule', type: 'error' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm(`Are you sure you want to remove this ${type}?`)) return;
        setActionLoading(`delete-${id}`);
        try {
            if (type === 'snapshot') {
                await deleteSnapshot(id);
            } else {
                await deleteSnapshotPeriod(id);
            }
            setMessage({ text: `${type} removed successfully`, type: 'success' });
            loadSnapshots(true);
        } catch (err) {
            console.error(`Failed to delete`, err);
            setMessage({ text: `Failed to remove ${type}`, type: 'error' });
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

    if (loading && snapshotsInfo.allsnaps.length === 0) {
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
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Replication Schedule</h1>
                        <p className="mt-1 text-sm text-gray-500">Configure automated snapshot replication and data security</p>
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
                <div className="flex flex-col gap-6">
                            <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-5">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                                        <Clock size={18} />
                                    </span>
                                    <h3 className="text-base font-semibold text-gray-800">Provision New Sender</h3>
                                </div>

                                <form onSubmit={handleCreate} className="space-y-4">
                                    {/* Source Selection Row */}
                                    <div className="flex flex-col gap-4">
                                        <Dropdown
                                            label="Source Pool"
                                            options={pools}
                                            value={selectedPool}
                                            onChange={setSelectedPool}
                                            placeholder="Select Pool"
                                            icon={<Database size={16} />}
                                        />
                                        <Dropdown
                                            label="Source Volume"
                                            options={volumes}
                                            value={selectedVolume}
                                            onChange={setSelectedVolume}
                                            placeholder="Select Volume"
                                            disabled={!selectedPool}
                                            icon={<HardDrive size={16} />}
                                        />
                                        <Dropdown
                                            label="Target Receiver"
                                            options={partners}
                                            value={selectedReceiver}
                                            onChange={setSelectedReceiver}
                                            placeholder="Select Receiver"
                                            disabled={!selectedVolume}
                                            icon={<Server size={16} />}
                                        />
                                    </div>

                                    {/* Tabbed Interface */}
                                    <div className="mt-5 overflow-hidden rounded-lg border border-border bg-surface-muted">
                                        <div className="flex border-b border-border bg-surface">
                                            {[
                                                { id: 'Once', icon: <Zap size={14} />, label: 'Once' },
                                                { id: 'Minutely', icon: <Clock size={14} />, label: 'Minutely' },
                                                { id: 'Hourly', icon: <Clock size={14} />, label: 'Hourly' },
                                                { id: 'Weekly', icon: <Calendar size={14} />, label: 'Weekly' }
                                            ].map(tab => (
                                                <button
                                                    key={tab.id}
                                                    type="button"
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === tab.id
                                                            ? 'bg-surface text-brand-600 border-b-2 border-brand-600'
                                                            : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                                                        }`}
                                                >
                                                    {tab.icon}
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="p-6 space-y-6 bg-white/50">
                                            {activeTab === 'Once' && (
                                                <Input
                                                    label="Snapshot Alias"
                                                    value={onceName}
                                                    onChange={(e) => setOnceName(e.target.value)}
                                                    placeholder="e.g. initial_seed"
                                                    icon={<Zap size={16} />}
                                                />
                                            )}

                                            {activeTab === 'Minutely' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <Input
                                                        label="Frequency (Minutes)"
                                                        type="number"
                                                        value={minutelyEvery}
                                                        onChange={(e) => setMinutelyEvery(e.target.value)}
                                                        min="1"
                                                        max="59"
                                                    />
                                                    <Input
                                                        label="Retention Count"
                                                        type="number"
                                                        value={minutelyKeep}
                                                        onChange={(e) => setMinutelyKeep(e.target.value)}
                                                        min="1"
                                                    />
                                                </div>
                                            )}

                                            {activeTab === 'Hourly' && (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <Input
                                                        label="Every (Hours)"
                                                        type="number"
                                                        value={hourlyEvery}
                                                        onChange={(e) => setHourlyEvery(e.target.value)}
                                                        min="1"
                                                        max="23"
                                                    />
                                                    <Input
                                                        label="At Minute"
                                                        type="number"
                                                        value={hourlyMinute}
                                                        onChange={(e) => setHourlyMinute(e.target.value)}
                                                        min="0"
                                                        max="59"
                                                    />
                                                    <Input
                                                        label="Retention Count"
                                                        type="number"
                                                        value={hourlyKeep}
                                                        onChange={(e) => setHourlyKeep(e.target.value)}
                                                        min="1"
                                                    />
                                                </div>
                                            )}

                                            {activeTab === 'Weekly' && (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <Dropdown
                                                        label="Day"
                                                        options={[
                                                            { value: 'Sat', label: 'Saturday' },
                                                            { value: 'Sun', label: 'Sunday' },
                                                            { value: 'Mon', label: 'Monday' },
                                                            { value: 'Tue', label: 'Tuesday' },
                                                            { value: 'Wed', label: 'Wednesday' },
                                                            { value: 'Thu', label: 'Thursday' },
                                                            { value: 'Fri', label: 'Friday' }
                                                        ]}
                                                        value={weeklyDay}
                                                        onChange={setWeeklyDay}
                                                    />
                                                    <Input
                                                        label="At Time"
                                                        type="time"
                                                        value={weeklyTime}
                                                        onChange={(e) => setWeeklyTime(e.target.value)}
                                                    />
                                                    <Input
                                                        label="Retention Count"
                                                        type="number"
                                                        value={weeklyKeep}
                                                        onChange={(e) => setWeeklyKeep(e.target.value)}
                                                        min="1"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-50 overflow-visible">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            disabled={!selectedPool || !selectedVolume || !selectedReceiver || actionLoading === 'create'}
                                            icon={<PlusCircle size={16} />}
                                        >
                                            {actionLoading === 'create' ? 'Processing...' : 'Authorize Schedule'}
                                        </Button>
                                    </div>
                                </form>
                            </div>

                            <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">

                                <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 bg-surface">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                                            <Calendar size={18} />
                                        </span>
                                        <h3 className="text-base font-semibold text-gray-800">Active Schedules</h3>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-gray-600">
                                        {[...snapshotsInfo.Minutelyperiod, ...snapshotsInfo.Hourlyperiod, ...snapshotsInfo.Weeklyperiod].filter(p => p.receiver !== 'NoReceiver').length} Active
                                    </span>
                                </div>

                                <div className="p-0 overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-border bg-surface-muted">
                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">ID / Frequency</th>
                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Volume</th>
                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Receiver</th>
                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Details</th>
                                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {['Minutelyperiod', 'Hourlyperiod', 'Weeklyperiod'].flatMap(type =>
                                                snapshotsInfo[type].filter(p => p.receiver !== 'NoReceiver').map((period, idx) => (
                                                    <tr key={period.id} className="hover:bg-gray-50/60 transition-colors">
                                                        <td className="px-5 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-medium text-gray-700">{period.id}</span>
                                                                <span className="text-[10px] text-brand-500 font-semibold uppercase tracking-tight">
                                                                    {period.id.startsWith('M') ? 'Minutely' : period.id.startsWith('H') ? 'Hourly' : 'Weekly'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <span className="text-xs font-medium text-gray-600">{period.volume.split('_')[0]}</span>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-brand-50 text-brand-600 text-xs font-medium">
                                                                {period.receiver}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-medium text-gray-500">
                                                                    {period.stime ? `${period.every} @ ${period.stime}` : period.sminute !== undefined ? `Every ${period.every}h (Min: ${period.sminute})` : `Every ${period.every}m`}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Keep: {period.keep}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-4 text-right">
                                                            <button
                                                                onClick={() => handleDelete(period.id, 'schedule')}
                                                                disabled={actionLoading === `delete-${period.id}`}
                                                                className="w-9 h-9 rounded-md bg-danger-50 text-danger-500 flex items-center justify-center hover:bg-danger-500 hover:text-white transition-all shadow-xs"
                                                            >
                                                                {actionLoading === `delete-${period.id}` ? (
                                                                    <div className="w-4 h-4 border-2 border-danger-200 border-t-danger-500 rounded-full animate-spin"></div>
                                                                ) : <Trash2 size={14} />}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                            {[...snapshotsInfo.Minutelyperiod, ...snapshotsInfo.Hourlyperiod, ...snapshotsInfo.Weeklyperiod].filter(p => p.receiver !== 'NoReceiver').length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="px-8 py-20 text-center">
                                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                                            <Clock size={40} className="text-gray-400" />
                                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Active Schedules</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* Recent Replacements List */}
                            <div className="bg-surface rounded-lg shadow-sm border border-border relative group overflow-visible mb-6">
                                <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-surface-muted rounded-t-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-md bg-success-50 text-success-600 flex items-center justify-center">
                                            <Zap size={18} />
                                        </div>
                                        <h3 className="text-base font-semibold text-gray-800">Recent Snapshots</h3>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-gray-600">
                                        Latest 10
                                    </span>
                                </div>

                                <div className="p-0 overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-surface-muted">
                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-border">Timestamp</th>
                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-border">Volume / Target</th>
                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-border">Alias</th>
                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-border text-center">Resource</th>
                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-border text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {snapshotsInfo.allsnaps.filter(s => s.partnerR && s.partnerR !== 'NoReceiver').slice(0, 10).map((snap, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-8 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-gray-700">{snap.date}</span>
                                                            <span className="text-[10px] text-gray-400 font-medium tracking-tight">{snap.time}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-gray-600 truncate max-w-[150px]">{snap.volume.split('_')[0]}</span>
                                                            <span className="text-[10px] text-brand-500 font-semibold uppercase tracking-tight">→ {snap.partnerR.split('_')[0]}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <span className="text-xs font-semibold text-brand-600 truncate max-w-[150px] inline-block">
                                                            {snap.name.split('.')[0]}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-4 text-center">
                                                        <div className="flex flex-col items-center">
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
                                                                onClick={() => handleDelete(snap.name, 'snapshot')}
                                                                className="w-9 h-9 rounded-md bg-danger-50 text-danger-500 flex items-center justify-center hover:bg-danger-500 hover:text-white transition-all shadow-xs"
                                                                title="Delete snapshot"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {snapshotsInfo.allsnaps.filter(s => s.partnerR && s.partnerR !== 'NoReceiver').length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="px-8 py-20 text-center">
                                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                                            <Zap size={40} className="text-gray-400" />
                                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Recent Snapshots</p>
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

export default QSender;
