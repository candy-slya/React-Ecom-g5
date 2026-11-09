import { Pagination } from "../../../components/common/Pagination";
import React, { useEffect, useState } from 'react';
import { orderApi } from '../api/orderApi';
import type { GetMyOrdersParams } from '../api/orderApi';
import type { OrderDetailResponse, OrderListResponse, Page } from '../types';
import { useNavigate } from 'react-router-dom';
import { formatDateTime } from '../../../utils/formatters';
import { refundApi } from '../../refund/api/refundApi';
import type { RefundResponseDto } from '../../refund/types';

export const OrderHistoryPage: React.FC = () => {
  const [pageData, setPageData] = useState<Page<OrderListResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const saved = sessionStorage.getItem('orderHistoryPage');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  
  // Filter form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [dateError, setDateError] = useState('');

  // Currently applied filters (for API calls and pagination)
  const [appliedFilters, setAppliedFilters] = useState<GetMyOrdersParams>({});
  const [downloadingReport, setDownloadingReport] = useState(false);

  const [resumingOrderId, setResumingOrderId] = useState<number | null>(null);
  const [resumeError, setResumeError] = useState<{ orderId: number; message: string } | null>(null);
  const [myRefunds, setMyRefunds] = useState<RefundResponseDto[]>([]);
  const [orderItemMap, setOrderItemMap] = useState<Record<number, number[]>>({});

  const navigate = useNavigate();

  const handleResumePayment = async (e: React.MouseEvent, orderId: number) => {
    e.stopPropagation();
    setResumingOrderId(orderId);
    setResumeError(null);

    try {
      const updatedOrder = await orderApi.resumePayment(orderId);
      navigate(`/payment/${orderId}`, { state: { order: updatedOrder } });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        'Payment cannot be resumed because one or more items are no longer available in the required quantity.';
      setResumeError({ orderId, message: msg });
    } finally {
      setResumingOrderId(null);
    }
  };

  const fetchOrders = async (page: number, filters: GetMyOrdersParams = appliedFilters) => {
    try {
      setLoading(true);
      setError(null);
      const [data, refunds] = await Promise.all([
        orderApi.getMyOrders({ ...filters, page, size: 10 }),
        refundApi.getMyRefunds().catch(() => [] as RefundResponseDto[])
      ]);
      const itemMap: Record<number, number[]> = {};
      if (refunds.length > 0 && data?.content) {
        const deliveredOrders = data.content.filter((o) => o.orderStatus === 'DELIVERED');
        await Promise.all(
          deliveredOrders.map(async (o) => {
            const directIds = o.items?.map((it) => it.orderItemId).filter(Boolean) as number[];
            if (directIds && directIds.length > 0) {
              itemMap[o.orderId] = directIds;
            } else {
              try {
                const detail = (await orderApi.getOrderById(o.orderId)) as unknown as OrderDetailResponse;
                itemMap[o.orderId] = detail.items?.map((it) => it.orderItemId) || [];
              } catch (e) {
                // fallback
              }
            }
          })
        );
      }
      setOrderItemMap(itemMap);
      setPageData(data);
      setMyRefunds(refunds);
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

  useEffect(() => {
    if (!loading && pageData && pageData.content.length > 0) {
      const targetOrderId = sessionStorage.getItem('lastViewedOrderId');
      if (targetOrderId) {
        const timer = setTimeout(() => {
          const el = document.getElementById(`order-${targetOrderId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-2', 'ring-primary');
            setTimeout(() => {
              el.classList.remove('ring-2', 'ring-primary');
              sessionStorage.removeItem('lastViewedOrderId');
            }, 2000);
          }
        }, 120);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, pageData]);

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
    sessionStorage.setItem('orderHistoryPage', '0');
    sessionStorage.removeItem('lastViewedOrderId');
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setOrderStatus('');
    setOrderNo('');
    setDateError('');
    setAppliedFilters({});
    setCurrentPage(0);
    sessionStorage.setItem('orderHistoryPage', '0');
    sessionStorage.removeItem('lastViewedOrderId');
  };

  const handleDownloadReportPdf = async () => {
    try {
      setDownloadingReport(true);
      const blob = await orderApi.downloadOrderHistoryPdf(appliedFilters);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `order-history-report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Failed to download order history report PDF:', err);
      let errMsg = 'Failed to download report PDF. Please try again.';
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          errMsg = parsed.message || parsed.error || text;
        } catch {
          // not JSON
        }
      } else if (err?.response?.data?.message) {
        errMsg = err.response.data.message;
      }
      alert(errMsg);
    } finally {
      setDownloadingReport(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' MMK';
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

  const getPaymentStatusBadge = (order: OrderListResponse) => {
    let text = order.paymentStatus;
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';

    if (order.orderStatus === 'CANCELLED') {
      text = 'PAYMENT FAILED';
      bgColor = 'bg-[#B42318]/10';
      textColor = 'text-[#B42318]';
    } else if (order.orderStatus === 'PENDING') {
      if (order.paymentStatus === 'PENDING') {
        if (order.isExpired) {
          text = 'ORDER EXPIRED';
          bgColor = 'bg-[#B42318]/10';
          textColor = 'text-[#B42318]';
        } else if (order.hasInitiatedPayment) {
          text = 'PAYMENT PROCESSING';
          bgColor = 'bg-sky-100';
          textColor = 'text-sky-800';
        } else {
          text = 'PAYMENT PENDING';
          bgColor = 'bg-[#B7791F]/10';
          textColor = 'text-[#B7791F]';
        }
      } else if (order.paymentStatus === 'FAILED') {
        text = 'PAYMENT FAILED';
        bgColor = 'bg-[#B42318]/10';
        textColor = 'text-[#B42318]';
      }
    } else if (order.orderStatus !== 'DELIVERED') {
      text = 'SUCCESS';
      bgColor = 'bg-[#2E7D32]/10';
      textColor = 'text-[#2E7D32]';
    } else {
      const itemIds = orderItemMap[order.orderId] || (order.items?.map((it) => it.orderItemId).filter(Boolean) as number[]) || [];
      const orderRefunds = myRefunds.filter((r) => {
        if (itemIds.length > 0) {
          return itemIds.includes(r.orderItemId);
        }
        if (r.orderId) {
          return r.orderId === order.orderId;
        }
        return false;
      });

      const approvedCount = orderRefunds.filter((r) => r.status === 'APPROVED').length;
      const rejectedCount = orderRefunds.filter((r) => r.status === 'REJECTED').length;
      const pendingCount = orderRefunds.filter((r) => r.status === 'PENDING').length;

      if (orderRefunds.length > 0) {
        if (approvedCount > 0 && rejectedCount > 0) {
          text = 'PARTIALLY REFUNDED';
          bgColor = 'bg-amber-100';
          textColor = 'text-amber-800';
        } else if (approvedCount > 0 && rejectedCount === 0) {
          text = 'REFUND APPROVED';
          bgColor = 'bg-emerald-100';
          textColor = 'text-emerald-800';
        } else if (rejectedCount > 0 && approvedCount === 0) {
          text = 'REFUND REJECTED';
          bgColor = 'bg-[#B42318]/10';
          textColor = 'text-[#B42318]';
        } else if (pendingCount > 0) {
          text = 'REFUND PENDING';
          bgColor = 'bg-amber-100';
          textColor = 'text-amber-800';
        } else {
          text = 'SUCCESS';
          bgColor = 'bg-[#2E7D32]/10';
          textColor = 'text-[#2E7D32]';
        }
      } else {
        switch (order.paymentStatus) {
          case 'PARTIALLY_REFUNDED':
            text = 'PARTIALLY REFUNDED';
            bgColor = 'bg-amber-100';
            textColor = 'text-amber-800';
            break;
          case 'REFUNDED':
            text = 'REFUND APPROVED';
            bgColor = 'bg-emerald-100';
            textColor = 'text-emerald-800';
            break;
          case 'FAILED':
            text = 'PAYMENT FAILED';
            bgColor = 'bg-[#B42318]/10';
            textColor = 'text-[#B42318]';
            break;
          case 'PENDING':
            text = 'PAYMENT PENDING';
            bgColor = 'bg-[#B7791F]/10';
            textColor = 'text-[#B7791F]';
            break;
          default:
            text = 'SUCCESS';
            bgColor = 'bg-[#2E7D32]/10';
            textColor = 'text-[#2E7D32]';
            break;
        }
      }
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${bgColor} ${textColor}`}>
        {text}
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
            onClick={handleDownloadReportPdf}
            disabled={downloadingReport}
            className="mt-4 sm:mt-0 inline-flex items-center rounded-md bg-accent text-slate-950 px-4 py-2 text-sm font-bold shadow-sm hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed print:hidden cursor-pointer"
          >
            {downloadingReport ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Downloading PDF...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print / Save PDF
              </>
            )}
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
            {pageData?.content.map((order) => {
              // Final UX Rule 1: Pay Now appears ONLY when order is unpaid PENDING with active reservation
              const isNotExpired =
                !order.isExpired &&
                (!order.reservationExpiresAt || new Date(order.reservationExpiresAt).getTime() > Date.now());

              // Order Expired ONLY for unpaid PENDING orders whose reservation has lapsed
              const isOrderExpired =
                order.orderStatus === 'PENDING' &&
                order.paymentStatus === 'PENDING' &&
                Boolean(
                  order.isExpired ||
                  (order.reservationExpiresAt && new Date(order.reservationExpiresAt).getTime() <= Date.now()) ||
                  order.reservationActive === false
                );

              const isPayable =
                order.orderStatus === 'PENDING' &&
                order.paymentStatus === 'PENDING' &&
                order.hasInitiatedPayment === false &&
                order.reservationActive === true &&
                isNotExpired;

              // Final UX Rule 2: Processing state has NO action button (wait only)
              const isProcessing =
                order.orderStatus === 'PENDING' &&
                order.paymentStatus === 'PENDING' &&
                order.hasInitiatedPayment === true;

              return (
              <div
                key={order.orderId}
                id={`order-${order.orderId}`}
                onClick={() => {
                  sessionStorage.setItem('lastViewedOrderId', String(order.orderId));
                  sessionStorage.setItem('orderHistoryPage', String(currentPage));
                  navigate(`/orders/${order.orderId}`);
                }}
                className="rounded-lg border border-border-subtle bg-surface shadow-sm overflow-hidden cursor-pointer hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent group print:border-b print:border-border-subtle print:shadow-none print:break-inside-avoid print:cursor-auto"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    sessionStorage.setItem('lastViewedOrderId', String(order.orderId));
                    sessionStorage.setItem('orderHistoryPage', String(currentPage));
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
                          {isOrderExpired ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#B42318]/10 text-[#B42318]">
                              ORDER EXPIRED
                            </span>
                          ) : (
                            getOrderStatusBadge(order.orderStatus)
                          )}
                          {!isOrderExpired && getPaymentStatusBadge(order)}
                        </div>

                        {/* Pay Now: ONLY when payment not started + reservation active */}
                        {isPayable && (
                          <div className="mt-3 flex sm:justify-end print:hidden">
                            <button
                              type="button"
                              onClick={(e) => handleResumePayment(e, order.orderId)}
                              disabled={resumingOrderId === order.orderId}
                              className="inline-flex items-center justify-center rounded-md bg-primary text-white px-4 py-1.5 text-xs font-bold shadow-sm hover:bg-primary-hover transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                            >
                              {resumingOrderId === order.orderId ? (
                                <>
                                  <div className="h-3.5 w-3.5 mr-1.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                  Resuming...
                                </>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                  </svg>
                                  Pay Now
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {/* Payment Processing: Wait only */}
                        {isProcessing && (
                          <div className="mt-3 flex sm:justify-end print:hidden">
                            <span className="text-xs font-medium text-sky-800 bg-sky-50 border border-sky-200 rounded-md px-3 py-1.5 inline-flex items-center">
                              <span className="relative flex h-2 w-2 mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                              </span>
                              Please wait for the payment result
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="hidden sm:flex text-accent group-hover:translate-x-1 transition-transform print:hidden">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {resumeError?.orderId === order.orderId && (
                    <div className="mb-4 rounded-md bg-[#FEF3F2] p-2.5 border border-[#FEE4E2] print:hidden">
                      <p className="text-xs font-medium text-[#B42318]">{resumeError.message}</p>
                    </div>
                  )}
                  
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
            );
            })}

            {/* Pagination Controls */}
            {pageData && (
              <div className="print:hidden">
                <Pagination
                  currentPage={currentPage + 1}
                  totalPages={pageData.totalPages}
                  disabled={loading}
                  onPageChange={(page) => {
                    const next = page - 1;
                    sessionStorage.setItem('orderHistoryPage', String(next));
                    setCurrentPage(next);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
