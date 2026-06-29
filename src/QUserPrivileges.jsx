import React, { useState, useEffect, useCallback } from 'react';
import { fetchUserList, updateUserPrivileges } from './api/users';
import Button from './components/Common/Button';
import Dropdown from './components/Common/Dropdown';

const QUserPrivileges = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [privileges, setPrivileges] = useState({});
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const privilegeList = [
        { id: 'Active_Directory', label: 'Active Directory', icon: 'fab fa-windows' },
        { id: 'Service_Charts', label: 'Performance Charts', icon: 'far fa-chart-bar' },
        { id: 'NFS', label: 'NFS', icon: 'fab fa-linux' },
        { id: 'SnapShots', label: 'Snapshots', icon: 'fas fa-camera' },
        { id: 'Box_Users', label: 'Users & Groups', icon: 'fas fa-users' },
        { id: 'Logs', label: 'Logs', icon: 'fas fa-clipboard-list' },
        { id: 'UserPrivilegesch', label: 'User Privileges', icon: 'fas fa-unlock-alt' },
        { id: 'Cluster', label: 'Cluster Nodes', icon: 'fas fa-server' },
        { id: 'Error', label: 'Node Config.', icon: 'fas fa-exclamation-triangle' },
        { id: 'CIFS', label: 'CIFS', icon: 'fab fa-windows' },
        { id: 'DiskGroups', label: 'Disk Groups', icon: 'fas fa-database' },
        { id: 'Partners', label: 'Partners', icon: 'fas fa-hands-helping' },
        { id: 'Senders', label: 'Senders', icon: 'fab fa-perbyte' },
        { id: 'Replication', label: 'Replication', icon: 'far fa-clone' },
        { id: 'Uploadch', label: 'Firmware', icon: 'fas fa-pen-fancy' },
        { id: 'HOME', label: 'Home Folders', icon: 'fas fa-house-user' },
        { id: 'ISCSI', label: 'ISCSI LUNs', icon: 'fas fa-database' },
    ];

    const syncUserPrivileges = useCallback((users, userId) => {
        if (userId === null || !users[userId]) return;
        const userAuths = users[userId].priv || [];
        const newPrivs = {};
        privilegeList.forEach(p => {
            newPrivs[p.id] = userAuths.includes(`${p.id}-true`);
        });
        setPrivileges(newPrivs);
    }, []);

    const loadUsers = useCallback(async (isInitial = false) => {
        try {
            const res = await fetchUserList();
            const users = res.data.allusers || [];

            // Check for changes before updating state to avoid re-renders
            if (JSON.stringify(users.map(u => ({ n: u.name, p: u.priv }))) !==
                JSON.stringify(allUsers.map(u => ({ n: u.name, p: u.priv })))) {
                setAllUsers(users);

                if (isInitial && users.length > 0) {
                    setSelectedUserId(0);
                    syncUserPrivileges(users, 0);
                } else if (selectedUserId !== null) {
                    syncUserPrivileges(users, selectedUserId);
                }
            }
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            if (isInitial) setLoading(false);
        }
    }, [allUsers, selectedUserId, syncUserPrivileges]);

    useEffect(() => {
        loadUsers(true);
        const interval = setInterval(() => loadUsers(), 2000);
        return () => clearInterval(interval);
    }, [loadUsers]);

    const handleUserChange = (val) => {
        setSelectedUserId(val);
        syncUserPrivileges(allUsers, val);
    };

    const togglePrivilege = (id) => {
        setPrivileges(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleUpdate = async () => {
        if (selectedUserId === null || !allUsers[selectedUserId]) return;

        setUpdating(true);
        setMessage({ text: '', type: '' });

        try {
            const authString = privilegeList
                .map(p => `${p.id}-${privileges[p.id] || false}`)
                .join(',');

            await updateUserPrivileges(allUsers[selectedUserId].name, authString);
            setMessage({ text: 'Privileges updated successfully', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            console.error("Update failed", err);
            setMessage({ text: 'Failed to update privileges', type: 'error' });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    const dropdownOptions = allUsers.map((u, i) => ({ label: u.name, value: i }));

    return (
        <div className="p-3 sm:p-5">
            <div className="rounded-xl border border-border bg-surface p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Granular User Privileges Management</h1>
                        <p className="mt-1 text-sm text-gray-500">Define precise administrative access for system operators</p>
                    </div>
                    <button
                        onClick={() => loadUsers()}
                        className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-xs hover:bg-gray-50 hover:text-brand-600"
                    >
                        <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="mt-6 space-y-6">
                <div className="overflow-hidden rounded-lg border border-border bg-surface p-6 shadow-sm">
                            <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-brand-500 rounded-l-lg shadow-sm"></div>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center">
                                        <i className="fas fa-shield-alt text-xs"></i>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 tracking-tight">Privilege Manifest</h3>
                                </div>
                                <div className="w-full md:w-72">
                                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 ml-1 mb-2 block">Operating Identity</label>
                                    <Dropdown
                                        options={dropdownOptions}
                                        value={selectedUserId}
                                        onChange={handleUserChange}
                                        placeholder="Select User..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
                                {privilegeList.map((p) => (
                                    <div
                                        key={p.id}
                                        onClick={() => togglePrivilege(p.id)}
                                        className={`group cursor-pointer p-4 rounded-lg border transition-all duration-200 flex items-center gap-4 ${privileges[p.id]
                                            ? 'bg-brand-600 border-brand-600 shadow-md'
                                            : 'bg-gray-50/50 border-transparent hover:border-brand-100 hover:bg-white hover:shadow-sm'
                                            }`}
                                    >
                                        <div className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors ${privileges[p.id] ? 'bg-white/20' : 'bg-white group-hover:bg-brand-50'
                                            }`}>
                                            <i className={`${p.icon} text-sm ${privileges[p.id] ? 'text-white' : 'text-gray-400 group-hover:text-brand-600'}`}></i>
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-xs font-semibold uppercase tracking-wide ${privileges[p.id] ? 'text-white' : 'text-gray-600'}`}>
                                                {p.label}
                                            </p>
                                        </div>
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${privileges[p.id] ? 'bg-white border-white' : 'border-gray-200 bg-white'
                                            }`}>
                                            {privileges[p.id] && <i className="fas fa-check text-[8px] text-brand-600"></i>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-50">
                                <div className="flex items-center gap-4">
                                    {message.text && (
                                        <div className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium ${message.type === 'success' ? 'bg-success-50 text-success-600 border border-success-100' : 'bg-danger-50 text-danger-600 border border-danger-100'
                                            }`}>
                                            <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                                            {message.text}
                                        </div>
                                    )}
                                </div>
                                <Button
                                    onClick={handleUpdate}
                                    disabled={updating || selectedUserId === null}
                                    variant="primary"
                                    className="w-full sm:w-auto flex items-center justify-center gap-3"
                                >
                                    {updating ? (
                                        <>
                                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Syncing...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-cloud-upload-alt text-[10px]"></i>
                                            Update Privileges
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                </div>
            </div>
        </div>
    );
};

export default QUserPrivileges;
