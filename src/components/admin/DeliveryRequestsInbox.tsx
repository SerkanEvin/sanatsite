import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Inbox, Check, X, Calendar, MessageSquare } from 'lucide-react';
import { queueDeliveryEmail } from '../../lib/emailService';
import { useLanguage } from '../../contexts/LanguageContext';
import type { DeliveryChangeRequest } from '../../lib/database.types';

interface DeliveryRequestsInboxProps {
    onRequestHandled?: () => void;
}

export default function DeliveryRequestsInbox({ onRequestHandled }: DeliveryRequestsInboxProps) {
    const { t } = useLanguage();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [adminResponse, setAdminResponse] = useState('');
    const [newDeliveryDate, setNewDeliveryDate] = useState('');

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('delivery_change_requests')
            .select(`
        *,
        orders (
          id,
          total_amount,
          currency,
          delivery_date,
          created_at
        )
      `)
            .order('created_at', { ascending: false });

        if (data) {
            setRequests(data);
        }
        setLoading(false);
    };

    const handleApprove = async (request: any) => {
        if (!newDeliveryDate) {
            alert(t('pleaseSelectNewDeliveryDate'));
            return;
        }

        setProcessing(request.id);
        try {
            const user = (await supabase.auth.getUser()).data.user;

            // Update the request status
            const { error: requestError } = await supabase
                .from('delivery_change_requests')
                .update({
                    status: 'approved',
                    admin_response: adminResponse || t('submissionApproved'),
                    responded_by: user?.id,
                    responded_at: new Date().toISOString()
                })
                .eq('id', request.id);

            if (requestError) throw requestError;

            // Update the order's delivery date
            const { error: orderError } = await supabase
                .from('orders')
                .update({
                    delivery_date: new Date(newDeliveryDate).toISOString(),
                    delivery_date_set_at: new Date().toISOString(),
                    delivery_date_set_by: user?.id
                })
                .eq('id', request.order_id);

            if (orderError) throw orderError;

            // Send email notification to customer
            try {
                const { data: userData } = await supabase.auth.admin.getUserById(request.customer_id);

                if (userData?.user?.email) {
                    await queueDeliveryEmail({
                        type: 'request_approved',
                        orderId: request.order_id,
                        customerEmail: userData.user.email,
                        deliveryDate: new Date(newDeliveryDate).toISOString(),
                        adminResponse: adminResponse || undefined,
                        orderNumber: `#${request.orders?.id?.slice(0, 8)}`
                    });
                }
            } catch (emailError) {
                console.error('Error sending email notification:', emailError);
                // Don't fail the whole operation if email fails
            }

            await loadRequests();
            setSelectedRequest(null);
            setAdminResponse('');
            setNewDeliveryDate('');
            if (onRequestHandled) onRequestHandled();
        } catch (error) {
            console.error('Error approving request:', error);
            alert(t('failedToApproveRequest'));
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (request: any) => {
        if (!adminResponse) {
            alert(t('pleaseProvideRejectionReason'));
            return;
        }

        setProcessing(request.id);
        try {
            const user = (await supabase.auth.getUser()).data.user;

            const { error } = await supabase
                .from('delivery_change_requests')
                .update({
                    status: 'rejected',
                    admin_response: adminResponse,
                    responded_by: user?.id,
                    responded_at: new Date().toISOString()
                })
                .eq('id', request.id);

            if (error) throw error;

            // Send email notification to customer
            try {
                const { data: userData } = await supabase.auth.admin.getUserById(request.customer_id);

                if (userData?.user?.email) {
                    await queueDeliveryEmail({
                        type: 'request_rejected',
                        orderId: request.order_id,
                        customerEmail: userData.user.email,
                        adminResponse: adminResponse,
                        orderNumber: `#${request.orders?.id?.slice(0, 8)}`
                    });
                }
            } catch (emailError) {
                console.error('Error sending email notification:', emailError);
                // Don't fail the whole operation if email fails
            }

            await loadRequests();
            setSelectedRequest(null);
            setAdminResponse('');
            if (onRequestHandled) onRequestHandled();
        } catch (error) {
            console.error('Error rejecting request:', error);
            alert(t('failedToRejectRequest'));
        } finally {
            setProcessing(null);
        }
    };

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const handledRequests = requests.filter(r => r.status !== 'pending');

    if (loading) {
        return <div className="text-center py-8">{t('loadingRequests')}</div>;
    }

    return (
        <div className="space-y-6">
            {/* Pending Requests */}
            <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Inbox className="w-5 h-5" />
                    {t('pendingRequests')} ({pendingRequests.length})
                </h3>

                {pendingRequests.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                        {t('noPendingRequests')}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingRequests.map(request => (
                            <div
                                key={request.id}
                                className="bg-white border border-orange-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Order #{request.orders?.id?.slice(0, 8)}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {request.orders?.total_amount} {request.orders?.currency}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {t('currentDelivery')}: {request.orders?.delivery_date
                                                ? new Date(request.orders.delivery_date).toLocaleDateString()
                                                : t('notSet')}
                                        </p>
                                    </div>
                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                        {t('pending')}
                                    </span>
                                </div>

                                {request.requested_date && (
                                    <div className="mb-2 text-sm">
                                        <span className="text-gray-600">{t('requestedDate')}: </span>
                                        <span className="font-medium">{new Date(request.requested_date).toLocaleDateString()}</span>
                                    </div>
                                )}

                                <div className="mb-3 p-3 bg-gray-50 rounded">
                                    <p className="text-sm font-medium text-gray-700 mb-1">{t('customerReason')}:</p>
                                    <p className="text-sm text-gray-600">{request.reason}</p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedRequest(request);
                                            setNewDeliveryDate(request.requested_date || request.orders?.delivery_date || '');
                                        }}
                                        disabled={processing === request.id}
                                        className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
                                    >
                                        <Check className="w-4 h-4 inline mr-1" />
                                        {t('reviewAndApprove')}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedRequest(request);
                                            setAdminResponse('');
                                        }}
                                        disabled={processing === request.id}
                                        className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                                    >
                                        <X className="w-4 h-4 inline mr-1" />
                                        {t('reject')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Handled Requests */}
            {handledRequests.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">{t('recentHistory')} ({handledRequests.length})</h3>
                    <div className="space-y-2">
                        {handledRequests.slice(0, 5).map(request => (
                            <div
                                key={request.id}
                                className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            Order #{request.orders?.id?.slice(0, 8)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(request.responded_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded ${request.status === 'approved'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                        }`}>
                                        {request.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">
                            {processing ? t('processing') : t('reviewRequest')}
                        </h3>

                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-2">{t('orderDetails')}:</p>
                            <p className="font-medium">Order #{selectedRequest.orders?.id?.slice(0, 8)}</p>
                            <p className="text-sm text-gray-600">{selectedRequest.orders?.total_amount} {selectedRequest.orders?.currency}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {t('currentDelivery')}: {selectedRequest.orders?.delivery_date
                                    ? new Date(selectedRequest.orders.delivery_date).toLocaleDateString()
                                    : t('notSet')}
                            </p>
                        </div>

                        <div className="mb-4 p-3 bg-blue-50 rounded">
                            <p className="text-sm font-medium text-gray-700 mb-1">{t('customerReason')}:</p>
                            <p className="text-sm text-gray-600">{selectedRequest.reason}</p>
                        </div>

                        {newDeliveryDate !== undefined && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('newDeliveryDate')} *
                                </label>
                                <input
                                    type="date"
                                    value={newDeliveryDate ? new Date(newDeliveryDate).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setNewDeliveryDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('responseToCustomer')} {newDeliveryDate === undefined && '*'}
                            </label>
                            <textarea
                                value={adminResponse}
                                onChange={(e) => setAdminResponse(e.target.value)}
                                placeholder={newDeliveryDate !== undefined ? t('optionalMessageToCustomer') : t('reasonForRejection')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-3">
                            {newDeliveryDate !== undefined ? (
                                <button
                                    onClick={() => handleApprove(selectedRequest)}
                                    disabled={!newDeliveryDate || processing === selectedRequest.id}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {processing === selectedRequest.id ? t('approving') : t('approve')}
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleReject(selectedRequest)}
                                    disabled={!adminResponse || processing === selectedRequest.id}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {processing === selectedRequest.id ? t('rejecting') : t('reject')}
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setSelectedRequest(null);
                                    setAdminResponse('');
                                    setNewDeliveryDate('');
                                }}
                                disabled={processing === selectedRequest.id}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                {t('cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
