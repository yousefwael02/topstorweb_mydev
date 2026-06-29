import React, { useState, useEffect } from 'react';
import {
    Database, Settings, Users, Server, Activity, BarChart2, HardDrive,
    Copy, Layers, Cog, UserPlus, ClipboardList, Monitor, Globe, Home,
    Cpu, Camera, Unlock, Upload, Shield, ChevronDown, Search,
    PanelLeftClose, PanelLeftOpen, Handshake, Send, Inbox
} from 'lucide-react';

const MENU_ITEMS = [
    { label: 'Main menu', isHeader: true },
    {
        label: 'System configuration', icon: Settings,
        subItems: [
            { label: 'Users', icon: UserPlus, href: '#/users' },
            { label: 'Groups', icon: Users, href: '#/groups' },
            { label: 'Nodes', icon: Server, href: '#/nodes' },
        ]
    },
    {
        label: 'System Status', icon: Activity,
        subItems: [
            { label: 'Logs', icon: ClipboardList, href: '#/logs' },
            { label: 'Service Performance', icon: BarChart2, href: '#/performance' },
        ]
    },
    {
        label: 'Volumes', icon: HardDrive,
        subItems: [
            { label: 'CIFS', icon: Monitor, href: '#/volumes/cifs' },
            { label: 'NFS', icon: Globe, href: '#/volumes/nfs' },
            { label: 'Home Folders', icon: Home, href: '#/volumes/home' },
            { label: 'ISCSI LUNs', icon: Cpu, href: '#/volumes/iscsi' },
            { label: 'Snapshots', icon: Camera, href: '#/volumes/snapshots' },
        ]
    },
    {
        label: 'Replication', icon: Copy,
        subItems: [
            { label: 'Partner', icon: Handshake, href: '#/replication/partners' },
            { label: 'Sender Schedule', icon: Send, href: '#/replication/sender' },
            { label: 'Received Snapshots', icon: Inbox, href: '#/replication/received' },
        ]
    },
    {
        label: 'Pools', icon: Layers,
        subItems: [
            { label: 'Disk Groups', icon: Database, href: '#/pools/diskgroups' },
        ]
    },
    {
        label: 'Settings', icon: Cog,
        subItems: [
            { label: 'User Privileges', icon: Shield, href: '#/settings/privileges' },
            { label: 'Updates', icon: Upload, href: '#/settings/updates' },
        ]
    }
];

const Sidebar = () => {
    const [pathname, setPathname] = useState(window.location.hash || window.location.pathname);
    const [userExpanded, setUserExpanded] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(document.body.classList.contains('sidebar-collapse'));

    useEffect(() => {
        const handleLocationChange = () => setPathname(window.location.hash || window.location.pathname);
        window.addEventListener('popstate', handleLocationChange);
        window.addEventListener('hashchange', handleLocationChange);
        return () => {
            window.removeEventListener('popstate', handleLocationChange);
            window.removeEventListener('hashchange', handleLocationChange);
        };
    }, []);

    const isItemActive = (href) => {
        if (href.startsWith('#')) return pathname === href;
        const cleanPath = pathname.split('/').pop() || 'index.html';
        return cleanPath === href.replace('./', '');
    };

    const activeParent = MENU_ITEMS.find(menu =>
        !menu.isHeader && menu.subItems?.some(item => isItemActive(item.href))
    )?.label;

    const handleToggle = (e, label) => {
        e.preventDefault();
        e.stopPropagation();
        if (label === activeParent) {
            setUserExpanded(null);
            return;
        }
        setUserExpanded(prev => prev === label ? null : label);
    };

    const isExpanded = (label) => label === activeParent || label === userExpanded;

    const toggleSidebar = () => {
        const body = document.body;
        if (isCollapsed) {
            body.classList.remove('sidebar-collapse');
        } else {
            body.classList.add('sidebar-collapse');
        }
        setIsCollapsed(!isCollapsed);
    };

    const closeMobile = () => document.body.classList.remove('sidebar-mobile-open');

    return (
        <aside className="app-sidebar fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-border bg-surface">
            {/* Brand header */}
            <div className="flex h-16 flex-shrink-0 items-center justify-between gap-2 border-b border-border px-4">
                <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-white">
                        <Database className="h-4 w-4" />
                    </span>
                    <span className="text-[17px] font-semibold tracking-tight text-gray-900">QuickStor</span>
                </div>
                <button
                    onClick={toggleSidebar}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-brand-600 transition-colors"
                    title="Toggle sidebar"
                >
                    {isCollapsed
                        ? <PanelLeftOpen className="h-[18px] w-[18px]" />
                        : <PanelLeftClose className="h-[18px] w-[18px]" />
                    }
                </button>
            </div>

            {/* Search */}
            <div className="flex-shrink-0 px-3 pt-3">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-gray-400" />
                    <input
                        type="search"
                        placeholder="Search menu…"
                        className="w-full rounded-md border border-border bg-surface-muted py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-brand-500 focus:bg-surface focus:ring-4 focus:ring-brand-100 transition-all"
                    />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-3">
                {MENU_ITEMS.map((menu, idx) => {
                    if (menu.isHeader) {
                        return (
                            <div key={idx} className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                {menu.label}
                            </div>
                        );
                    }

                    const expanded = isExpanded(menu.label);
                    const isActive = menu.label === activeParent;
                    const Icon = menu.icon;

                    return (
                        <div key={menu.label}>
                            <button
                                onClick={(e) => handleToggle(e, menu.label)}
                                className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors
                                    ${isActive ? 'text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${isActive ? 'text-brand-600' : 'text-gray-400'}`} />
                                <span className="flex-1 text-left">{menu.label}</span>
                                <ChevronDown
                                    className={`h-[15px] w-[15px] flex-shrink-0 text-gray-400 transition-transform duration-200 ${expanded ? '' : '-rotate-90'}`}
                                />
                            </button>

                            {expanded && (
                                <ul className="mb-1 mt-0.5 ml-3.5 flex flex-col gap-0.5 border-l border-border pl-3">
                                    {menu.subItems.map((subItem) => {
                                        const SubIcon = subItem.icon;
                                        const active = isItemActive(subItem.href);
                                        return (
                                            <li key={subItem.label}>
                                                <a
                                                    href={subItem.href}
                                                    onClick={closeMobile}
                                                    className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors
                                                        ${active
                                                            ? 'bg-brand-600 text-white'
                                                            : 'text-gray-600 hover:bg-gray-50 hover:text-brand-600'
                                                        }`}
                                                >
                                                    <SubIcon className={`h-[15px] w-[15px] flex-shrink-0 ${active ? 'text-white' : 'text-gray-400'}`} />
                                                    {subItem.label}
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;
