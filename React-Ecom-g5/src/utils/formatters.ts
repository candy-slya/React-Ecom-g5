export const formatPrice = (amount: number) => new Intl.NumberFormat('en-US').format(amount) + ' MMK';
export const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
export const formatPaymentMethod = (method?: string | null): string => {
  if (!method) return 'N/A';
  if (method === 'MINI_BANKING' || method.toLowerCase().includes('mini')) return 'EKARAJ BANK';
  return method;
};
