import React from 'react';

const DiskIcon = ({
    diskId,
    data,
    isSelected,
    isCache,
    onClick,
    onContextMenu,
    showActions = false,
    onAction
}) => {
    const { status, size, name, changeop } = data;
    const shortDisk = diskId.slice(-5);
    const isOnline = status.includes('ONLINE') || status.includes('free') || status.includes('cache') || (status.includes('NA') && data.raid?.includes('stripe'));
    const silvering = data.silvering !== 'no';

    const getDiskImage = () => {
        if (isOnline) return 'disk-image.png';
        return 'invaliddisk.png';
    };

    const handleContextMenu = (e) => {
        if (onContextMenu) {
            e.preventDefault();
            onContextMenu(diskId);
        }
    };

    return (
        <div
            className={`flex flex-col items-center p-2 rounded-md transition-all cursor-pointer relative border ${isCache ? 'bg-warning-50 border-warning-200' :
                isSelected ? 'bg-brand-50 border-brand-200' :
                    'border-transparent hover:bg-surface-muted'
                }`}
            onClick={() => onClick(diskId)}
            onContextMenu={handleContextMenu}
            title={`${diskId}\nStatus: ${status}\nOP: ${changeop}`}
        >
            {isCache && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-warning-500 text-[8px] font-semibold text-white rounded z-10 uppercase tracking-tight">
                    Cache
                </div>
            )}

            <div className="relative">
                <img
                    src={`img/${getDiskImage()}`}
                    alt="disk"
                    className={`w-10 h-10 object-contain transition-all ${silvering ? 'animate-pulse' : ''}`}
                    style={{ filter: 'none' }}
                />
            </div>

            <span className="text-[9px] font-medium text-gray-400 mt-1 uppercase tracking-tight">
                {shortDisk}
            </span>
            <span className="text-[10px] font-semibold text-gray-700 leading-none">
                {parseFloat(size).toFixed(1)}GB
            </span>

            {showActions && isSelected && (
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-surface shadow-lg rounded-md border border-border p-1 flex gap-1 z-20">
                    <button
                        onClick={(e) => { e.stopPropagation(); onAction('online'); }}
                        className="px-2 py-1 text-[8px] font-semibold uppercase bg-success-50 text-success-600 rounded hover:bg-success-100"
                    >
                        Online
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onAction('offline'); }}
                        className="px-2 py-1 text-[8px] font-semibold uppercase bg-danger-50 text-danger-600 rounded hover:bg-danger-100"
                    >
                        Offline
                    </button>
                </div>
            )}
        </div>
    );
};

export default DiskIcon;
