import React, { useState } from 'react';
import { ChevronDown, Users } from 'lucide-react';
import Button from './Common/Button';
import Input from './Common/Input';
import Dropdown from './Common/Dropdown';

const AddGroupForm = ({ users, onAdd }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [formData, setFormData] = useState({
        Group: '',
        GroupUsers: []
    });

    const handleChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            name: formData.Group,
            users: formData.GroupUsers.join(','),
            Myname: 'mezo'
        };
        onAdd(data);
        // Reset form
        setFormData({ Group: '', GroupUsers: [] });
    };

    const canSubmit = formData.Group.length > 2;

    return (
        <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
            <div
                className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <ChevronDown className={`h-[18px] w-[18px] text-gray-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                        <Users className="h-[18px] w-[18px]" />
                    </span>
                    <div>
                        <h3 className="text-base font-semibold text-gray-800">Create New Group</h3>
                        <p className="text-sm text-gray-500">Permission management</p>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="p-5">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Group Name"
                                placeholder="e.g. developers"
                                id="Group"
                                value={formData.Group}
                                onChange={(e) => handleChange('Group', e.target.value)}
                                icon={<Users size={16} />}
                            />

                            <Dropdown
                                label="Initial Members"
                                isMulti
                                options={users.map(user => ({ value: String(user.id), label: user.text }))}
                                value={formData.GroupUsers}
                                onChange={(val) => handleChange('GroupUsers', val)}
                            />
                        </div>

                        <div className="flex justify-end items-center border-t border-border pt-4">
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full sm:w-auto"
                                disabled={!canSubmit}
                                icon={<i className="fas fa-plus-circle" />}
                                onClick={handleSubmit}
                            >
                                Create Group
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </section>
    );
};

export default AddGroupForm;
