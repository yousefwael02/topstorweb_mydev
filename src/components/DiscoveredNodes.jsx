import React, { useState, useEffect } from 'react';
import { joinCluster, updateDiscoveredNode } from '../api/nodes';
import ServerNode from './Common/ServerNode';
import Button from './Common/Button';
import { ChevronDown, ChevronUp } from 'lucide-react';

const DiscoveredNodes = ({ hosts, allHosts, selectedHostName, onSelect, onDiscover, onRefresh }) => {
    const [formData, setFormData] = useState({
        alias: '',
        ipaddr: '',
        ipaddrsubnet: 24,
        port: 'Port'
    });
    const [originalData, setOriginalData] = useState({ alias: '', ipaddr: '', ipaddrsubnet: 24 });
    const [isExpanded, setIsExpanded] = useState(true);
    const [isJoining, setIsJoining] = useState(false);

    // Fix #16: Get the selected host object directly from the array. The old code used `allhosts['possible'][index]`.
    // The name may not perfectly match the alias initially depending on the UI state, but `hosts` array contains the source of truth for possible hosts.
    const selectedHostIndex = selectedHostName ? hosts.findIndex(h => (h.name === selectedHostName || h.alias === selectedHostName)) : -1;
    const selectedHostListItem = selectedHostIndex !== -1 ? hosts[selectedHostIndex] : null;

    useEffect(() => {
        if (selectedHostListItem) {
            const initialFormState = {
                alias: selectedHostListItem.alias || selectedHostListItem.name || '',
                ipaddr: selectedHostListItem.ipaddr || selectedHostListItem.ip || '',
                ipaddrsubnet: selectedHostListItem.ipaddrsubnet || 24,
                port: selectedHostListItem.port || 'Port'
            };
            setFormData(initialFormState);
            setOriginalData({
                alias: initialFormState.alias,
                ipaddr: initialFormState.ipaddr,
                ipaddrsubnet: initialFormState.ipaddrsubnet
            });
        } else {
            setFormData({
                alias: '',
                ipaddr: '',
                ipaddrsubnet: 24,
                port: 'Port'
            });
            setOriginalData({ alias: '', ipaddr: '', ipaddrsubnet: 24 });
        }
    }, [selectedHostListItem]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Match legacy updateButtonState: show "Update and Add to Cluster" whenever fields have content
    const hasDataForButton = (formData.alias && formData.alias.trim().length > 0) ||
        (formData.ipaddr && formData.ipaddr.trim().length > 0 && !formData.ipaddr.includes('__'));

    // Fix #8: Two-step "Update and Add to Cluster" flow
    const handleJoin = async () => {
        if (!selectedHostName || !selectedHostListItem) return;
        setIsJoining(true);
        try {
            let tochange = 0;
            const hostsubmit = {};

            // Match Legacy updateDiscoveredNode L279-282
            if (formData.alias.length > 3 && formData.alias !== originalData.alias) {
                hostsubmit.alias = formData.alias;
                tochange = 1;
            }

            // Match Legacy updateDiscoveredNode L284-298
            // Note: Legacy uses double-underscore "__" for the submission guard
            if (formData.ipaddr.length > 3 && !formData.ipaddr.includes('__')) {
                if (formData.ipaddr !== originalData.ipaddr || String(formData.ipaddrsubnet) !== String(originalData.ipaddrsubnet)) {
                    hostsubmit.ipaddr = formData.ipaddr;
                    hostsubmit.ipaddrsubnet = formData.ipaddrsubnet;
                    tochange = 1;
                }
            }

            if (tochange > 0) {
                // Step 1: Update the discovered node configuration
                // Match Legacy payload exactly (L301-305)
                const updatePayload = {
                    ...hostsubmit,
                    id: selectedHostListItem.id,
                    user: 'mezo',
                    name: selectedHostListItem.name,
                    discovered: true
                };

                await updateDiscoveredNode(updatePayload);

                // Step 2: Wait before joining cluster (matching old code's 10-second delay L486)
                await new Promise(resolve => setTimeout(resolve, 10000));
            }

            // Step 3: Join the cluster (Match Legacy joinNodeToCluster L320-330)
            await joinCluster(selectedHostListItem.name);
            if (onRefresh) onRefresh();
        } catch (e) {
            console.error("Join cluster failed", e);
        } finally {
            setIsJoining(false);
        }
    };

    const btnText = isJoining ? 'Joining...' : (hasDataForButton ? 'Update and Add to Cluster' : 'Add to Cluster');

    return (
        <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
            <div
                className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <ChevronDown className={`h-[18px] w-[18px] text-gray-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                    <h3 className="text-base font-semibold text-gray-800">Discovered Nodes</h3>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); if (onDiscover) onDiscover(); }}
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-brand-600"
                    id="refresh2"
                >
                    discovery
                </button>
            </div>

            {isExpanded && (
                <>
                    <div className="p-5 border-b border-border bg-surface-muted">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="hostspossible">
                            {hosts.length === 0 ? (
                                <div className="col-span-full text-center text-sm text-gray-400 py-6">
                                    No discovered nodes. Click <strong>discovery</strong> to scan.
                                </div>
                            ) : hosts.map(host => {
                                const hostName = host.name || host.alias;
                                return (
                                    <div key={hostName}>
                                        <ServerNode
                                            name={hostName}
                                            ip={host.ip || host.ipaddr}
                                            state="discovered"
                                            onClick={() => onSelect(hostName)}
                                            selected={selectedHostName === hostName}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-5">
                        <form className='space-y-5 hostform'>
                            <div className="grid grid-cols-12 gap-5 items-center">
                                <label className="col-span-12 sm:col-span-3 text-sm font-medium text-gray-700">Node Name</label>
                                <div className="col-span-12 sm:col-span-9 md:col-span-5">
                                    <input
                                        type="text"
                                        className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:bg-surface-muted disabled:text-gray-400 discoverednodes"
                                        id="DiscoveredBoxName"
                                        name="alias"
                                        value={formData.alias}
                                        onChange={handleChange}
                                        disabled={!selectedHostListItem || isJoining}
                                        placeholder="Node Name"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-12 gap-5 items-center">
                                <label className="col-span-12 sm:col-span-3 text-sm font-medium text-gray-700">Node Address</label>
                                <div className="col-span-12 sm:col-span-9">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder="xxx.xxx.xxx.xxx"
                                                className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:bg-surface-muted disabled:text-gray-400 ipaddress discoverednodes"
                                                id="DiscoveredIPAddress"
                                                name="ipaddr"
                                                value={formData.ipaddr}
                                                onChange={handleChange}
                                                disabled={!selectedHostListItem || isJoining}
                                            />
                                        </div>
                                        {/* Port Select */}
                                        <div className="sm:w-32">
                                            <select
                                                name="port"
                                                className="w-full rounded-md border border-border bg-surface px-3.5 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-brand-100 focus:border-brand-500 outline-none disabled:bg-surface-muted disabled:text-gray-400 appearance-none discoverednodes"
                                                id="DiscoveredNodePorts"
                                                value={formData.port}
                                                onChange={handleChange}
                                                disabled={!selectedHostListItem || isJoining}
                                            >
                                                <option>Port</option>
                                            </select>
                                        </div>
                                        {/* Subnet */}
                                        <div className="flex items-center gap-3 sm:w-40">
                                            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Subnet</label>
                                            <input
                                                type="number"
                                                min="8"
                                                max="32"
                                                step="8"
                                                className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:bg-surface-muted disabled:text-gray-400 discoverednodes"
                                                id="Discoveredipaddrsubnet"
                                                name="ipaddrsubnet"
                                                value={formData.ipaddrsubnet}
                                                onChange={handleChange}
                                                disabled={!selectedHostListItem || isJoining}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 items-center border-t border-border pt-4">
                                <Button
                                    type="button"
                                    id="updateAndJoinBtn"
                                    onClick={handleJoin}
                                    disabled={!selectedHostListItem || isJoining}
                                    variant="primary"
                                >
                                    {btnText}
                                </Button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </section>
    );
};

export default DiscoveredNodes;
