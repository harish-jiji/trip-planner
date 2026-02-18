import React, { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
    return (
        <div
            className={`
                bg-white dark:bg-gray-900 
                rounded-2xl shadow-sm hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-900/10
                border border-gray-100 dark:border-gray-800 
                p-5 transition-all duration-300
                ${className}
            `}
            {...props}
        >
            {children}
        </div>
    );
}
