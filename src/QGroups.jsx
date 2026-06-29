import React, { useState, useEffect, useCallback } from 'react';
import { fetchGroupList, fetchUserOptions, addGroup, deleteGroup, updateGroupUsers } from './api/groups';
import Button from './components/Common/Button';
import AddGroupForm from './components/AddGroupForm';
import GroupList from './components/GroupList';

const QGroups = () => {
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = useCallback(async () => {
        try {
            const [groupRes, userRes] = await Promise.all([
                fetchGroupList(),
                fetchUserOptions()
            ]);

            if (groupRes.data?.allgroups) setGroups(groupRes.data.allgroups);
            if (userRes.data?.results) setUsers(userRes.data.results);

        } catch (err) {
            console.error("Failed to load groups data", err);
            setError("Failed to sync with server");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 2000); // Polling every 2s to match legacy
        return () => clearInterval(interval);
    }, [loadData]);

    const handleAddGroup = async (groupData) => {
        try {
            await addGroup(groupData);
            await loadData();
        } catch (e) {
            console.error("Add group failed", e);
        }
    };

    const handleDeleteGroup = async (name) => {
        if (!window.confirm(`Are you sure you want to delete group ${name}?`)) return;
        try {
            await deleteGroup(name);
            await loadData();
        } catch (e) {
            console.error("Delete group failed", e);
        }
    };

    const handleUpdateMembers = async (name, userString) => {
        try {
            await updateGroupUsers(name, userString);
            await loadData();
        } catch (e) {
            console.error("Update group members failed", e);
        }
    };

    return (
        <div className="p-3 sm:p-5">
            <div className="rounded-xl border border-border bg-surface p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Group Management</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage system groups, permissions, and directory memberships</p>
                    </div>
                    <Button variant="secondary" onClick={loadData} icon={<i className="fas fa-sync-alt" />} className="w-full sm:w-auto">
                        Sync Now
                    </Button>
                </div>

                <div className="mt-6 space-y-6">
                    {/* Add Group Section */}
                    <AddGroupForm
                        users={users}
                        onAdd={handleAddGroup}
                    />

                    {/* Group List Section */}
                    <GroupList
                        groups={groups}
                        users={users}
                        onUpdateMembers={handleUpdateMembers}
                        onDelete={handleDeleteGroup}
                    />
                </div>
            </div>
        </div>
    );
};

export default QGroups;
