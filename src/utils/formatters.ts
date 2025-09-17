export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

export const getTodayString = (): string => {
  return new Date().toISOString().slice(0, 10);
};

export const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  try {
    return new Date(dateStr);
  } catch {
    return null;
  }
};

export const isDateBetween = (
  date: Date | null,
  start: Date | null,
  end: Date | null
): boolean => {
  if (!date) return false;
  if (!start && !end) return true;
  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
};