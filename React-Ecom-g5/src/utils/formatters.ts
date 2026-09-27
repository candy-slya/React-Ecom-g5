export const formatPrice = (amount: number) => new Intl.NumberFormat('en-US').format(amount) + ' MMK';
export const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
