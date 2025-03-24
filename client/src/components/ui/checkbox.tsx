import React from 'react';
import clsx from 'clsx';

export const Checkbox: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => {
  return (
    <input
      type="checkbox"
      className={clsx(
        'h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring focus:ring-blue-500',
        className
      )}
      {...props}
    />
  );
};

export default Checkbox;
