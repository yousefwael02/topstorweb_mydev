import React, { useState, useEffect, useCallback } from 'react';
import { fetchPartnerList, addPartner, deletePartner } from './api/partners';
import Button from './components/Common/Button';
import Input from './components/Common/Input';
import Dropdown from './components/Common/Dropdown';
import { Users, Globe, Hash, Key, Trash2, PlusCircle, RefreshCw, HandHelping } from 'lucide-react';

const QPartners = () => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // 'add' | 'delete'
    const [message, setMessage] = useState({ text: '', type: '' });

    const [formData, setFormData] = useState({
        type: 'Sender',
        address: '',
        alias: '',
        ppass: '',
        port: '22'
    });

    const loadPartners = useCallback(async (isInitial = false) => {
        try {
            const res = await fetchPartnerList();
            const data = res.data.allpartners || [];
            // Only update if data changed to avoid unnecessary re-renders
            setPartners(prev => JSON.stringify(prev) !== JSON.stringify(data) ? data : prev);
        } catch (err) {
            console.error("Failed to load partners", err);
        } finally {
            if (isInitial) setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPartners(true);
        const interval = setInterval(() => loadPartners(), 5000);
        return () => clearInterval(interval);
    }, [loadPartners]);

    const handleInputChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const canSubmit = (
        (formData.address.length > 6 || formData.alias.length > 2) &&
        formData.alias.length > 2 &&
        formData.ppass.length > 2
    );

    const handleAddPartner = async (e) => {
        if (e) e.preventDefault();
        if (!canSubmit) return;

        setActionLoading('add');
        setMessage({ text: '', type: '' });

        try {
            await addPartner({
                ip: formData.address,
                pass: formData.ppass,
                port: formData.port,
                type: formData.type,
                alias: formData.alias
            });
            setMessage({ text: 'Partner added successfully', type: 'success' });
            setFormData({
                type: 'Sender',
                address: '',
                alias: '',
                ppass: '',
                port: '22'
            });
            loadPartners();
        } catch (err) {
            console.error("Add failed", err);
            setMessage({ text: 'Failed to add partner', type: 'error' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeletePartner = async (alias) => {
        if (!window.confirm(`Are you sure you want to remove partner ${alias}?`)) return;

        setActionLoading(`delete-${alias}`);
        try {
            await deletePartner(alias);
            setMessage({ text: 'Partner removed successfully', type: 'success' });
            loadPartners();
        } catch (err) {
            console.error("Delete failed", err);
            setMessage({ text: 'Failed to remove partner', type: 'error' });
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
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
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Partner Ecosystem</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage replication partners and secure communication channels</p>
                    </div>
                    <button
                        onClick={() => loadPartners()}
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
                            {/* New Partner Form */}
                            <div>
                                <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm p-6">

                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-9 h-9 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center">
                                            <HandHelping size={20} />
                                        </div>
                                        <h3 className="text-base font-semibold text-gray-800">Provision Partner</h3>
                                    </div>

                                    <form onSubmit={handleAddPartner} className="space-y-6">
                                        <Dropdown
                                            label="Partner Type"
                                            options={[
                                                { value: 'Sender', label: 'Sender' },
                                                { value: 'Receiver', label: 'Receiver' },
                                                { value: 'Dual way', label: 'Dual way' }
                                            ]}
                                            value={formData.type}
                                            onChange={(val) => handleInputChange('type', val)}
                                        />

                                        <Input
                                            label="Partner Alias"
                                            id="alias"
                                            placeholder="e.g. branch_office"
                                            value={formData.alias}
                                            onChange={(e) => handleInputChange('alias', e.target.value)}
                                            icon={<Users size={16} />}
                                        />

                                        <Input
                                            label="Network Address (IP/DNS)"
                                            id="address"
                                            placeholder="xxx.xxx.xxx.xxx"
                                            value={formData.address}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            icon={<Globe size={16} />}
                                        />

                                        <Input
                                            label="Port"
                                            id="port"
                                            type="number"
                                            placeholder="22"
                                            value={formData.port}
                                            onChange={(e) => handleInputChange('port', e.target.value)}
                                            icon={<Hash size={16} />}
                                        />
                                        <Input
                                            label="Access Key"
                                            id="ppass"
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.ppass}
                                            onChange={(e) => handleInputChange('ppass', e.target.value)}
                                            icon={<Key size={16} />}
                                        />

                                        <div className="pt-4 border-t border-gray-50">
                                            <Button
                                                type="submit"
                                                className="w-full"
                                                variant="primary"
                                                disabled={!canSubmit || actionLoading === 'add'}
                                                icon={<PlusCircle size={16} />}
                                                onClick={handleAddPartner}
                                            >
                                                {actionLoading === 'add' ? 'Establishing Relationship...' : 'Authorize Partner'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Partner List */}
                            <div>
                                <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">

                                    <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-surface-muted">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center">
                                                <i className="fas fa-list-ul text-xs"></i>
                                            </div>
                                            <h3 className="text-base font-semibold text-gray-800">Active Relationships</h3>
                                        </div>
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-gray-600">
                                            {partners.length} Total
                                        </span>
                                    </div>

                                    <div className="p-0 overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-surface-muted">
                                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-border">Alias</th>
                                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-border">Network Info</th>
                                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-border text-center">Type</th>
                                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-border text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {partners.map((partner, index) => (
                                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                                                        <td className="px-8 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-semibold">
                                                                    {partner.alias.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span className="font-bold text-gray-700 text-sm">{partner.alias.split('_')[0]}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-semibold text-gray-600">{partner.ip}</span>
                                                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">Port: {partner.port}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-4 text-center">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${partner.type === 'Dual way' ? 'bg-brand-50 text-brand-600 border border-brand-100' :
                                                                partner.type === 'Sender' ? 'bg-info-50 text-info-600 border border-info-100' :
                                                                    'bg-success-50 text-success-600 border border-success-100'
                                                                }`}>
                                                                {partner.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-4 text-right">
                                                            <button
                                                                onClick={() => handleDeletePartner(partner.alias)}
                                                                disabled={actionLoading === `delete-${partner.alias}`}
                                                                className="w-9 h-9 rounded-md bg-danger-50 text-danger-500 flex items-center justify-center hover:bg-danger-500 hover:text-white transition-all shadow-xs"
                                                                title="Delete Partner"
                                                            >
                                                                {actionLoading === `delete-${partner.alias}` ? (
                                                                    <div className="w-4 h-4 border-2 border-danger-200 border-t-danger-500 rounded-full animate-spin"></div>
                                                                ) : (
                                                                    <Trash2 size={14} />
                                                                )}
                                                            </button>
                                                        </td>

                                                    </tr>
                                                ))}
                                                {partners.length === 0 && (
                                                    <tr>
                                                        <td colSpan="4" className="px-8 py-20 text-center">
                                                            <div className="flex flex-col items-center gap-4">
                                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                                                                    <HandHelping size={32} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">No Partners Found</p>
                                                                    <p className="text-xs text-gray-300 font-medium mt-1">Add a relationship to start data replication</p>
                                                                </div>
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
        </div>
    );
};

export default QPartners;
