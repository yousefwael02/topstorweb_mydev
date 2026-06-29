import React from 'react';

const Input = ({
    type = 'text',
    label,
    value,
    onChange,
    placeholder,
    disabled = false,
    className = '',
    icon,
    required = false,
    id,
    min,
    max,
    step,
    isTextArea = false,
    rows = 3,
    error,
    hint,
}) => {
    const fieldClass = `w-full rounded-md border border-border bg-surface text-sm text-gray-800 placeholder:text-gray-400 outline-none
        focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-colors
        ${icon ? 'pl-9 pr-3' : 'px-3'} ${isTextArea ? 'py-2.5 resize-none' : 'py-2.5'}
        ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : ''}
        ${error ? 'border-danger-500 focus:ring-danger-100' : ''}`;

    return (
        <div className={`flex flex-col ${className}`}>
            {label && (
                <label htmlFor={id} className="mb-1.5 text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </span>
                )}
                {isTextArea ? (
                    <textarea
                        id={id}
                        required={required}
                        disabled={disabled}
                        placeholder={placeholder}
                        className={fieldClass}
                        value={value}
                        onChange={onChange}
                        rows={rows}
                    />
                ) : (
                    <input
                        type={type}
                        id={id}
                        required={required}
                        disabled={disabled}
                        placeholder={placeholder}
                        min={min}
                        max={max}
                        step={step}
                        className={fieldClass}
                        value={value}
                        onChange={onChange}
                    />
                )}
            </div>
            {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
            {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
        </div>
    );
};

export default Input;
