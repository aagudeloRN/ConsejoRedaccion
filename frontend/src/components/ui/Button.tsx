import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    ...props
}: ButtonProps) {
    const baseStyles = 'font-bold rounded transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-rutan-primary text-white hover:bg-opacity-90 focus:ring-rutan-primary',
        secondary: 'bg-rutan-secondary text-rutan-primary hover:bg-opacity-90 focus:ring-rutan-secondary',
        tertiary: 'bg-rutan-tertiary text-white hover:bg-opacity-90 focus:ring-rutan-tertiary',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
        outline: 'border-2 border-rutan-primary text-rutan-primary hover:bg-rutan-primary hover:text-white focus:ring-rutan-primary'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
