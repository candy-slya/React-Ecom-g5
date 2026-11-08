
export const getOrderStatusBadge = (status: string) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';

  switch (status) {
    case 'PENDING':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
    case 'PAID':
    case 'PROCESSING':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case 'SHIPPED':
      bgColor = 'bg-indigo-100';
      textColor = 'text-indigo-800';
      break;
    case 'DELIVERED':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'CANCELLED':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
};

export const getPaymentStatusBadge = (status: string) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';

  switch (status) {
    case 'PENDING':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
    case 'SUCCESS':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'FAILED':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    case 'PARTIALLY_REFUNDED':
      bgColor = 'bg-amber-100';
      textColor = 'text-amber-800';
      break;
    case 'REFUND_REJECTED':
      bgColor = 'bg-[#B42318]/10';
      textColor = 'text-[#B42318]';
      break;
    case 'REFUND_PENDING':
      bgColor = 'bg-amber-100';
      textColor = 'text-amber-800';
      break;
    case 'REFUND_APPROVED':
      bgColor = 'bg-emerald-100';
      textColor = 'text-emerald-800';
      break;
    case 'REFUNDED':
      bgColor = 'bg-[#74746F]/10';
      textColor = 'text-text-muted';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};
