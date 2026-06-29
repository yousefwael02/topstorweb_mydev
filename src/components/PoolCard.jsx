import React, { useState } from 'react';
import DiskIcon from './DiskIcon';
import Button from './Common/Button';

const PoolCard = ({
    poolName,
    data,
    allDisks,
    allRaids,
    newRaidOptions,
    onAddDisks,
    onDeletePool,
    onDiskAction
}) => {
    const [deleteStep, setDeleteStep] = useState(0); // 0: Idle, 1: Delete?, 2: Really?, 3: Confirm
    const [selectedRedundancy, setSelectedRedundancy] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedDiskId, setSelectedDiskId] = useState(null);

    const { available, used, dedup, raids = [], volumes = [] } = data;
    const totalSize = (parseFloat(available) + parseFloat(used)).toFixed(2);

    // Determine redundancy type and color — mirrors legacy Qdg.js initdgs() health logic
    let redundancyText = "Highly Available";
    let redundancyColor = "text-brand-600";

    const isRaid = raids.some(r => r.includes('raidz') || r.includes('mirror'));

    if (raids.some(r => r.includes('strip'))) {
        redundancyText = "No Redundancy";
        redundancyColor = "text-danger-500";
    } else {
        let balanced = ", balanced";
        for (const raidId of raids) {
            const raidData = allRaids[raidId];
            if (raidData?.missingdisks?.[0] != 0) {
                redundancyColor = "text-danger-500";
                balanced = ", missing disks";
                break;
            }
            if (raidData?.raidrank?.[0] < 0) {
                redundancyColor = "text-warning-500";
                balanced = ", not balanced";
                break;
            }
        }
        redundancyText = redundancyText + balanced;
    }

    const handleAdd = () => {
        if (!selectedRedundancy || !selectedSize) return;
        onAddDisks(poolName, selectedRedundancy, selectedSize);
        setSelectedRedundancy(null);
        setSelectedSize(null);
    };

    const handleRedundancySelect = (type, firstSize) => {
        setSelectedRedundancy(type);
        setSelectedSize(firstSize);
    };

    return (
        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm mb-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border px-5 py-4">
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                        <i className="fas fa-database" />
                    </span>
                    <div>
                        <h3 className="text-base font-semibold text-gray-800">Pool: <span className="text-brand-600">{poolName}</span></h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs font-medium ${redundancyColor}`}>{redundancyText}</span>
                            <span className="h-1 w-1 rounded-full bg-gray-300" />
                            <span className="text-xs text-gray-400">Dedup: {dedup}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-5 rounded-md border border-border bg-surface-muted px-5 py-2">
                    <div className="text-center">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-0.5">Total Size</p>
                        <p className="text-base font-bold text-gray-800">{totalSize}GB</p>
                    </div>
                    <div className="w-px h-7 bg-border" />
                    <div className="text-center">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-0.5">Used</p>
                        <p className="text-base font-bold text-brand-600">{used}GB</p>
                    </div>
                </div>
            </div>

            <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {raids.map(raidId => {
                    const raidDisks = allRaids[raidId]?.disks || [];
                    const realDisks = raidDisks.filter(diskId => !allDisks[diskId]?.name?.includes('dm-'));
                    const missingCount = Math.max(0, raidDisks.reduce((count, diskId) => {
                        if (allDisks[diskId]?.name?.includes('dm-')) return count + 1;
                        if (!allDisks[diskId]?.changeop?.includes('ONLINE')) return count - 1;
                        return count;
                    }, 0));
                    const raidHasMissing = missingCount > 0;

                    return (
                        <div key={raidId} className={`rounded-lg border p-4 ${raidHasMissing ? 'border-danger-200 bg-danger-50/30' : 'border-border bg-surface-muted'}`}>
                            <div className="flex items-center justify-between mb-3">
                                <span className={`text-xs font-semibold uppercase tracking-wide ${raidHasMissing ? 'text-danger-500' : 'text-gray-500'}`}>{raidId.split('_')[0]}</span>
                                <div className={`h-2 w-2 rounded-full ${raidHasMissing ? 'bg-danger-400' : 'bg-success-400'}`} />
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                {realDisks.map(diskId => (
                                    <DiskIcon
                                        key={diskId}
                                        diskId={diskId}
                                        data={allDisks[diskId]}
                                        isSelected={selectedDiskId === diskId}
                                        onClick={() => setSelectedDiskId(prev => prev === diskId ? null : diskId)}
                                        showActions={true}
                                        onAction={(action) => onDiskAction(diskId, action)}
                                    />
                                ))}
                                {Array.from({ length: missingCount }).map((_, i) => (
                                    <div key={`missing-${i}`} className="flex flex-col items-center rounded-md border border-danger-200 bg-danger-50/30 p-2">
                                        <img src="img/invaliddisk.png" alt="missing disk" className="w-10 h-10 object-contain opacity-50" />
                                        <span className="text-[9px] font-semibold text-danger-400 mt-1 uppercase tracking-tight">missing</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="rounded-lg border border-border bg-surface-muted p-5 mt-2">
                <div className="flex items-center gap-2 mb-4">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface text-brand-600">
                        <i className="fas fa-plus text-xs" />
                    </span>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-700">Expansion Options</h4>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border text-left">
                                <th className="pb-3 px-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Select</th>
                                <th className="pb-3 px-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Configuration</th>
                                <th className="pb-3 px-3 text-xs font-semibold uppercase tracking-wide text-gray-500">New Total Size</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {Object.entries(newRaidOptions).map(([type, options]) => {
                                if (Object.keys(options).length === 0) return null;
                                if (isRaid && type === 'volset') return null;
                                if (!isRaid && type !== 'volset') return null;

                                const sizes = Object.keys(options);
                                return (
                                    <tr
                                        key={type}
                                        onClick={() => handleRedundancySelect(type, sizes[0])}
                                        className={`cursor-pointer transition-colors ${selectedRedundancy === type ? 'bg-brand-50/50' : 'hover:bg-gray-50'}`}
                                    >
                                        <td className="py-3 px-3">
                                            <input
                                                type="radio"
                                                name={`${poolName}_redundancy`}
                                                className="w-4 h-4 text-brand-600 focus:ring-0 border-gray-300 cursor-pointer pointer-events-none"
                                                id={`${poolName}_${type}`}
                                                checked={selectedRedundancy === type}
                                                readOnly
                                            />
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className="text-sm font-medium text-gray-700">
                                                {type.charAt(0).toUpperCase() + type.slice(1)} Redundancy
                                            </span>
                                        </td>
                                        <td className="py-3 px-3">
                                            {sizes.length > 1 && selectedRedundancy === type ? (
                                                <select
                                                    value={selectedSize}
                                                    onChange={(e) => setSelectedSize(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="rounded-md border border-border bg-surface px-2.5 py-1 text-sm text-brand-600 focus:ring-2 focus:ring-brand-100 outline-none"
                                                >
                                                    {sizes.map(s => (
                                                        <option key={s} value={s}>
                                                            {(parseFloat(s.replace(/[^0-9.]/g, '')) + parseFloat(available)).toFixed(2)}GB
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className={`text-sm px-2.5 py-1 rounded-md transition-colors ${selectedRedundancy === type ? 'bg-surface text-brand-600' : 'bg-gray-100 text-gray-400'}`}>
                                                    {(parseFloat(sizes[0].replace(/[^0-9.]/g, '')) + parseFloat(available)).toFixed(2)}GB
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end mt-5">
                    <Button
                        onClick={handleAdd}
                        disabled={!selectedRedundancy || !selectedSize}
                        variant="primary"
                    >
                        Add to Pool
                    </Button>
                </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-border pt-4">
                <div className="text-sm text-gray-500">
                    Volumes in pool: <span className="font-medium text-brand-600">{volumes.length > 0 ? volumes.map(v => v.split('_')[0]).join(', ') : 'None'}</span>
                </div>

                <div className="flex gap-2">
                    {volumes.length > 0 ? (
                        <span className="text-xs text-gray-400">Remove volumes first to decommission</span>
                    ) : (
                        <>
                            {deleteStep === 0 && (
                                <Button onClick={() => setDeleteStep(1)} variant="ghost" size="sm">
                                    Decommission Pool
                                </Button>
                            )}
                            {deleteStep === 1 && (
                                <>
                                    <span className="text-xs font-medium text-danger-500 flex items-center">Really delete?</span>
                                    <button onClick={() => setDeleteStep(0)} className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                                    <button onClick={() => setDeleteStep(2)} className="rounded-md bg-danger-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-danger-600">Delete</button>
                                </>
                            )}
                            {deleteStep === 2 && (
                                <>
                                    <span className="text-xs font-semibold text-danger-600 flex items-center">Final confirmation needed!</span>
                                    <button onClick={() => setDeleteStep(0)} className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                                    <Button
                                        onClick={() => { setDeleteStep(0); onDeletePool(poolName); }}
                                        variant="danger"
                                        size="sm"
                                    >
                                        Confirm Destruction
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
            </div>
        </div>
    );
};

export default PoolCard;
