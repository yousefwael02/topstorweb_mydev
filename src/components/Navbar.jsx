import React, { useState } from 'react';
import { Bell, Maximize2, User, LogOut, Key, ChevronRight, Menu, ShieldCheck, X } from 'lucide-react';
import { changePassword } from '../api/users';

const Navbar = ({ sectionTitle, pageTitle }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [pass, setPass] = useState('');
    const [newpass, setNewpass] = useState('');
    const [passErr, setPassErr] = useState('retype the same password in both fields');
    const [passErrColor, setPassErrColor] = useState('text-gray-400');
    const [saveDisabled, setSaveDisabled] = useState(true);
    const [saving, setSaving] = useState(false);

    const validatePasswords = (p, np) => {
        if (p === np && np.length >= 3) {
            setPassErr('');
            setPassErrColor('text-gray-400');
            setSaveDisabled(false);
        } else {
            setPassErr(p === np ? 'password length is too small' : 'retype the same password in both fields');
            setPassErrColor('text-danger-500');
            setSaveDisabled(true);
        }
    };

    const handleOpenModal = () => {
        setPass('');
        setNewpass('');
        setPassErr('retype the same password in both fields');
        setPassErrColor('text-gray-400');
        setSaveDisabled(true);
        setModalOpen(true);
    };

    const handleSave = async () => {
        const username = localStorage.getItem('user');
        setSaving(true);
        try {
            await changePassword(username, pass);
            setModalOpen(false);
        } catch {
            setPassErr('Failed to change password');
            setPassErrColor('text-danger-500');
        } finally {
            setSaving(false);
        }
    };

    const openMobileSidebar = () => document.body.classList.toggle('sidebar-mobile-open');

    return (
        <>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface px-4 sm:px-6">
            {/* Breadcrumb + mobile hamburger */}
            <div className="flex min-w-0 items-center gap-2">
                <button
                    onClick={openMobileSidebar}
                    className="-ml-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-brand-600 lg:hidden"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <nav className="flex min-w-0 items-center gap-1.5 text-sm">
                    <span className="hidden truncate text-gray-500 sm:block">{sectionTitle}</span>
                    <ChevronRight className="hidden h-[15px] w-[15px] flex-shrink-0 text-gray-300 sm:block" />
                    <span className="truncate font-semibold text-gray-900">{pageTitle}</span>
                </nav>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
                {/* System status */}
                <div className="hidden items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1.5 sm:flex">
                    <div id="syncStatus" className="text-xs font-medium text-gray-600 leading-tight text-right">
                        Getting <span>Status...</span>
                    </div>
                </div>

                {/* Notifications */}
                <div className="relative group">
                    <button className="relative flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-brand-600">
                        <Bell className="h-[18px] w-[18px]" />
                        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger-500" id="tot" />
                    </button>
                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-1 hidden w-72 rounded-lg border border-border bg-surface shadow-lg group-focus-within:block z-50">
                        <div className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 bg-surface-muted">
                            Notifications (7 days)
                        </div>
                        <a href="#/logs" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50">
                            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-warning-50 text-warning-600 flex-shrink-0 text-xs">!</span>
                            <span className="font-semibold text-gray-800" id="warns">0</span>
                            <span className="text-gray-500 ml-1">Warnings</span>
                        </a>
                        <a href="#/logs" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 border-t border-border">
                            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-danger-50 text-danger-600 flex-shrink-0 text-xs">✕</span>
                            <span className="font-semibold text-gray-800" id="errs">0</span>
                            <span className="text-gray-500 ml-1">System Errors</span>
                        </a>
                        <a href="#/logs" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 border-t border-border">
                            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-50 text-brand-600 flex-shrink-0 text-xs">👤</span>
                            <span className="font-semibold text-gray-800" id="logonfails">0</span>
                            <span className="text-gray-500 ml-1">Auth Failures</span>
                        </a>
                        <a href="#/logs" className="flex items-center justify-center border-t border-border px-4 py-3 text-xs font-medium text-brand-600 hover:bg-gray-50">
                            See All Notifications
                        </a>
                    </div>
                </div>

                {/* Fullscreen */}
                <button
                    className="hidden h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-brand-600 sm:flex"
                    onClick={() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); }}
                >
                    <Maximize2 className="h-[18px] w-[18px]" />
                </button>

                <span className="hidden h-6 w-px bg-border sm:block" />

                {/* User menu */}
                <div className="relative group">
                    <button className="flex items-center gap-2.5 rounded-md py-1.5 pl-1.5 pr-2 hover:bg-gray-100">
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                            <User className="h-4 w-4" />
                        </span>
                        <span id="username" className="hidden text-sm font-semibold text-gray-800 sm:block">Admin</span>
                    </button>
                    <div className="absolute right-0 top-full mt-1 hidden w-48 rounded-lg border border-border bg-surface shadow-lg group-focus-within:block z-50 p-1">
                        <button
                            onClick={handleOpenModal}
                            id="chgpasswd"
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600"
                        >
                            <Key className="h-4 w-4 text-gray-400" />
                            Change Password
                        </button>
                        <div className="my-1 border-t border-border" />
                        <button
                            onClick={() => {
                                localStorage.setItem('token', '0');
                                window.dispatchEvent(new Event('storage'));
                            }}
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-gray-700 hover:bg-danger-50 hover:text-danger-600"
                        >
                            <LogOut className="h-4 w-4 text-gray-400" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>

        {/* Change Password Modal */}
        {modalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                        <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                                <ShieldCheck className="h-[18px] w-[18px]" />
                            </span>
                            <h4 className="text-base font-semibold text-gray-800">Change Password</h4>
                        </div>
                        <button
                            onClick={() => setModalOpen(false)}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                            <X className="h-[18px] w-[18px]" />
                        </button>
                    </div>
                    <div className="space-y-4 p-5">
                        <div className="flex flex-col">
                            <label className="mb-1.5 text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                id="pass"
                                placeholder="Enter password"
                                value={pass}
                                onChange={(e) => { setPass(e.target.value); validatePasswords(e.target.value, newpass); }}
                                className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="mb-1.5 text-sm font-medium text-gray-700">Re-type Password</label>
                            <input
                                type="password"
                                id="newpass"
                                placeholder="Confirm password"
                                value={newpass}
                                onChange={(e) => { setNewpass(e.target.value); validatePasswords(pass, e.target.value); }}
                                className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                            />
                        </div>
                        {passErr && <p id="passerr" className={`text-xs font-medium ${passErrColor}`}>{passErr}</p>}
                    </div>
                    <div className="flex justify-end gap-3 border-t border-border bg-surface-muted px-5 py-4">
                        <button
                            onClick={() => setModalOpen(false)}
                            className="inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        >
                            Cancel
                        </button>
                        <button
                            id="passwrd"
                            onClick={handleSave}
                            disabled={saveDisabled || saving}
                            className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving…' : 'Save Password'}
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default Navbar;
