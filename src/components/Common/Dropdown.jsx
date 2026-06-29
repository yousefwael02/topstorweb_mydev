import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

const Dropdown = ({ options = [], value, onChange, placeholder = 'Select…', disabled, className = '', isMulti = false, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
        };
        const handleEscape = (e) => { if (e.key === 'Escape') setIsOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const handleSelect = (optValue) => {
        if (isMulti) {
            const arr = Array.isArray(value) ? value : [];
            onChange(arr.includes(optValue) ? arr.filter(v => v !== optValue) : [...arr, optValue]);
        } else {
            onChange(optValue);
            setIsOpen(false);
        }
    };

    const removeChip = (e, optValue) => {
        e.stopPropagation();
        if (isMulti) onChange((Array.isArray(value) ? value : []).filter(v => v !== optValue));
    };

    const isSelected = (optValue) =>
        isMulti ? (Array.isArray(value) && value.includes(optValue)) : String(optValue) === String(value);

    const selectedLabels = isMulti
        ? (Array.isArray(value) ? value : []).map(v => options.find(o => String(o.value) === String(v))?.label).filter(Boolean)
        : [];

    const singleLabel = !isMulti
        ? options.find(o => String(o.value) === String(value))?.label
        : null;

    return (
        <div className={`flex flex-col ${className}`} ref={containerRef}>
            {label && (
                <label className="mb-1.5 text-sm font-medium text-gray-700">{label}</label>
            )}
            <div className="relative">
                {/* Trigger */}
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`flex w-full items-center justify-between gap-2 rounded-md border bg-surface px-3 py-2.5 text-left text-sm transition-colors
                        ${isOpen ? 'border-brand-500 ring-4 ring-brand-100' : 'border-border hover:border-border-strong'}
                        ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : ''}`}
                >
                    {isMulti ? (
                        <span className="flex flex-wrap gap-1.5 min-w-0">
                            {selectedLabels.length === 0 ? (
                                <span className="text-gray-400">{placeholder}</span>
                            ) : selectedLabels.map((lbl, i) => {
                                const optVal = (Array.isArray(value) ? value : [])[i];
                                return (
                                    <span key={optVal} className="inline-flex items-center gap-1 rounded-sm bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                                        {lbl}
                                        <button
                                            type="button"
                                            onClick={(e) => removeChip(e, optVal)}
                                            className="text-brand-400 hover:text-brand-700"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                );
                            })}
                        </span>
                    ) : (
                        <span className={singleLabel ? 'text-gray-800' : 'text-gray-400'}>
                            {singleLabel ?? placeholder}
                        </span>
                    )}
                    <ChevronDown className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown panel */}
                {isOpen && (
                    <div className="absolute top-full left-0 z-[100] mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
                        <div className="max-h-60 overflow-y-auto">
                            {options.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-gray-400 text-center">No options</div>
                            ) : options.map((opt) => {
                                const sel = isSelected(opt.value);
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleSelect(opt.value)}
                                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left
                                            ${sel
                                                ? isMulti ? 'text-brand-600 bg-brand-50' : 'bg-brand-600 text-white'
                                                : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {isMulti && (
                                            <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors
                                                ${sel ? 'bg-brand-600 border-brand-600' : 'border-border'}`}>
                                                {sel && <Check className="h-3 w-3 text-white" />}
                                            </span>
                                        )}
                                        <span className="flex-1">{opt.label}</span>
                                        {!isMulti && sel && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                        {isMulti && (
                            <div className="border-t border-border bg-surface-muted px-3 py-2 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black"
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dropdown;
