export const colors = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  brand: '#2F5DFF',
  danger: '#DC2626',
  warning: '#F59E0B',
  success: '#16A34A',
  star: '#FBBF24',
} as const;

export type ColorKey = keyof typeof colors;
