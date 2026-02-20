import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { StarRating } from '@/components/review/StarRating';

describe('StarRating', () => {
  it('renders current rating text', () => {
    render(<StarRating value={3.5} readOnly />);

    expect(screen.getByText('3.5')).toBeTruthy();
  });

  it('calls onChange when a half star button is clicked', () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: '3.5점' }));

    expect(onChange).toHaveBeenCalledWith(3.5);
  });

  it('does not render control buttons in readOnly mode', () => {
    render(<StarRating value={4} readOnly />);

    expect(screen.queryByRole('button', { name: '1점' })).toBeNull();
  });

  it('clamps value to max range', () => {
    render(<StarRating value={7} readOnly />);

    expect(screen.getByText('5.0')).toBeTruthy();
  });
});
