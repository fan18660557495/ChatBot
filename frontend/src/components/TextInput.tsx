import React, { forwardRef, ForwardedRef } from 'react';

interface TextInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  disabled?: boolean;
}

const TextInput = forwardRef<HTMLTextAreaElement, TextInputProps>(
  (
    { value, onChange, onFocus, onBlur, onKeyDown, placeholder, disabled },
    ref: ForwardedRef<HTMLTextAreaElement>
  ) => {
    return (
      <div className="relative">
        <textarea
          ref={ref}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full min-h-[40px] max-h-[200px] px-4 py-2 text-gray-700 bg-white border rounded-lg resize-y focus:outline-none focus:border-blue-500"
          rows={1}
        />
      </div>
    );
  }
);

export default TextInput; 