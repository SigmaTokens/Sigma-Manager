import React from 'react';
import clsx from 'clsx';

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className, children, ...props }) => {
  return (
    <select
      className={clsx(
        'w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring focus:border-blue-500',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
};

export const SelectTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const SelectValue: React.FC<{ placeholder: string }> = ({ placeholder }) => {
  return <option value="" disabled selected>{placeholder}</option>;
};

export const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const SelectItem: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => {
  return <option value={value}>{children}</option>;
};

export default Select;
