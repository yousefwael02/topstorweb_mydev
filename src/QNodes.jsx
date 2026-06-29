import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAllHostsInfo, discoverHosts } from './api/nodes';
import RunningNodes from './components/RunningNodes';
import DiscoveredNodes from './components/DiscoveredNodes';
import ActiveNodes from './components/ActiveNodes'; // For the "Nodes Status" / Evacuate section

const HOST_STATES = ["ready", "active", "possible", "lost"];

const QNodes = () => {
    const [hostsInfo, setHostsInfo] = useState({ ready: [], active: [], possible: [], lost: [] });
    const [selectedHost, setSelectedHost] = useState({ ready: null, active: null, possible: null, lost: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Track whether the component is actively mounted
    const isMounted = useRef(true);

    const loadData = useCallback(async () => {
        // Stop the loop immediately if the user navigated away
        if (!isMounted.current) return;

        try {
            const response = await fetchAllHostsInfo();
            if (response.data && isMounted.current) {
                setHostsInfo(prev => {
                    // Deep equality check — only update state if data actually changed.
                    if (JSON.stringify(prev) === JSON.stringify(response.data)) {
                        return prev;
                    }
                    return response.data;
                });
                setError(null); // Clear previous errors on a successful fetch
            }
        } catch (err) {
            if (isMounted.current) {
                // Prevent spamming the console with aborted/canceled requests
                if (err.code !== 'ERR_CANCELED' && err.message !== 'Request aborted') {
                    console.error("Failed to load hosts", err);
                }
                setError(err);
            }
        } finally {
            // Schedule the next poll ONLY after this one completely finishes
            if (isMounted.current) {
                setLoading(false);
                setTimeout(loadData, 5000); 
            }
        }
    }, []);

    useEffect(() => {
        isMounted.current = true; // Mark component as active
        
        loadData(); // Kick off the self-sustaining telemetry loop

        // Cleanup function: runs when navigating away to instantly kill the loop
        return () => {
            isMounted.current = false; 
        };
    }, [loadData]);

    const handleHostSelect = (state, hostName) => {
        setSelectedHost(prev => {
            const newState = { ...prev };
            // Toggle selection
            if (newState[state] === hostName) {
                newState[state] = null;
            } else {
                newState[state] = hostName;
            }
            return newState;
        });
    };

    const handleDiscover = async () => {
        if (!isMounted.current) return;
        setLoading(true);
        try {
            await discoverHosts();
            await loadData(); // Immediate refresh
        } catch (e) {
            console.error("Discovery failed", e);
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    const refreshData = async () => {
        await loadData();
    };


    return (
        <div className="p-3 sm:p-5">
            <div className="rounded-xl border border-border bg-surface p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Node Status</h1>
                        <p className="mt-1 text-sm text-gray-500">Monitor cluster nodes, configure networking, and manage membership</p>
                    </div>
                </div>

                <div className="mt-6 space-y-6">
                    <RunningNodes
                        hosts={hostsInfo.ready || []}
                        allHosts={hostsInfo.all || {}}
                        selectedHostName={selectedHost.ready}
                        onSelect={(name) => handleHostSelect('ready', name)}
                        onRefresh={refreshData}
                    />

                    <ActiveNodes
                        hosts={hostsInfo.active || []}
                        allHosts={hostsInfo.all || {}}
                        lostHosts={hostsInfo.lost || []}
                        selectedHostName={selectedHost.active}
                        onSelect={(name) => handleHostSelect('active', name)}
                        readyHostsCount={(hostsInfo.ready || []).length}
                        possibleHostsCount={(hostsInfo.possible || []).length}
                        onRefresh={refreshData}
                    />

                    <DiscoveredNodes
                        hosts={hostsInfo.possible || []}
                        allHosts={hostsInfo.all || {}}
                        selectedHostName={selectedHost.possible}
                        onSelect={(name) => handleHostSelect('possible', name)}
                        onDiscover={handleDiscover}
                        onRefresh={refreshData}
                    />
                </div>
            </div>
        </div>
    );
};

export default QNodes;
