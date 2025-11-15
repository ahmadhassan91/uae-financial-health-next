'use client';

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  className,
  autoFocus = true,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [localValue, setLocalValue] = useState<string[]>(Array(length).fill(''));

  // Sync with external value
  useEffect(() => {
    const digits = value.padEnd(length, '').slice(0, length).split('');
    setLocalValue(digits);
  }, [value, length]);

  const focusInput = (index: number) => {
    if (index >= 0 && index < length) {
      inputRefs.current[index]?.focus();
    }
  };

  const handleChange = (index: number, digit: string) => {
    if (disabled) return;

    // Only allow digits
    const sanitized = digit.replace(/[^0-9]/g, '');
    if (sanitized.length === 0 && digit !== '') return;

    const newValue = [...localValue];
    newValue[index] = sanitized.slice(-1); // Take only last digit
    setLocalValue(newValue);

    const stringValue = newValue.join('');
    onChange(stringValue);

    // Auto-advance to next input
    if (sanitized && index < length - 1) {
      focusInput(index + 1);
    }

    // Check if complete
    if (stringValue.length === length && onComplete) {
      onComplete(stringValue);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      
      if (localValue[index]) {
        // Clear current digit
        const newValue = [...localValue];
        newValue[index] = '';
        setLocalValue(newValue);
        onChange(newValue.join(''));
      } else if (index > 0) {
        // Move to previous input and clear it
        const newValue = [...localValue];
        newValue[index - 1] = '';
        setLocalValue(newValue);
        onChange(newValue.join(''));
        focusInput(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      focusInput(index + 1);
    } else if (e.key === 'Delete') {
      e.preventDefault();
      const newValue = [...localValue];
      newValue[index] = '';
      setLocalValue(newValue);
      onChange(newValue.join(''));
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '').slice(0, length);
    
    if (pastedData) {
      const newValue = pastedData.padEnd(length, '').split('');
      setLocalValue(newValue);
      onChange(pastedData);
      
      // Focus last filled input or last input
      const focusIndex = Math.min(pastedData.length, length - 1);
      focusInput(focusIndex);

      // Check if complete
      if (pastedData.length === length && onComplete) {
        onComplete(pastedData);
      }
    }
  };

  const handleFocus = (index: number) => {
    inputRefs.current[index]?.select();
  };

  return (
    <div className={cn('flex gap-2 justify-center', className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={localValue[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          className={cn(
            'w-12 h-14 text-center text-2xl font-semibold',
            'border-2 rounded-lg',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
            disabled && 'bg-gray-100 cursor-not-allowed opacity-50',
            localValue[index] && 'border-blue-500'
          )}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
