import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatRuble = (amount: number | string): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

export const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, 'd MMMM yyyy', { locale: ru });
};

export const formatShortDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, 'd MMM', { locale: ru });
};
