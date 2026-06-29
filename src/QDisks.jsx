import React, { useState, useEffect, useCallback } from 'react';
import { fetchDgsInfo, createPool, addDisksToPool, deletePool, actionOnDisk, saveCacheSpares, deleteCacheSpares } from './api/pools';
import PoolCard from './components/PoolCard';
import Button from './components/Common/Button';
import DiskIcon from './components/DiskIcon';

const QDisks = () => {
    const [dgsData, setDgsData] = useState({
        disks: {},
        pools: {},
        raids: {},
        newraid: {}
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDisks, setSelectedDisks] = useState([]);
    const [cacheDisks, setCacheDisks] = useState([]);
    const [creatingRedundancy, setCreatingRedundancy] = useState(null);
    const [creatingSize, setCreatingSize] = useState(null);
    const [includeCache, setIncludeCache] = useState(false);
    const [selectedCacheSpares, setSelectedCacheSpares] = useState([]);

    const loadData = useCallback(async () => {
        try {
            const res = await fetchDgsInfo();
            setDgsData(res.data);
            setError(null);
        } catch (err) {
            console.error("Failed to load Disk Groups", err);
            setError("Failed to synchronize with disk management service");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, [loadData]);

    const handleDiskClick = (diskId) => {
        if (selectedDisks.includes(diskId)) {
            setSelectedDisks(selectedDisks.filter(id => id !== diskId));
            setCacheDisks(cacheDisks.filter(id => id !== diskId));
        } else {
            setSelectedDisks([...selectedDisks, diskId]);
        }
        setCreatingRedundancy(null);
        setCreatingSize(null);
    };

    const handleDiskRightClick = (diskId) => {
        if (cacheDisks.includes(diskId)) {
            setCacheDisks(cacheDisks.filter(id => id !== diskId));
        } else {
            if (!selectedDisks.includes(diskId)) {
                setSelectedDisks([...selectedDisks, diskId]);
            }
            setCacheDisks([...cacheDisks, diskId]);
        }
        setCreatingRedundancy(null);
        setCreatingSize(null);
    };

    const handleCreatePool = async () => {
        if (!creatingRedundancy || !creatingSize) return;
        try {
            const dataDisks = selectedDisks.filter(id => !cacheDisks.includes(id));
            await createPool({
                redundancy: creatingRedundancy,
                useable: creatingSize,
                disks: dataDisks,
                cache: cacheDisks,
                cache_bool: includeCache,
                user: 'mezo'
            });
            setSelectedDisks([]);
            setCacheDisks([]);
            setCreatingRedundancy(null);
            setCreatingSize(null);
            loadData();
        } catch (err) {
            setError("Failed to create pool");
        }
    };

    const handleRedundancySelect = (type, firstSize) => {
        setCreatingRedundancy(type);
        setCreatingSize(firstSize);
    };

    const handleAddDisks = async (pool, redundancy, usableSize) => {
        try {
            await addDisksToPool({ pool, redundancy, useable: usableSize, user: 'mezo' });
            loadData();
        } catch (err) {
            setError("Failed to expand pool");
        }
    };

    const handleDeletePool = async (pool) => {
        try {
            await deletePool({ pool, user: 'mezo' });
            // Optimistic: remove immediately — backend deletion is async via RabbitMQ,
            // so loadData() right after would return stale data (1s cache still warm).
            setDgsData(prev => {
                const pools = { ...prev.pools };
                delete pools[pool];
                return { ...prev, pools };
            });
            loadData();
        } catch (err) {
            setError("Failed to decommission pool");
        }
    };

    const handleDiskAction = async (diskId, action) => {
        try {
            const diskData = dgsData.disks[diskId];
            await actionOnDisk({ ...diskData, action, user: 'mezo' });
            loadData();
        } catch (err) {
            setError(`Failed to perform ${action} action on disk`);
        }
    };

    const handleSaveCache = async () => {
        if (cacheDisks.length === 0) return;
        try {
            await saveCacheSpares({ cache_disks: cacheDisks, user: 'mezo' });
            setSelectedDisks([]);
            setCacheDisks([]);
            loadData();
        } catch (err) {
            setError("Failed to save cache spares");
        }
    };

    const handleRemoveCacheSpares = async () => {
        if (selectedCacheSpares.length === 0) return;
        try {
            await deleteCacheSpares({ cache_disks: selectedCacheSpares, user: 'mezo' });
            setSelectedCacheSpares([]);
            loadData();
        } catch (err) {
            setError("Failed to remove cache spares");
        }
    };

    const handleCacheSpareClick = (diskId) => {
        setSelectedCacheSpares(prev =>
            prev.includes(diskId) ? prev.filter(id => id !== diskId) : [...prev, diskId]
        );
    };

    return (
        <div className="p-3 sm:p-5">
            <div className="rounded-xl border border-border bg-surface p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Disk Infrastructure</h1>
                        <p className="mt-1 text-sm text-gray-500">Provision storage pools and manage physical disks</p>
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
                <div className="grid grid-cols-1 gap-6">
                            <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-5">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                                        <i className="fas fa-plus text-xs" />
                                    </span>
                                    <h3 className="text-base font-semibold text-gray-800">Create New Pool</h3>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-4 block">Select Physical Resources</label>
                                        <div className="p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100 h-[320px] flex flex-col justify-between">
                                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mb-4">
                                                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-5 gap-4">
                                                    {dgsData.raids.free?.disks.map(diskId => (
                                                        <DiskIcon
                                                            key={diskId}
                                                            diskId={diskId}
                                                            data={dgsData.disks[diskId]}
                                                            isSelected={selectedDisks.includes(diskId)}
                                                            isCache={cacheDisks.includes(diskId)}
                                                            onClick={handleDiskClick}
                                                            onContextMenu={handleDiskRightClick}
                                                        />
                                                    ))}
                                                    {(!dgsData.raids.free?.disks || dgsData.raids.free.disks.length === 0) && (
                                                        <div className="col-span-full py-12 text-center">
                                                            <i className="fas fa-hdd text-gray-200 text-4xl mb-4 block"></i>
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No available disks found</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                    <div className="mt-5 flex justify-between items-center rounded-md border border-border bg-surface-muted px-5 py-3">
                                                <div className="flex gap-5">
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Data</p>
                                                        <p className="text-sm font-semibold text-gray-700">{selectedDisks.length - cacheDisks.length}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Cache</p>
                                                        <p className="text-sm font-semibold text-warning-500">{cacheDisks.length}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <input 
                                                            type="checkbox" 
                                                            id="includeCache" 
                                                            checked={includeCache} 
                                                            onChange={(e) => setIncludeCache(e.target.checked)}
                                                            className="w-3.5 h-3.5 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                                                        />
                                                        <label htmlFor="includeCache" className="text-xs font-medium text-gray-500 cursor-pointer">Include Cache</label>
                                                    </div>
                                                    <Button
                                                        onClick={handleSaveCache}
                                                        disabled={cacheDisks.length === 0 || selectedDisks.length !== cacheDisks.length}
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        Save as Spare
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="mt-4 text-[10px] font-medium text-gray-400 text-center italic">
                                            <i className="fas fa-info-circle mr-1"></i> Hint: Right-click a selected disk to mark as Cache
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1 mb-3 block">Redundancy Configuration</label>
                                        <div className="overflow-hidden border border-border rounded-lg h-[320px] bg-surface flex flex-col">
                                            <div className="overflow-y-auto flex-1 custom-scrollbar">
                                                <table className="w-full text-left border-collapse">
                                                    <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm">
                                                        <tr>
                                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center border-b border-gray-100">Select</th>
                                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Efficiency</th>
                                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Usable (Est)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {(() => {
                                                            const dataDiskCount = selectedDisks.length - cacheDisks.length;
                                                            return Object.entries(dgsData.newraid).map(([type, options]) => {
                                                                // Filter options within this type to only those matching the data disk count
                                                                const filteredOptions = Object.entries(options).filter(([_, details]) =>
                                                                    details.diskcount === dataDiskCount
                                                                );

                                                                if (filteredOptions.length === 0) return null;

                                                                return (
                                                                     <tr
                                                                         key={type}
                                                                         onClick={() => handleRedundancySelect(type, filteredOptions[0][0])}
                                                                         className={`transition-colors cursor-pointer ${creatingRedundancy === type ? 'bg-brand-50/50' : 'hover:bg-gray-50'}`}
                                                                     >
                                                                         <td className="px-6 py-4">
                                                                             <input
                                                                                 type="radio"
                                                                                 name="newraid"
                                                                                 checked={creatingRedundancy === type}
                                                                                 readOnly
                                                                                 className="w-4 h-4 text-brand-600 focus:ring-0 border-gray-300 transition-all cursor-pointer pointer-events-none"
                                                                             />
                                                                         </td>
                                                                         <td className="px-6 py-4">
                                                                             <div className="flex flex-col">
                                                                                 <span className="text-sm font-bold text-gray-700">{type.toUpperCase()}</span>
                                                                                 <span className="text-[10px] text-gray-500 font-medium">
                                                                                     {type === 'single' && 'No redundancy. Data is stored on a single disk.'}
                                                                                     {type === 'mirror' && 'High availability. Data is duplicated across disks.'}
                                                                                     {type === 'raid5' && 'Single parity. Performance and safety balance.'}
                                                                                     {type === 'raid6' && 'Dual parity. Protection against two failures.'}
                                                                                     {type === 'stripe' && 'Performance only. Multi-disk striping, zero parity.'}
                                                                                 </span>
                                                                                 {(type === 'stripe' || type === 'single') && (
                                                                                     <span className="text-[9px] text-amber-600 font-black uppercase tracking-tighter mt-0.5">
                                                                                         ⚠️ No Redundancy
                                                                                     </span>
                                                                                 )}
                                                                             </div>
                                                                         </td>
                                                                         <td className="px-6 py-4">
                                                                             {filteredOptions.length > 1 && creatingRedundancy === type ? (
                                                                                 <select
                                                                                     value={creatingSize}
                                                                                     onChange={(e) => setCreatingSize(e.target.value)}
                                                                                     onClick={(e) => e.stopPropagation()}
                                                                                     className="rounded-md border border-border bg-surface px-2.5 py-1 text-sm text-brand-600 focus:ring-2 focus:ring-brand-100 outline-none"
                                                                                 >
                                                                                     {filteredOptions.map(([size]) => (
                                                                                         <option key={size} value={size}>{parseFloat(size).toFixed(2)} GB</option>
                                                                                     ))}
                                                                                 </select>
                                                                             ) : (
                                                                                 <span className={`text-sm px-2.5 py-1 rounded-md transition-colors ${creatingRedundancy === type ? 'bg-surface text-brand-600' : 'bg-gray-100 text-gray-500'}`}>
                                                                                     {parseFloat(filteredOptions[0][0]).toFixed(2)} GB
                                                                                 </span>
                                                                             )}
                                                                         </td>
                                                                     </tr>
                                                                 );
                                                            });
                                                        })()}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="mt-10 flex justify-end">
                                                <Button
                                                    onClick={handleCreatePool}
                                                    disabled={!creatingRedundancy || (selectedDisks.length - cacheDisks.length === 0)}
                                                    variant="primary"
                                                >
                                                    Create Pool
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Existing Pools — "pree" is the internal cache-spare pool, hidden like legacy */}
                                {Object.entries(dgsData.pools).filter(([name]) => !name.includes('pree')).map(([poolName, pool]) => (
                                    <PoolCard
                                        key={poolName}
                                        poolName={poolName}
                                        data={pool}
                                        allDisks={dgsData.disks}
                                        allRaids={dgsData.raids}
                                        newRaidOptions={dgsData.newraid}
                                        onAddDisks={handleAddDisks}
                                        onDeletePool={handleDeletePool}
                                        onDiskAction={handleDiskAction}
                                    />
                                ))}
                            </div>

                            {/* Spare Cache Disks — mirrors legacy #cachepools section */}
                            {dgsData.raids.cache_pree?.disks?.length > 0 && (
                                <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm p-6">
                                    <div className="flex items-center gap-3 mb-5">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-warning-50 text-warning-600">
                                            <i className="fas fa-memory text-xs" />
                                        </span>
                                        <h3 className="text-base font-semibold text-gray-800">Spare Cache Disks</h3>
                                    </div>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4 mb-8">
                                        {dgsData.raids.cache_pree.disks.map(diskId => (
                                            <DiskIcon
                                                key={diskId}
                                                diskId={diskId}
                                                data={dgsData.disks[diskId]}
                                                isSelected={selectedCacheSpares.includes(diskId)}
                                                onClick={handleCacheSpareClick}
                                            />
                                        ))}
                                    </div>
                                    <Button
                                        onClick={handleRemoveCacheSpares}
                                        disabled={selectedCacheSpares.length === 0}
                                        variant="danger"
                                    >
                                        Remove Selected Cache Spares
                                    </Button>
                                </div>
                            )}
                        </div>
                </div>
            </div>
        </div>
    );
};

export default QDisks;
