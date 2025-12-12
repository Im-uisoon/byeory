
import { Check } from 'lucide-react';

interface ThemeCheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
}

export function ThemeCheckbox({ checked, onChange, label }: ThemeCheckboxProps) {
    return (
        <label className="flex items-center gap-2 cursor-pointer select-none group">
            <div
                className={`
                    w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200
                    ${checked ? 'border-transparent' : 'border-gray-300 bg-white group-hover:border-[var(--btn-bg)]'}
                `}
                style={{
                    backgroundColor: checked ? 'var(--btn-bg)' : undefined,
                }}
            >
                {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
            </div>
            {label && (
                <span className={`text-sm transition-colors ${checked ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                    {label}
                </span>
            )}
            {/* Hidden Input for Accessibility */}
            <input
                type="checkbox"
                className="hidden"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
        </label>
    );
}
