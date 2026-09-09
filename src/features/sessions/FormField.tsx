import type { ReactNode } from 'react';
export function FormField({ name, label, hint, error, children }: {
    name: string;
    label: string;
    hint?: string;
    error?: string;
    children: ReactNode;
}) {
    return <div className="field"><label htmlFor={name}>{label}</label>{children}{hint ? <small id={`${name}-hint`}>{hint}</small> : null}{error ? <span className="field-error" id={`${name}-error`}>{error}</span> : null}</div>;
}
