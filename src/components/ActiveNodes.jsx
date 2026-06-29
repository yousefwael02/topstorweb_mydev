import React, { useState } from 'react';
import { evacuateHost } from '../api/nodes';
import ServerNode from './Common/ServerNode';
import Button from './Common/Button';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ActiveNodes = ({ hosts, allHosts, lostHosts, selectedHostName, onSelect, readyHostsCount, possibleHostsCount, onRefresh }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const selectedHost = allHosts ? allHosts[selectedHostName] : null;

    // Fix #14: Call onRefresh after evacuate
    const handleEvacuate = async () => {
        if (!selectedHostName) return;
        try {
            await evacuateHost(selectedHostName);
            if (onRefresh) onRefresh();
        } catch (e) {
            console.error("Evacuation failed", e);
        }
    };

    // Old logic: evacuate disabled by default
    // Enabled only if selected host is "lost/Off" AND (readyCount - possibleCount) >= 2
    const isSelectedHostLost = selectedHostName && lostHosts && (
        Array.isArray(lostHosts)
            ? lostHosts.includes(selectedHostName) || lostHosts.some(h => (typeof h === 'object' ? h.name : h) === selectedHostName)
            : JSON.stringify(lostHosts).includes(selectedHostName)
    );

    // Fix #13: Match old code's two-step logic:
    // Step 1: disable if ready - possible < 2
    // Step 2: override enable if host is Off/lost (old code re-enables regardless of count)
    let canEvac = (readyHostsCount - possibleHostsCount) >= 2;
    if (isSelectedHostLost) {
        canEvac = true; // "Off" status overrides the count check
    }
    const canEvacuate = selectedHostName && canEvac;

    return (
        <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
            <div
                className="flex items-center gap-4 border-b border-border px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <ChevronDown className={`h-[18px] w-[18px] text-gray-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                <h3 className="text-base font-semibold text-gray-800">Nodes Status</h3>
            </div>

            {isExpanded && (
                <div>
                    <div className="p-5 border-b border-border bg-surface-muted">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="hostsactive">
                            {hosts.map(host => {
                                const hostName = typeof host === 'object' ? host.name : host;
                                const isLost = lostHosts && (
                                    Array.isArray(lostHosts)
                                        ? lostHosts.includes(hostName) || lostHosts.some(h => (typeof h === 'object' ? h.name : h) === hostName)
                                        : JSON.stringify(lostHosts).includes(hostName)
                                );
                                const fullHost = (allHosts && allHosts[hostName]) ? allHosts[hostName] : host;
                                const displayIp = fullHost.ip || fullHost.ipaddr || (typeof host === 'object' ? (host.ip || host.ipaddr) : '');
                                return (
                                    <div key={hostName}>
                                        <ServerNode
                                            name={hostName}
                                            ip={displayIp}
                                            state={isLost ? 'down' : 'up'}
                                            onClick={() => onSelect(hostName)}
                                            selected={selectedHostName === hostName}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-5">
                        <Button
                            type="button"
                            id="activesubmit"
                            onClick={handleEvacuate}
                            disabled={!canEvacuate}
                            variant="danger"
                        >
                            Evacuate Node
                        </Button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ActiveNodes;
