import React, { useState, useEffect, useCallback } from 'react';
import { fetchVolumesInfo, fetchGroupList, createVolume, updateVolume, deleteVolume, fetchVolumeStats } from './api/volumes';
import { fetchPoolsInfo } from './api/pools';
import Button from './components/Common/Button';
import Input from './components/Common/Input';
import Dropdown from './components/Common/Dropdown';
import NfsList from './components/NfsList';
import VolumeInsights from './components/VolumeInsights';

const QNfs = () => {
    const [volumes, setVolumes] = useState([]);
    const [pools, setPools] = useState([]);
    const [groups, setGroups] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        pool: '',
        name: '',
        size: 1,
        ipaddress: '',
        Subnet: 24,
        groups: [],
        rootname: 'root',
        rootid: 0,
        groupname: 'root',
        groupid: 0,
        active: true
    });

    const loadData = useCallback(async () => {
        try {
            const [volsRes, poolsRes, groupsRes, statsRes] = await Promise.all([
                fetchVolumesInfo('NFS'),
                fetchPoolsInfo(),
                fetchGroupList(),
                fetchVolumeStats().catch(() => ({ data: {} }))
            ]);

            setVolumes(volsRes.data.allvolumes || []);
            setPools(poolsRes.data.results || []);
            setGroups(groupsRes.data.results || []);
            setStats(statsRes.data);
        } catch (err) {
            console.error("Failed to load NFS data", err);
            setError("Failed to synchronize with volumes API");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000);
        return () => clearInterval(interval);
    }, [loadData]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const poolObj = pools[formData.pool];
            const payload = {
                type: 'NFS',
                pool: poolObj.text,
                name: formData.name,
                ipaddress: formData.ipaddress,
                Subnet: formData.Subnet,
                groups: formData.groups.join(','),
                Myname: 'mezo',
                size: `${formData.size}G`,
                owner: poolObj.owner,
                rootname: formData.rootname,
                rootid: formData.rootid,
                groupname: formData.groupname,
                groupid: formData.groupid,
                active: formData.active ? 'active' : 'false'
            };

            await createVolume(payload);
            setFormData({
                ...formData,
                pool: '',
                name: '',
                size: 1,
                groups: []
            });
            loadData();
        } catch (err) {
            setError("Failed to create volume");
        }
    };

    const handleUpdate = async (volName, values) => {
        try {
            await updateVolume({
                volume: volName,
                type: 'NFS',
                ...values
            });
            loadData();
        } catch (err) {
            setError("Failed to update volume");
        }
    };

    const handleDelete = async (volName) => {
        if (!window.confirm(`Are you sure you want to delete volume ${volName}?`)) return;
        try {
            await deleteVolume({ name: volName, type: 'NFS', user: 'mezo' });
            loadData();
        } catch (err) {
            setError("Failed to delete volume");
        }
    };

    return (
        <div className="p-3 sm:p-5">
            <div className="rounded-xl border border-border bg-surface p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">NFS Volume Management</h1>
                        <p className="mt-1 text-sm text-gray-500">Unix-compatible network share administration</p>
                    </div>
                    <button
                        onClick={loadData}
                        className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-xs hover:bg-gray-50 hover:text-brand-600"
                    >
                        <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {error && (
                    <div className="mt-4 flex items-center gap-3 rounded-md border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-600">
                        <i className="fas fa-exclamation-triangle" />
                        {error}
                    </div>
                )}

                <div className="mt-6 space-y-6">
                {/* First Row: Form + Insights */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Creation Form */}
                            <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                                        <i className="fas fa-plus text-xs" />
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-800 tracking-tight">New Volume</h3>
                                </div>

                                <form onSubmit={handleCreate} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <Dropdown
                                            label="Storage Pool"
                                            options={pools.map((p, idx) => ({ value: idx, label: p.text }))}
                                            value={formData.pool}
                                            placeholder="Select Pool..."
                                            onChange={(val) => setFormData({ ...formData, pool: val })}
                                        />
                                        <Input
                                            label="Volume Name"
                                            required
                                            placeholder="Share name..."
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                label="Root Name"
                                                required
                                                value={formData.rootname}
                                                onChange={(e) => setFormData({ ...formData, rootname: e.target.value })}
                                            />
                                            <Input
                                                label="Root ID"
                                                type="number"
                                                min="0"
                                                required
                                                value={formData.rootid}
                                                onChange={(e) => setFormData({ ...formData, rootid: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                label="Group Name"
                                                required
                                                value={formData.groupname}
                                                onChange={(e) => setFormData({ ...formData, groupname: e.target.value })}
                                            />
                                            <Input
                                                label="Group ID"
                                                type="number"
                                                min="0"
                                                required
                                                value={formData.groupid}
                                                onChange={(e) => setFormData({ ...formData, groupid: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <Input
                                            label="IP Address"
                                            required
                                            placeholder="192.168.1.10"
                                            value={formData.ipaddress}
                                            onChange={(e) => setFormData({ ...formData, ipaddress: e.target.value })}
                                        />
                                        <div className="grid grid-cols-3 gap-4">
                                            <Input
                                                label="Subnet"
                                                type="number"
                                                min="8" max="32" step="8"
                                                required
                                                value={formData.Subnet}
                                                onChange={(e) => setFormData({ ...formData, Subnet: e.target.value })}
                                            />
                                            <Input
                                                label="Size (GB)"
                                                type="number"
                                                min="1"
                                                required
                                                value={formData.size}
                                                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                            />
                                            <div className="flex flex-col items-center justify-end pb-3">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Active</label>
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 rounded border-gray-200 text-brand-600 focus:ring-brand-500 transition-all cursor-pointer"
                                                    checked={formData.active}
                                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Dropdown
                                            label="Allowed Groups"
                                            isMulti
                                            options={groups.map(g => ({ value: g.text, label: g.text }))}
                                            value={formData.groups}
                                            placeholder="Select Groups..."
                                            onChange={(val) => setFormData({ ...formData, groups: val })}
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                        variant="primary"
                                            onClick={handleCreate}
                                        >
                                            Provision Volume
                                        </Button>
                                    </div>
                                </form>
                            </div>

                            {/* Volume Insights Replacement for Pie Chart */}
                            <VolumeInsights volumes={volumes} />
                        </div>

                        {/* Second Row: Volume List */}
                        <div className="w-full">
                            <NfsList
                                volumes={volumes}
                                groups={groups}
                                onUpdate={handleUpdate}
                                onDelete={handleDelete}
                            />
                        </div>
                </div>
            </div>
        </div>
    );
};

export default QNfs;
