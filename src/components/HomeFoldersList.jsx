import React, { useState } from 'react';

const HomeFoldersList = ({ volumes, onUpdate, onDelete }) => {
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({});

    const handleEdit = (vol) => {
        setEditingId(vol.name);
        setEditValues({
            ipaddress: vol.ipaddress,
            Subnet: vol.Subnet
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValues({});
    };

    const handleSave = (volName) => {
        onUpdate(volName, editValues);
        setEditingId(null);
    };

    const handleChange = (field, value) => {
        setEditValues(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm mb-8">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
                <div>
                    <h3 className="text-gray-800 font-bold tracking-tight">Home Folders List</h3>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">User Home Directories</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <th className="px-5 py-4">User / Volume</th>
                            <th className="px-5 py-4">Pool</th>
                            <th className="px-5 py-4">Size</th>
                            <th className="px-5 py-4">Snaps</th>
                            <th className="px-5 py-4">Comp %</th>
                            <th className="px-5 py-4">IP Address</th>
                            <th className="px-5 py-4">Subnet</th>
                            <th className="px-5 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {volumes.map((vol) => (
                            <tr key={vol.name} className="hover:bg-gray-50/60 transition-colors group/row">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center">
                                            <i className="fas fa-house-user text-xs"></i>
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">{vol.name.split('_')[0]}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-xs font-bold text-gray-500">{vol.pool.split('p')[2]}</span>
                                </td>
                                <td className="px-6 py-5 text-sm font-medium text-gray-600">{vol.quota || 'n/a'}</td>
                                <td className="px-6 py-5 text-sm font-medium text-gray-600">{vol.usedbysnapshots || 'n/a'}</td>
                                <td className="px-6 py-5 text-sm font-medium text-gray-600 font-mono italic">{vol.refcompressratio || 'n/a'}</td>
                                <td className="px-6 py-5">
                                    {editingId === vol.name ? (
                                        <input
                                            type="text"
                                            value={editValues.ipaddress}
                                            onChange={(e) => handleChange('ipaddress', e.target.value)}
                                            className="w-32 px-2 py-1 text-sm border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                        />
                                    ) : (
                                        <span className="text-sm font-medium text-gray-600">{vol.ipaddress}</span>
                                    )}
                                </td>
                                <td className="px-6 py-5">
                                    {editingId === vol.name ? (
                                        <input
                                            type="number"
                                            value={editValues.Subnet}
                                            onChange={(e) => handleChange('Subnet', e.target.value)}
                                            className="w-16 px-2 py-1 text-sm border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                        />
                                    ) : (
                                        <span className="text-sm font-medium text-gray-600">{vol.Subnet}</span>
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
                                                <button onClick={() => handleEdit(vol)} className="p-2 text-brand-500 hover:bg-brand-50 rounded-lg transition-colors" title="Edit">
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
                    <div className="py-16 text-center text-sm text-gray-400">No Home folders found</div>
                )}
            </div>
        </div>
    );
};

export default HomeFoldersList;
