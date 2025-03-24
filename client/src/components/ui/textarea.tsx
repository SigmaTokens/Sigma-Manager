import React from 'react';
import clsx from 'clsx';

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => {
  return (
    <textarea
      className={clsx(
        'w-full border border-gray-300 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring focus:border-blue-500',
        className
      )}
      {...props}
    />
  );
};

export default Textarea;
