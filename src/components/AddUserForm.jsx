import React, { useState } from 'react';
import { ChevronDown, User, Key, HardDrive, Hash, UserPlus } from 'lucide-react';
import Button from './Common/Button';
import Input from './Common/Input';
import Dropdown from './Common/Dropdown';

const isValidIP = (ip) =>
    /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(ip);

const AddUserForm = ({ pools, groups, onAdd }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [formData, setFormData] = useState({
        Tenant: 'Cluster',
        User: '',
        UserPass: '',
        UserVol: 'NoHome',
        volsize: 1,
        HomeAddress: '',
        HomeSubnet: 8,
        Usergroups: []
    });

    const handleChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            name: formData.User,
            Volpool: formData.UserVol,
            groups: formData.Usergroups.join(','),
            Password: formData.UserPass,
            Volsize: formData.volsize,
            HomeAddress: formData.HomeAddress || 'NoAddress',
            HomeSubnet: formData.HomeSubnet,
            Myname: 'mezo'
        };
        onAdd(data);
    };

    const canSubmit = formData.User.length > 2 && formData.UserPass.length > 2;

    return (
        <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
            <div
                className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <ChevronDown className={`h-[18px] w-[18px] text-gray-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                        <UserPlus className="h-[18px] w-[18px]" />
                    </span>
                    <div>
                        <h3 className="text-base font-semibold text-gray-800">Create New User</h3>
                        <p className="text-sm text-gray-500">Account provisioning</p>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="p-5">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <Input
                                label="User Name"
                                placeholder="e.g. john_doe"
                                id="User"
                                value={formData.User}
                                onChange={(e) => handleChange('User', e.target.value)}
                                icon={<User size={16} />}
                            />

                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                id="UserPass"
                                value={formData.UserPass}
                                onChange={(e) => handleChange('UserPass', e.target.value)}
                                icon={<Key size={16} />}
                            />

                            <Dropdown
                                label="Home Pool"
                                options={[
                                    { value: 'NoHome', label: 'Select storage pool' },
                                    ...pools.map(pool => ({ value: pool.text, label: pool.text }))
                                ]}
                                value={formData.UserVol}
                                onChange={(val) => handleChange('UserVol', val)}
                            />

                            <Input
                                label="Quota (GB)"
                                type="number"
                                placeholder="e.g. 50"
                                id="volsize"
                                value={formData.volsize}
                                onChange={(e) => handleChange('volsize', e.target.value)}
                                icon={<HardDrive size={16} />}
                                disabled={formData.UserVol === 'NoHome'}
                            />

                            <div>
                                <Input
                                    label="IP Address Restriction"
                                    id="HomeAddress"
                                    placeholder="e.g. 192.168.1.100"
                                    value={formData.HomeAddress}
                                    onChange={(e) => handleChange('HomeAddress', e.target.value)}
                                    icon={<Hash size={16} />}
                                    disabled={formData.UserVol === 'NoHome'}
                                />
                                {formData.HomeAddress && !isValidIP(formData.HomeAddress) && (
                                    <p className="text-danger-500 text-xs mt-1 font-medium flex items-center gap-1">
                                        <i className="fas fa-exclamation-circle"></i> Invalid IP — backend will reject
                                    </p>
                                )}
                            </div>

                            <Dropdown
                                label="Allowed Groups"
                                isMulti
                                options={groups.map(group => ({ value: String(group.id), label: group.text }))}
                                value={formData.Usergroups}
                                onChange={(val) => handleChange('Usergroups', val)}
                            />
                        </div>

                        {/* Footer Actions */}
                        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-5 sm:flex-row">
                            <a className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3.5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-brand-600" href="dist/Template.xlsx" download>
                                <i className="fas fa-download" /> Download Template
                            </a>
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full sm:w-auto"
                                disabled={!canSubmit}
                                icon={<i className="fas fa-plus-circle" />}
                                onClick={handleSubmit}
                            >
                                Add System User
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </section>
    );
};

export default AddUserForm;
