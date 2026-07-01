import React, { useId } from 'react';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className = '',
      label,
      error,
      helperText,
      options,
      onChange,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label htmlFor={selectId} className="font-label-caps text-label-caps text-on-surface">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            onChange={handleChange}
            className={`w-full bg-transparent border font-body-md text-body-md p-2 rounded transition-colors focus:outline-none focus:ring-1 pr-10
              ${
                error
                  ? 'border-error focus:border-error focus:ring-error text-error placeholder:text-error/60'
                  : 'border-outline/20 text-on-surface placeholder:text-outline-variant focus:border-primary focus:ring-primary'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed bg-surface-container-low' : ''}
              ${className}
            `}
            {...props}
          >
            {props.placeholder && (
              <option value="" disabled>
                {props.placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {(error || helperText) && (
          <p className={`font-body-sm text-body-sm ${error ? 'text-error' : 'text-on-surface-variant'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
