import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { supabase } from '../../lib/supabase';
import { Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { getBusyDays, getDeliverySettings } from '../../lib/deliveryCalculator';
import { useLanguage } from '../../contexts/LanguageContext';
import 'react-calendar/dist/Calendar.css';

interface Order {
    id: string;
    total_amount: number;
    currency: string;
    status: string;
    delivery_date: string | null;
    created_at: string;
}

interface CustomerDeliveryCalendarProps {
    userId: string;
}

export default function CustomerDeliveryCalendar({ userId }: CustomerDeliveryCalendarProps) {
    const { t } = useLanguage();
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestReason, setRequestReason] = useState('');
    const [requestedDate, setRequestedDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Busy days and settings
    const [busyDays, setBusyDays] = useState<Set<string>>(new Set());
    const [deliverySettings, setDeliverySettings] = useState({
        standard_delivery_days: 3,
        busy_day_penalty_days: 1
    });

    useEffect(() => {
        loadOrders();
        loadBusyDays();
        loadSettings();
    }, [userId]);

    const loadOrders = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (data) {
            setOrders(data);
        }
        setLoading(false);
    };

    const loadBusyDays = async () => {
        const days = await getBusyDays();
        // @ts-ignore - Supabase type inference issue with new tables
        const datesSet = new Set(days.map(d => d.busy_date));
        setBusyDays(datesSet);
    };

    const loadSettings = async () => {
        const settings = await getDeliverySettings();
        setDeliverySettings(settings);
    };

    const getDeliveryOrdersForDate = (date: Date) => {
        return orders.filter(order => {
            if (!order.delivery_date) return false;
            const deliveryDate = new Date(order.delivery_date);
            return (
                deliveryDate.getDate() === date.getDate() &&
                deliveryDate.getMonth() === date.getMonth() &&
                deliveryDate.getFullYear() === date.getFullYear()
            );
        });
    };

    const tileContent = ({ date, view }: any) => {
        if (view === 'month') {
            const deliveriesOnDate = getDeliveryOrdersForDate(date);

            return (
                <div className="flex flex-col items-center gap-1 mt-1">
                    {deliveriesOnDate.length > 0 && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" title={`${deliveriesOnDate.length} delivery(ies)`} />
                    )}
                </div>
            );
        }
    };

    const tileClassName = ({ date, view }: any) => {
        if (view === 'month') {
            const dateStr = date.toISOString().split('T')[0];
            if (busyDays.has(dateStr)) {
                return 'busy-day';
            }
        }
        return '';
    };

    const handleSubmitRequest = async () => {
        if (!selectedOrder || !requestReason) {
            alert('Please provide a reason for the change request');
            return;
        }

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('delivery_change_requests')
                // @ts-ignore - Supabase type inference issue with new tables
                .insert({
                    order_id: selectedOrder.id,
                    customer_id: userId,
                    requested_date: requestedDate || null,
                    reason: requestReason,
                    status: 'pending'
                });

            if (error) throw error;

            alert('Change request submitted successfully!');
            setShowRequestForm(false);
            setSelectedOrder(null);
            setRequestReason('');
            setRequestedDate('');
        } catch (error) {
            console.error('Error submitting request:', error);
            alert('Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    const deliveriesOnSelectedDate = getDeliveryOrdersForDate(selectedDate);
    const ordersWithDelivery = orders.filter(o => o.delivery_date);
    const ordersWithoutDelivery = orders.filter(o => !o.delivery_date);

    if (loading) {
        return <div className="text-center py-8">Loading your orders...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Delivery Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-900">
                        <p className="font-medium mb-1">{t('standardDeliveryTimeDays').replace('{days}', String(deliverySettings.standard_delivery_days))}</p>
                        <p>{t('busyDaysInfo').replace('{penalty}', String(deliverySettings.busy_day_penalty_days))}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm text-gray-600">{t('deliveryScheduled')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-sm text-gray-600">{t('busyDay')}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">{t('yourDeliveryDates')}</h3>
                    <Calendar
                        onChange={(value: any) => setSelectedDate(value)}
                        value={selectedDate}
                        tileContent={tileContent}
                        tileClassName={tileClassName}
                        className="w-full border-none"
                    />
                    <style>{`
                        .busy-day {
                            background-color: #fee2e2 !important;
                            color: #991b1b !important;
                        }
                        .busy-day:hover {
                            background-color: #fecaca !important;
                        }
                    `}</style>
                </div>

                {/* Orders for selected date */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5" />
                        {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </h3>

                    {deliveriesOnSelectedDate.length > 0 ? (
                        <div className="space-y-3">
                            {deliveriesOnSelectedDate.map(order => (
                                <div
                                    key={order.id}
                                    className="p-4 bg-green-50 border border-green-200 rounded-lg"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                                            <p className="text-sm text-gray-600">{order.total_amount} {order.currency}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Ordered: {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                                            Delivery Today
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setRequestedDate(order.delivery_date || '');
                                            setShowRequestForm(true);
                                        }}
                                        className="mt-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                                    >
                                        Request Date Change
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">{t('noDeliveriesScheduled')}</p>
                    )}
                </div>
            </div>

            {/* All Orders Summary */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Your Orders</h3>

                {ordersWithDelivery.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">With Delivery Dates ({ordersWithDelivery.length})</h4>
                        <div className="space-y-2">
                            {ordersWithDelivery.map(order => (
                                <div
                                    key={order.id}
                                    className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                                        <p className="text-sm text-gray-600">{order.total_amount} {order.currency}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-green-600">
                                            {new Date(order.delivery_date!).toLocaleDateString()}
                                        </p>
                                        <button
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setRequestedDate(order.delivery_date || '');
                                                setShowRequestForm(true);
                                            }}
                                            className="text-xs text-orange-600 hover:text-orange-700 mt-1"
                                        >
                                            Request Change
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {ordersWithoutDelivery.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Pending Delivery Date ({ordersWithoutDelivery.length})</h4>
                        <div className="space-y-2">
                            {ordersWithoutDelivery.map(order => (
                                <div
                                    key={order.id}
                                    className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                                        <p className="text-sm text-gray-600">{order.total_amount} {order.currency}</p>
                                    </div>
                                    <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">
                                        Date not set
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {orders.length === 0 && (
                    <p className="text-gray-500 text-center py-8">You haven't placed any orders yet</p>
                )}
            </div>

            {/* Change Request Modal */}
            {showRequestForm && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">Request Delivery Date Change</h3>

                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-2">Order Details:</p>
                            <p className="font-medium">Order #{selectedOrder.id.slice(0, 8)}</p>
                            <p className="text-sm text-gray-600">{selectedOrder.total_amount} {selectedOrder.currency}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Current delivery: {selectedOrder.delivery_date
                                    ? new Date(selectedOrder.delivery_date).toLocaleDateString()
                                    : 'Not set'}
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Preferred New Date (Optional)
                            </label>
                            <input
                                type="date"
                                value={requestedDate ? new Date(requestedDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => setRequestedDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                min={new Date().toISOString().split('T')[0]}
                            />
                            <p className="text-xs text-gray-500 mt-1">Leave empty if you don't have a specific date in mind</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for Change *
                            </label>
                            <textarea
                                value={requestReason}
                                onChange={(e) => setRequestReason(e.target.value)}
                                placeholder="Please explain why you need to change the delivery date..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                rows={4}
                                required
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleSubmitRequest}
                                disabled={!requestReason || submitting}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-400 via-orange-500 to-yellow-500 text-white rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowRequestForm(false);
                                    setSelectedOrder(null);
                                    setRequestReason('');
                                    setRequestedDate('');
                                }}
                                disabled={submitting}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
