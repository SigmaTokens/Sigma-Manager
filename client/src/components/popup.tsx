import React from 'react';
import "../styles/HoneyTokenCreation.css";

// Button
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'primary' }> = ({
  children,
  variant = 'default',
  ...props
}) => {
  return (
    <button
      className={`button-base button-${variant}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Card
export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={`card ${className || ''}`}>{children}</div>
);

export const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="card-content">{children}</div>
);

// Checkbox
export const Checkbox: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <input type="checkbox" className={`checkbox ${className || ''}`} {...props} />
);

// Input
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <input className={`input ${className || ''}`} {...props} />
);

// Textarea
export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => (
  <textarea className={`textarea ${className || ''}`} {...props} />
);

// Select
export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className, children, ...props }) => (
  <select className={`select ${className || ''}`} {...props}>{children}</select>
);

export const SelectTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

export const SelectValue: React.FC<{ placeholder: string }> = ({ placeholder }) => (
  <option value="" disabled>{placeholder}</option>
);

export const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

export const SelectItem: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => (
  <option value={value}>{children}</option>
);

export default {
  Button,
  Card,
  CardContent,
  Checkbox,
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
};
