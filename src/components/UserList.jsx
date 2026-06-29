import React from 'react';
import Dropdown from './Common/Dropdown';

const UserList = ({ users, groups, onUpdateGroups, onChangePassword, onDelete }) => {
    return (
        <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                        <i className="fas fa-users" />
                    </span>
                    <div>
                        <h3 className="text-base font-semibold text-gray-800">System User Directory</h3>
                        <p className="text-sm text-gray-500">Local &amp; directory accounts</p>
                    </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-gray-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
                    {users.length} accounts
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                    <thead>
                        <tr className="border-b border-border bg-surface-muted">
                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">User Identity</th>
                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Storage Target</th>
                            <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Quota</th>
                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Group Assignments</th>
                            <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Security</th>
                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {users.map((user) => (
                            <UserRow
                                key={user.name}
                                user={user}
                                allGroups={groups}
                                onUpdateGroups={onUpdateGroups}
                                onChangePassword={onChangePassword}
                                onDelete={onDelete}
                            />
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-16 text-sm text-gray-400">
                                    No users found in system
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

const UserRow = ({ user, allGroups, onUpdateGroups, onChangePassword, onDelete }) => {
    // user.groups from API is always an array: ['1','3'] or ['NoGroup']
    const originalGroups = React.useMemo(() => {
        const grps = Array.isArray(user.groups) ? user.groups : (user.groups ? user.groups.split(',') : []);
        return grps.filter(g => g !== 'NoGroup');
    }, [user.groups]);

    const [selectedGroups, setSelectedGroups] = React.useState(originalGroups);
    const [hasChanges, setHasChanges] = React.useState(false);

    // Stable key derived from server data — changes only when server groups actually change,
    // not on every poll cycle that creates new array references with same content.
    const groupsKey = React.useMemo(() => [...originalGroups].sort().join(','), [originalGroups]);

    React.useEffect(() => {
        setSelectedGroups(originalGroups);
        setHasChanges(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupsKey]);

    const handleGroupChange = (values) => {
        setSelectedGroups(values);
        const sorted = (arr) => [...arr].sort().join(',');
        setHasChanges(sorted(values) !== sorted(originalGroups));
    };

    const handleUpdate = () => {
        // Map selected group IDs to text names — backend userchange accepts both but text is canonical
        const groupNames = selectedGroups.map(id => {
            const grp = allGroups.find(g => String(g.id) === String(id));
            return grp ? grp.text : id;
        });
        onUpdateGroups(user.name, groupNames.join(','));
        setHasChanges(false);
    };

    return (
        <tr className="hover:bg-gray-50/60 transition-colors">
            <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-600">
                        {user.name[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">{user.name}</span>
                </div>
            </td>
            <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-gray-300" />
                    <span className="text-sm text-gray-600">{user.Volpool || user.pool || 'N/A'}</span>
                </div>
            </td>
            <td className="px-5 py-4 text-center">
                <span className="inline-block rounded-sm border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-gray-700">
                    {user.Volsize || user.size || '0'} GB
                </span>
            </td>
            <td className="px-5 py-4 min-w-[280px]">
                <div className="flex items-center gap-2">
                    <div className="flex-1">
                        <Dropdown
                            isMulti
                            options={allGroups.map(group => ({ value: String(group.id), label: group.text }))}
                            value={selectedGroups}
                            onChange={handleGroupChange}
                            placeholder="Select Groups…"
                        />
                    </div>
                    {hasChanges && (
                        <button
                            onClick={handleUpdate}
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-success-100 bg-success-50 text-success-600 hover:bg-success-600 hover:text-white transition-colors"
                            title="Apply Changes"
                        >
                            <i className="fas fa-check" />
                        </button>
                    )}
                </div>
            </td>
            <td className="px-5 py-4 text-center">
                <button
                    onClick={() => onChangePassword(user.name)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-600 hover:text-white transition-colors"
                >
                    <i className="fas fa-shield-alt" /> Reset
                </button>
            </td>
            <td className="px-5 py-4 text-right">
                <button
                    onClick={() => onDelete(user.name)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gray-50 text-gray-400 hover:border hover:border-danger-100 hover:bg-danger-50 hover:text-danger-600 transition-colors"
                >
                    <i className="fas fa-trash-alt" />
                </button>
            </td>
        </tr>
    );
};

export default UserList;
