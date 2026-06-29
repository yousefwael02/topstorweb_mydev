import React from 'react';

/**
 * Design-system Button
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 * size: 'sm' | 'md'
 * Legacy bgColor prop is mapped to a variant for backward compatibility.
 */
const Button = ({
    variant,
    bgColor,
    textColor,
    size = 'md',
    icon,
    onClick,
    disabled = false,
    className = '',
    type = 'button',
    children,
    ...props
}) => {
    // Backward-compat: map legacy bgColor to variant
    const resolvedVariant = variant ?? (
        bgColor?.includes('rose') || bgColor?.includes('red') || bgColor?.includes('danger') ? 'danger' :
        bgColor === 'bg-white' || bgColor?.includes('white') || bgColor?.includes('gray') ? 'secondary' :
        bgColor?.includes('emerald') || bgColor?.includes('green') ? 'primary' :
        'primary'
    );

    const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-md shadow-xs transition-colors focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed';

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2.5 text-sm',
    };

    const variants = {
        primary: 'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-100',
        secondary: 'border border-border bg-surface text-gray-700 hover:bg-gray-50 hover:text-brand-600 focus:ring-brand-100',
        ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 shadow-none focus:ring-gray-200',
        danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-100',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${sizes[size] ?? sizes.md} ${variants[resolvedVariant] ?? variants.primary} ${className}`}
            {...props}
        >
            {icon && <span className="flex items-center">{icon}</span>}
            {children}
        </button>
    );
};

export default Button;
