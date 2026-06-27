'use client';

import { useRef, useEffect, TextareaHTMLAttributes } from 'react';

interface Props extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function AutoGrowTextarea({ value, onChange, className, ...rest }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value ?? ''}
      onChange={onChange}
      rows={1}
      data-auto-grow="false"
      style={{ overflowY: 'hidden', resize: 'none' }}
      className={`desc-word-like ${className ?? ''}`}
      {...rest}
    />
  );
}
