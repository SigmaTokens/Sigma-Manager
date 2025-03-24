import React from 'react';
import clsx from 'clsx';

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => {
  return (
    <input
      className={clsx(
        'w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring focus:border-blue-500',
        className
      )}
      {...props}
    />
  );
};

export default Input;
