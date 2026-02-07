import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { supabase } from '../../lib/supabase';
import { Calendar as CalendarIcon, Settings, AlertCircle } from 'lucide-react';
import {
    getBusyDays,
    toggleBusyDay,
    getDeliverySettings,
    updateDeliverySettings
} from '../../lib/deliveryCalculator';
import { useLanguage } from '../../contexts/LanguageContext';
import 'react-calendar/dist/Calendar.css';

interface Order {
    id: string;
    user_id: string;
    total_amount: number;
    currency: string;
    status: string;
    delivery_date: string | null;
    created_at: string;
    shipping_address: any;
}

interface DeliveryCalendarProps {
    // No props needed - calendar is now only for managing busy days
}

export default function DeliveryCalendar({ }: DeliveryCalendarProps) {
    const { t } = useLanguage();
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Busy days and settings
    const [busyDays, setBusyDays] = useState<Set<string>>(new Set());
    const [deliverySettings, setDeliverySettings] = useState({
        standard_delivery_days: 3,
        busy_day_penalty_days: 1
    });
    const [showSettings, setShowSettings] = useState(false);
    const [editStandardDays, setEditStandardDays] = useState(3);
    const [editPenaltyDays, setEditPenaltyDays] = useState(1);

    useEffect(() => {
        loadOrders();
        loadBusyDays();
        loadSettings();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) {
            setOrders(data);
        }
        setLoading(false);
    };

    const loadBusyDays = async () => {
        const days = await getBusyDays();
        const datesSet = new Set<string>((days as any).map((d: any) => d.busy_date));
        setBusyDays(datesSet);
    };

    const loadSettings = async () => {
        const settings = await getDeliverySettings();
        setDeliverySettings(settings);
        setEditStandardDays(settings.standard_delivery_days);
        setEditPenaltyDays(settings.busy_day_penalty_days);
    };

    const handleToggleBusyDay = async (date: Date) => {
        const user = await supabase.auth.getUser();
        if (!user.data.user) return;

        await toggleBusyDay(date, user.data.user.id);
        await loadBusyDays();
    };

    const handleSaveSettings = async () => {
        const user = await supabase.auth.getUser();
        if (!user.data.user) return;

        setSaving(true);
        try {
            await updateDeliverySettings(editStandardDays, editPenaltyDays, user.data.user.id);
            await loadSettings();
            setShowSettings(false);
            alert(t('deliverySettingsUpdated'));
        } catch (error) {
            console.error('Error updating settings:', error);
            alert(t('failedToUpdateSettings'));
        } finally {
            setSaving(false);
        }
    };

    const getOrdersForDate = (date: Date) => {
        return orders.filter(order => {
            const orderDate = new Date(order.created_at);
            return (
                orderDate.getDate() === date.getDate() &&
                orderDate.getMonth() === date.getMonth() &&
                orderDate.getFullYear() === date.getFullYear()
            );
        });
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
            const ordersOnDate = getOrdersForDate(date);
            const deliveriesOnDate = getDeliveryOrdersForDate(date);

            return (
                <div className="flex flex-col items-center gap-1 mt-1">
                    {ordersOnDate.length > 0 && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" title={`${ordersOnDate.length} order(s)`} />
                    )}
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

    const ordersOnSelectedDate = getOrdersForDate(selectedDate);
    const deliveriesOnSelectedDate = getDeliveryOrdersForDate(selectedDate);
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    const isSelectedDateBusy = busyDays.has(selectedDateStr);

    if (loading) {
        return <div className="text-center py-8">{t('loadingOrders')}</div>;
    }

    return (
        <div className="space-y-6">
            {/* Settings Button */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <span className="text-sm text-gray-600">{t('orderPlaced')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span className="text-sm text-gray-600">{t('deliveryScheduled')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <span className="text-sm text-gray-600">{t('busyDay')}</span>
                    </div>
                </div>
                <button
                    onClick={() => setShowSettings(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                    <Settings className="w-4 h-4" />
                    {t('deliverySettings')}
                </button>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-900">
                        <p className="font-medium mb-1">{t('automaticDeliveryCalculation')}</p>
                        <p>{t('deliveryDatesAutomaticallyCalculated')}</p>
                        <p className="mt-1">• {t('standardDelivery')}: {deliverySettings.standard_delivery_days} {t('days')}</p>
                        <p>• {t('eachBusyDayAdds').replace('{penalty}', String(deliverySettings.busy_day_penalty_days))}</p>
                        <p className="mt-2 text-xs font-medium">{t('clickToMarkBusyDay')}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar */}
                <div className="bg-white p-4 rounded-lg shadow">
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

                    {/* Busy Day Toggle */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <button
                            onClick={() => handleToggleBusyDay(selectedDate)}
                            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${isSelectedDateBusy
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {isSelectedDateBusy ? t('removeBusyDay') : t('markAsBusyDay')}
                        </button>
                    </div>

                    {/* Orders placed on this date */}
                    {ordersOnSelectedDate.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('ordersPlaced')} ({ordersOnSelectedDate.length})</h4>
                            <div className="space-y-2">
                                {ordersOnSelectedDate.map(order => (
                                    <div
                                        key={order.id}
                                        className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                                                <p className="text-sm text-gray-600">{order.total_amount} {order.currency}</p>
                                                <p className="text-xs text-gray-500 mt-1">{t('statusLabel')}: {order.status}</p>
                                            </div>
                                            {order.delivery_date ? (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                                    {t('deliveryLabel')}: {new Date(order.delivery_date).toLocaleDateString()}
                                                </span>
                                            ) : (
                                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                                    {t('noDeliveryDate')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Deliveries scheduled for this date */}
                    {deliveriesOnSelectedDate.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('scheduledDeliveries')} ({deliveriesOnSelectedDate.length})</h4>
                            <div className="space-y-2">
                                {deliveriesOnSelectedDate.map(order => (
                                    <div
                                        key={order.id}
                                        className="p-3 bg-green-50 border border-green-200 rounded-lg"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                                                <p className="text-sm text-gray-600">{order.total_amount} {order.currency}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {t('orderedLabel')}: {new Date(order.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {ordersOnSelectedDate.length === 0 && deliveriesOnSelectedDate.length === 0 && (
                        <p className="text-gray-500 text-center py-8">{t('noOrdersOrDeliveries')}</p>
                    )}
                </div>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">{t('deliverySettings')}</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('standardDeliveryDays')}
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={editStandardDays}
                                onChange={(e) => setEditStandardDays(parseInt(e.target.value) || 3)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">{t('defaultDeliveryDays')}</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('busyDayPenalty')}
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={editPenaltyDays}
                                onChange={(e) => setEditPenaltyDays(parseInt(e.target.value) || 2)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">{t('extraDaysPerBusyDay')}</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleSaveSettings}
                                disabled={saving}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-400 via-orange-500 to-yellow-500 text-white rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50"
                            >
                                {saving ? t('saving') : t('saveSettings')}
                            </button>
                            <button
                                onClick={() => {
                                    setShowSettings(false);
                                    setEditStandardDays(deliverySettings.standard_delivery_days);
                                    setEditPenaltyDays(deliverySettings.busy_day_penalty_days);
                                }}
                                disabled={saving}
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
