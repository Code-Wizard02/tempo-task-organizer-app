import React from "react";
import Select from "react-select";
import { cn } from "@/lib/utils";

type Option = {
    value: string;
    label: string;
};

type MultiSelectProps = {
    options: Option[];
    selected: string[];
    onChange: (selectedValues: string[]) => void;
    placeholder?: string;
    emptyIndicator?: React.ReactNode;
    className?: string;
};

const MultiSelect = ({
    options,
    selected,
    onChange,
    placeholder = "Seleccionar...",
    emptyIndicator,
    className,
}: MultiSelectProps) => {
    // Convertir los IDs seleccionados a opciones completas
    const selectedOptions = options.filter(option =>
        selected.includes(option.value)
    );

    return (
        <div className={cn("w-full", className)}>
            {options.length === 0 && emptyIndicator ? (
                emptyIndicator
            ) : (
                <Select
                    isMulti
                    options={options}
                    value={selectedOptions}
                    onChange={(newValue) => {
                        onChange((newValue as Option[]).map(option => option.value));
                    }}
                    placeholder={placeholder}
                    classNamePrefix="react-select"
                    styles={{
                        control: (base) => ({
                            ...base,
                            borderRadius: '0.375rem',
                            borderColor: 'hsl(var(--input))',
                            backgroundColor: 'hsl(var(--background))',
                            minHeight: '2.5rem',
                            boxShadow: 'none',
                            '&:hover': {
                                borderColor: 'hsl(var(--ring))',
                            },
                        }),
                        menu: (base) => ({
                            ...base,
                            backgroundColor: 'hsl(var(--background))',
                            borderRadius: '0.375rem',
                            overflow: 'hidden',
                            border: '1px solid hsl(var(--border))',
                            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                        }),
                        option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused
                                ? 'hsl(var(--accent))'
                                : 'transparent',
                            color: state.isFocused
                                ? 'hsl(var(--accent-foreground))'
                                : 'inherit',
                            cursor: 'pointer',
                            '&:active': {
                                backgroundColor: 'hsl(var(--accent))',
                            },
                        }),
                        multiValue: (base) => ({
                            ...base,
                            backgroundColor: 'hsl(var(--accent))',
                            borderRadius: '0.25rem',
                        }),
                        multiValueLabel: (base) => ({
                            ...base,
                            color: 'hsl(var(--accent-foreground))',
                            padding: '0 0.25rem',
                        }),
                        multiValueRemove: (base) => ({
                            ...base,
                            color: 'hsl(var(--accent-foreground))',
                            '&:hover': {
                                backgroundColor: 'hsl(var(--destructive))',
                                color: 'hsl(var(--destructive-foreground))',
                            },
                        }),
                    }}
                />
            )}
        </div>
    );
};

export default MultiSelect;