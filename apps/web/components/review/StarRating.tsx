'use client';

import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  readOnly?: boolean;
  className?: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function StarRating({
  value,
  onChange,
  max = 5,
  readOnly = false,
  className,
}: StarRatingProps) {
  const safeValue = clamp(value, 0, max);

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div className="inline-flex items-center">
        {Array.from({ length: max }).map((_, index) => {
          const fillPercent = clamp((safeValue - index) * 100, 0, 100);

          return (
            <span key={index} className="relative inline-flex h-7 w-7 items-center justify-center text-2xl leading-none">
              <span className="text-amber-200">★</span>
              <span
                className="absolute left-0 top-0 overflow-hidden text-amber-500"
                style={{ width: `${fillPercent}%` }}
              >
                ★
              </span>

              {readOnly ? null : (
                <>
                  <button
                    type="button"
                    aria-label={`${index + 0.5}점`}
                    className="absolute inset-y-0 left-0 w-1/2"
                    onClick={() => onChange?.(index + 0.5)}
                  />
                  <button
                    type="button"
                    aria-label={`${index + 1}점`}
                    className="absolute inset-y-0 right-0 w-1/2"
                    onClick={() => onChange?.(index + 1)}
                  />
                </>
              )}
            </span>
          );
        })}
      </div>
      <span className="text-sm font-semibold text-ink-700">{safeValue.toFixed(1)}</span>
    </div>
  );
}
