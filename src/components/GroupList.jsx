import React from 'react';
import Dropdown from './Common/Dropdown';

const GroupList = ({ groups, users, onUpdateMembers, onDelete }) => {
    return (
        <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                        <i className="fas fa-users" />
                    </span>
                    <div>
                        <h3 className="text-base font-semibold text-gray-800">System Groups Directory</h3>
                        <p className="text-sm text-gray-500">Permissions &amp; access control</p>
                    </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-gray-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
                    {groups.length} groups
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border bg-surface-muted">
                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Group Name</th>
                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Members</th>
                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {groups.map((group) => (
                            <GroupRow
                                key={group.name}
                                group={group}
                                allUsers={users}
                                onUpdateMembers={onUpdateMembers}
                                onDelete={onDelete}
                            />
                        ))}
                        {groups.length === 0 && (
                            <tr>
                                <td colSpan="3" className="text-center py-16 text-sm text-gray-400">
                                    No groups found in system
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

const GroupRow = ({ group, allUsers, onUpdateMembers, onDelete }) => {
    // API always returns group.users as an integer array: [1,3] or ["NoUser"]
    const initialMembers = React.useMemo(() => {
        if (!group.users) return [];
        const arr = Array.isArray(group.users) ? group.users : [group.users];
        return arr.map(String).filter(u => u !== '' && u !== 'NoUser');
    }, [group.users]);

    const [selectedUsers, setSelectedUsers] = React.useState(initialMembers);
    const [hasChanges, setHasChanges] = React.useState(false);

    // Stable key derived from server data — changes only when server membership actually changes,
    // not on every poll cycle that creates new array references with same content.
    const usersKey = React.useMemo(() => [...initialMembers].sort().join(','), [initialMembers]);

    React.useEffect(() => {
        setSelectedUsers(initialMembers);
        setHasChanges(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usersKey]);

    const handleUserChange = (values) => {
        setSelectedUsers(values);
        const sorted = (arr) => [...arr].map(String).sort().join(',');
        setHasChanges(sorted(values) !== sorted(initialMembers));
    };

    const handleUpdate = () => {
        onUpdateMembers(group.name, selectedUsers.join(','));
        setHasChanges(false);
    };

    const isEveryoneGroup = group.name === 'Everyone';

    return (
        <tr className="hover:bg-gray-50/60 transition-colors">
            <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600 text-xs">
                        <i className="fas fa-users" />
                    </span>
                    <span className="font-medium text-gray-800">{group.name}</span>
                </div>
            </td>
            <td className="px-5 py-4 min-w-[280px]">
                <div className="flex items-center gap-2">
                    <div className="flex-1">
                        <Dropdown
                            isMulti
                            options={allUsers.map(user => ({ value: String(user.id), label: user.text }))}
                            value={selectedUsers}
                            onChange={handleUserChange}
                            disabled={isEveryoneGroup}
                            placeholder="Select Users…"
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
            <td className="px-5 py-4 text-right">
                <button
                    onClick={() => onDelete(group.name)}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-md bg-gray-50 transition-colors ${
                        isEveryoneGroup
                            ? 'cursor-not-allowed opacity-30'
                            : 'text-gray-400 hover:border hover:border-danger-100 hover:bg-danger-50 hover:text-danger-600'
                    }`}
                    disabled={isEveryoneGroup}
                >
                    <i className="fas fa-trash-alt" />
                </button>
            </td>
        </tr>
    );

};

export default GroupList;
