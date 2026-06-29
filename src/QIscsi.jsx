import React, { useState, useEffect, useCallback } from 'react';
import { fetchVolumesInfo, createVolume, updateVolume, deleteVolume, fetchVolumeStats } from './api/volumes';
import { fetchPoolsInfo } from './api/pools';
import Button from './components/Common/Button';
import Input from './components/Common/Input';
import Dropdown from './components/Common/Dropdown';
import IscsiList from './components/IscsiList';
import VolumeInsights from './components/VolumeInsights';

const QIscsi = () => {
    const [volumes, setVolumes] = useState([]);
    const [pools, setPools] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        poolIndex: '',
        name: '',
        ipaddress: '',
        Subnet: 24,
        size: 1,
        portalport: 3260,
        initiators: '',
        active: true,
    });

    const loadData = useCallback(async () => {
        try {
            const [volsRes, poolsRes, statsRes] = await Promise.all([
                fetchVolumesInfo('ISCSI'),
                fetchPoolsInfo(),
                fetchVolumeStats().catch(() => ({ data: {} }))
            ]);

            setVolumes(volsRes.data.allvolumes || []);
            setPools(poolsRes.data.results || []);
            setStats(statsRes.data);
        } catch (err) {
            console.error("Failed to load iSCSI data", err);
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
            const poolObj = pools[formData.poolIndex];
            const initiatorStr = formData.initiators.trim().replaceAll('\n', ',').replaceAll(' ', ',').replaceAll(/,{2,}/g, ',');
            const payload = {
                type: 'ISCSI',
                pool: poolObj.text,
                name: formData.name,
                ipaddress: formData.ipaddress,
                portalport: formData.portalport,
                Subnet: formData.Subnet,
                initiators: initiatorStr || 'This_lun_is_not_mapped',
                size: `${formData.size}G`,
                active: formData.active ? 'active' : 'false',
            };

            await createVolume(payload);
            setFormData({
                poolIndex: '',
                name: '',
                ipaddress: '',
                Subnet: 24,
                size: 1,
                portalport: 3260,
                initiators: '',
                active: true,
            });
            loadData();
        } catch (err) {
            setError("Failed to create iSCSI volume");
        }
    };

    const handleUpdate = async (volName, values) => {
        try {
            await updateVolume({
                volume: volName,
                type: 'ISCSI',
                ...values
            });
            loadData();
        } catch (err) {
            setError("Failed to update volume");
        }
    };

    const handleDelete = async (volName) => {
        if (!window.confirm(`Are you sure you want to delete LUN ${volName.split('_')[0]}?`)) return;
        try {
            await deleteVolume({ name: volName, type: 'ISCSI', user: 'mezo' });
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
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">iSCSI Volume Management</h1>
                        <p className="mt-1 text-sm text-gray-500">Enterprise block-level storage administration</p>
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
                                    <h3 className="text-lg font-bold text-gray-800 tracking-tight">Provision Block Device</h3>
                                </div>

                                <form onSubmit={handleCreate} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <Dropdown
                                            label="Storage Pool"
                                            options={pools.map((p, idx) => ({ value: idx, label: p.text }))}
                                            value={formData.poolIndex}
                                            placeholder="Select Pool..."
                                            onChange={(val) => setFormData({ ...formData, poolIndex: val })}
                                        />
                                        <Input
                                            label="LUN Name"
                                            required
                                            placeholder="LUN-01..."
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="col-span-2">
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input
                                                    label="IP Address"
                                                    required
                                                    placeholder="10.0.0.100"
                                                    value={formData.ipaddress}
                                                    onChange={(e) => setFormData({ ...formData, ipaddress: e.target.value })}
                                                />
                                                <Input
                                                    label="Subnet"
                                                    type="number"
                                                    min="8" max="32" step="8"
                                                    required
                                                    value={formData.Subnet}
                                                    onChange={(e) => setFormData({ ...formData, Subnet: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <Input
                                            label="Port"
                                            type="number"
                                            min="1024" max="65535"
                                            required
                                            value={formData.portalport}
                                            onChange={(e) => setFormData({ ...formData, portalport: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-4 gap-6">
                                        <div className="flex flex-col gap-3">
                                            <Input
                                                label="Size (GB)"
                                                type="number"
                                                min="1"
                                                required
                                                value={formData.size}
                                                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                            />
                                            <div className="flex items-center gap-2 pt-1">
                                                <input
                                                    type="checkbox"
                                                    id="iscsiActive"
                                                    className="w-4 h-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                    checked={formData.active}
                                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                                />
                                                <label htmlFor="iscsiActive" className="text-xs font-semibold text-gray-600 cursor-pointer">Active</label>
                                            </div>
                                        </div>
                                        <div className="col-span-3 text-gray-800">
                                            <Input
                                                label="Initiators IQN"
                                                isTextArea
                                                rows={2}
                                                placeholder="iqn.1993-08.org.debian:01:..."
                                                value={formData.initiators}
                                                onChange={(e) => setFormData({ ...formData, initiators: e.target.value })}
                                            />
                                            <span className="text-[9px] text-gray-400 ml-1 mt-1 block font-medium">Add IQNs separated by space, comma, or newline.</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            className="px-6 py-3 font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 transition-all hover:-translate-y-0.5"
                                            onClick={handleCreate}
                                        >
                                            Create iSCSI Target
                                        </Button>
                                    </div>
                                </form>
                            </div>

                            <VolumeInsights volumes={volumes} />
                        </div>

                        {/* Second Row: List */}
                        <div className="w-full">
                            <IscsiList
                                volumes={volumes}
                                onUpdate={handleUpdate}
                                onDelete={handleDelete}
                            />
                        </div>
                </div>
            </div>
        </div>
    );
};

export default QIscsi;
