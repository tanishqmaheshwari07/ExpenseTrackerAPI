import { Category } from '../types';

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(isNaN(num) ? 0 : num);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export const CATEGORY_META: Record<
  Category,
  { label: string; color: string; bg: string; border: string }
> = {
  FOOD: { label: 'Food & Dining', color: '#1E3A8A', bg: 'rgba(30, 58, 138, 0.1)', border: '#BFDBFE' },
  TRAVEL: { label: 'Travel & Transport', color: '#0284C7', bg: 'rgba(2, 132, 199, 0.1)', border: '#BAE6FD' },
  SHOPPING: { label: 'Shopping', color: '#7C3AED', bg: 'rgba(124, 58, 237, 0.1)', border: '#DDD6FE' },
  EDUCATION: { label: 'Education', color: '#0D9488', bg: 'rgba(13, 148, 136, 0.1)', border: '#99F6E4' },
  ENTERTAINMENT: { label: 'Entertainment', color: '#D97706', bg: 'rgba(217, 119, 6, 0.1)', border: '#FDE68A' },
  HEALTH: { label: 'Health & Wellness', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.1)', border: '#FECACA' },
  BILLS: { label: 'Bills & Utilities', color: '#4B5563', bg: 'rgba(75, 85, 99, 0.1)', border: '#E5E7EB' },
  OTHER: { label: 'Other', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)', border: '#F3F4F6' },
};
