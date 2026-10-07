import React, { useEffect, useState } from 'react';
import { orderApi } from '../api/orderApi';
import type { GetMyOrdersParams } from '../api/orderApi';
import type { OrderListResponse, Page } from '../types';
import { useNavigate } from 'react-router-dom';

export const OrderHistoryPage: React.FC = () => {
  const [pageData, setPageData] = useState<Page<OrderListResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Filter form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [dateError, setDateError] = useState('');

  // Currently applied filters (for API calls and pagination)
  const [appliedFilters, setAppliedFilters] = useState<GetMyOrdersParams>({});

  const navigate = useNavigate();

  const fetchOrders = async (page: number, filters: GetMyOrdersParams = appliedFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderApi.getMyOrders({ ...filters, page, size: 10 });
      setPageData(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, appliedFilters]);

  const handleApplyFilters = () => {
    setDateError('');
    if (startDate && endDate && startDate > endDate) {
      setDateError('From Date cannot be later than To Date.');
      return;
    }
    
    setAppliedFilters({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      orderStatus: orderStatus || undefined,
      orderNo: orderNo || undefined
    });
    setCurrentPage(0);
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setOrderStatus('');
    setOrderNo('');
    setDateError('');
    setAppliedFilters({});
    setCurrentPage(0);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' MMK';
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOrderStatusBadge = (status: string) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';

    switch (status) {
      case 'PENDING':
        bgColor = 'bg-[#B7791F]/10';
        textColor = 'text-[#B7791F]';
        break;
      case 'PAID':
      case 'PROCESSING':
        bgColor = 'bg-primary/10';
        textColor = 'text-primary';
        break;
      case 'SHIPPED':
      case 'DELIVERED':
        bgColor = 'bg-[#2E7D32]/10';
        textColor = 'text-[#2E7D32]';
        break;
      case 'CANCELLED':
        bgColor = 'bg-[#B42318]/10';
        textColor = 'text-[#B42318]';
        break;
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${bgColor} ${textColor}`}>
        {status}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';

    switch (status) {
      case 'PENDING':
        bgColor = 'bg-[#B7791F]/10';
        textColor = 'text-[#B7791F]';
        break;
      case 'SUCCESS':
        bgColor = 'bg-[#2E7D32]/10';
        textColor = 'text-[#2E7D32]';
        break;
      case 'FAILED':
        bgColor = 'bg-[#B42318]/10';
        textColor = 'text-[#B42318]';
        break;
      case 'PARTIALLY_REFUNDED':
      case 'REFUNDED':
        bgColor = 'bg-[#74746F]/10';
        textColor = 'text-text-muted';
        break;
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${bgColor} ${textColor}`}>
        {status}
      </span>
    );
  };

  if (error && !pageData) {
    return (
      <div className="bg-page min-h-screen py-16 px-4 flex items-center justify-center print:hidden">
        <div className="mx-auto max-w-xl rounded-lg border border-[#B42318]/20 bg-surface p-8 text-center shadow-sm">
          <h2 className="mb-2 text-xl font-bold text-[#B42318]">Oops!</h2>
          <p className="mb-6 text-text-main">{error}</p>
          <button
            onClick={() => fetchOrders(currentPage)}
            className="rounded-md bg-primary text-white px-6 py-2 font-bold hover:bg-primary-hover transition-colors shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-page min-h-[calc(100vh-64px)] print:bg-white print:min-h-0 py-12 print:py-0 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 print:mb-4">
          <h1 className="text-3xl font-bold tracking-tight text-text-main print:text-2xl">Customer Order History</h1>
          <button
            onClick={() => window.print()}
            className="mt-4 sm:mt-0 inline-flex items-center rounded-md bg-accent text-slate-950 px-4 py-2 text-sm font-bold shadow-sm hover:bg-accent-hover transition-colors print:hidden"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / Save PDF
          </button>
        </div>

        {/* Print Context Header (Only visible in print) */}
        <div className="hidden print:block mb-6 text-sm text-text-muted">
          {(appliedFilters.startDate || appliedFilters.endDate || appliedFilters.orderStatus || appliedFilters.orderNo) ? (
            <div className="grid grid-cols-2 gap-2 mb-2">
              {appliedFilters.startDate && <div><span className="font-medium text-text-main">From:</span> {appliedFilters.startDate}</div>}
              {appliedFilters.endDate && <div><span className="font-medium text-text-main">To:</span> {appliedFilters.endDate}</div>}
              {appliedFilters.orderStatus && <div><span className="font-medium text-text-main">Status:</span> {appliedFilters.orderStatus}</div>}
              {appliedFilters.orderNo && <div><span className="font-medium text-text-main">Search:</span> {appliedFilters.orderNo}</div>}
            </div>
          ) : (
            <p className="mb-2">Showing all past orders</p>
          )}
          {pageData && (
            <p className="italic">Note: This report reflects page {pageData.number + 1} of {pageData.totalPages} of the active filter results.</p>
          )}
        </div>

        {/* Filter Section */}
        <div className="bg-surface border border-border-subtle rounded-lg p-6 mb-8 shadow-sm print:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full rounded-md border border-border-subtle px-3 py-2 text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full rounded-md border border-border-subtle px-3 py-2 text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Order Status</label>
              <select
                value={orderStatus}
                onChange={e => setOrderStatus(e.target.value)}
                className="w-full rounded-md border border-border-subtle px-3 py-2 text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All</option>
                <option value="PAID">Paid</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Order Number</label>
              <input
                type="text"
                placeholder="Search order number"
                value={orderNo}
                onChange={e => setOrderNo(e.target.value)}
                className="w-full rounded-md border border-border-subtle px-3 py-2 text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          {dateError && <p className="mt-2 text-sm text-[#B42318]">{dateError}</p>}
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleApplyFilters}
              className="rounded-md bg-primary text-white px-4 py-2 text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm"
            >
              Apply Filters
            </button>
            <button
              onClick={handleResetFilters}
              className="rounded-md border border-border-subtle bg-surface px-4 py-2 text-sm font-medium text-text-main hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {loading && !pageData ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-text-muted text-lg font-medium">Loading your orders...</div>
          </div>
        ) : pageData?.content.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-surface p-12 text-center shadow-sm">
            <svg className="mx-auto h-12 w-12 text-text-muted mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="text-lg font-bold text-text-main mb-2">No orders found for the selected filters.</h3>
            <p className="text-text-muted mb-6">Try adjusting your search criteria.</p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center rounded-md border border-border-subtle bg-surface px-6 py-2 text-sm font-medium text-text-main hover:bg-gray-50 transition-colors print:hidden"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6 print:space-y-4">
            {pageData?.content.map((order) => (
              <div
                key={order.orderId}
                onClick={() => navigate(`/orders/${order.orderId}`)}
                className="rounded-lg border border-border-subtle bg-surface shadow-sm overflow-hidden cursor-pointer hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent group print:border-b print:border-border-subtle print:shadow-none print:break-inside-avoid print:cursor-auto"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/orders/${order.orderId}`);
                  }
                }}
              >
                <div className="px-6 py-5 sm:px-8">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 pb-4 border-b border-border-subtle group-hover:border-primary/30 transition-colors print:border-border-subtle">
                    <div className="mb-4 sm:mb-0">
                      <p className="text-sm font-medium text-text-muted mb-1">Order Number</p>
                      <p className="text-lg font-bold text-text-main group-hover:text-primary transition-colors print:text-text-main">{order.orderNo}</p>
                      <p className="text-sm text-text-muted mt-1">{formatDateTime(order.createdAt)}</p>
                    </div>
                    
                    <div className="sm:text-right flex items-center sm:justify-end gap-4">
                      <div>
                        <p className="text-sm font-medium text-text-muted mb-1">Total</p>
                        <p className="text-xl font-bold text-text-main">{formatPrice(order.totalAmount)}</p>
                        <div className="flex gap-2 mt-2 sm:justify-end">
                          {getOrderStatusBadge(order.orderStatus)}
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </div>
                      </div>
                      <div className="hidden sm:flex text-accent group-hover:translate-x-1 transition-transform print:hidden">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-6 justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-muted mb-2">Purchased Items</p>
                      <ul className="text-sm text-text-main space-y-1">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, idx) => (
                            <li key={idx}>
                              {item.productName} × {item.qty}
                            </li>
                          ))
                        ) : (
                          <li className="italic text-text-muted">Item data unavailable</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="flex-1 md:text-right">
                      <p className="text-sm font-medium text-text-muted mb-2">Tracking</p>
                      {order.trackingNumbers && order.trackingNumbers.length > 0 ? (
                        <ul className="text-sm text-text-main space-y-1">
                          {order.trackingNumbers.map((trk, idx) => (
                            <li key={idx} className="font-mono">{trk}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-text-muted">Not available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {pageData && pageData.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border-subtle pt-6 mt-8 print:hidden">
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={pageData.first || loading}
                  className="rounded-md border border-border-subtle bg-surface px-4 py-2 text-sm font-medium text-text-main hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-text-muted">
                  Page <span className="font-medium text-text-main">{pageData.number + 1}</span> of{' '}
                  <span className="font-medium text-text-main">{pageData.totalPages}</span>
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(pageData.totalPages - 1, p + 1))}
                  disabled={pageData.last || loading}
                  className="rounded-md border border-border-subtle bg-surface px-4 py-2 text-sm font-medium text-text-main hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
