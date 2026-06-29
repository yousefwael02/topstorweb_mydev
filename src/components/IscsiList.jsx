import React, { useState } from 'react';

const IscsiList = ({ volumes, onUpdate, onDelete }) => {
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({});

    const handleEdit = (vol) => {
        setEditingId(vol.name);
        setEditValues({
            ipaddress: vol.ipaddress,
            portalport: vol.portalport,
            initiators: (vol.initiators || '').replaceAll(',', '\n')
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValues({});
    };

    const handleSave = (volName) => {
        onUpdate(volName, {
            ...editValues,
            // Format initiators back to comma separated string before saving
            initiators: editValues.initiators.replaceAll('\n', ',').replaceAll(' ', ',').replaceAll(/,{2,}/g, ',')
        });
        setEditingId(null);
    };

    const handleChange = (field, value) => {
        setEditValues(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm mb-8">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
                <div>
                    <h3 className="text-gray-800 font-bold tracking-tight">iSCSI LUN List</h3>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Block-level Storage Targets</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <th className="px-5 py-4">LUN / Target</th>
                            <th className="px-5 py-4">Pool</th>
                            <th className="px-5 py-4 text-center">Size</th>
                            <th className="px-5 py-4 text-center">Snaps</th>
                            <th className="px-5 py-4 text-center">Comp %</th>
                            <th className="px-5 py-4">IP:Port</th>
                            <th className="px-5 py-4">Allowed Initiators</th>
                            <th className="px-5 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {volumes.map((vol) => (
                            <tr key={vol.name} className="hover:bg-blue-50/30 transition-colors group/row">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                                            <i className="fas fa-database text-xs"></i>
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">{vol.name.split('_')[0]}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-xs font-bold text-gray-500">{vol.pool.split('p')[2]}</span>
                                </td>
                                <td className="px-6 py-5 text-center text-sm font-medium text-gray-600">{vol.used || 'n/a'}</td>
                                <td className="px-6 py-5 text-center text-sm font-medium text-gray-600">{vol.usedbysnapshots || 'n/a'}</td>
                                <td className="px-6 py-5 text-center text-sm font-medium text-gray-600 font-mono italic">{vol.refcompressratio || 'n/a'}</td>
                                <td className="px-6 py-5">
                                    {editingId === vol.name ? (
                                        <div className="flex flex-col gap-1">
                                            <input
                                                type="text"
                                                value={editValues.ipaddress}
                                                onChange={(e) => handleChange('ipaddress', e.target.value)}
                                                className="w-32 px-2 py-1 text-xs border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="IP"
                                            />
                                            <input
                                                type="number"
                                                value={editValues.portalport}
                                                onChange={(e) => handleChange('portalport', e.target.value)}
                                                className="w-20 px-2 py-1 text-xs border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="Port"
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-sm font-medium text-gray-600">{vol.ipaddress}:{vol.portalport}</span>
                                    )}
                                </td>
                                <td className="px-6 py-5 max-w-xs">
                                    {editingId === vol.name ? (
                                        <textarea
                                            value={editValues.initiators}
                                            onChange={(e) => handleChange('initiators', e.target.value)}
                                            className="w-full px-2 py-1 text-xs border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[60px]"
                                            placeholder="IQN1&#10;IQN2..."
                                        />
                                    ) : (
                                        <div className="flex flex-wrap gap-1">
                                            {(vol.initiators || '').split(',').filter(Boolean).map((iqn, idx) => (
                                                <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded text-[9px] font-bold border border-gray-50 truncate" title={iqn}>
                                                    {iqn}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                        {editingId === vol.name ? (
                                            <>
                                                <button onClick={() => handleSave(vol.name)} className="p-2 text-emerald-500 hover:bg-success-50 rounded-lg transition-colors" title="Save">
                                                    <i className="fas fa-check"></i>
                                                </button>
                                                <button onClick={handleCancel} className="p-2 text-danger-500 hover:bg-danger-50 rounded-lg transition-colors" title="Cancel">
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEdit(vol)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button onClick={() => onDelete(vol.name)} className="p-2 text-danger-500 hover:bg-danger-50 rounded-lg transition-colors" title="Delete">
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {volumes.length === 0 && (
                    <div className="py-16 text-center text-sm text-gray-400">No iSCSI LUNs found</div>
                )}
            </div>
        </div>
    );
};

export default IscsiList;
