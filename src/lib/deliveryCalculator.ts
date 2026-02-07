import { supabase } from './supabase';

/**
 * Calculate delivery date based on order date, standard delivery days, and busy days
 * @param orderDate The date the order was placed
 * @returns The calculated delivery date
 */
export async function calculateDeliveryDate(orderDate: Date): Promise<Date> {
    // Get delivery settings
    // @ts-ignore - Supabase type inference issue with new tables
    const { data: settings } = await supabase
        .from('delivery_settings')
        .select('*')
        .single();

    const standardDays = settings?.standard_delivery_days || 3;
    const penaltyDays = settings?.busy_day_penalty_days || 1;

    // Get all busy days
    // @ts-ignore - Supabase type inference issue with new tables
    const { data: busyDays } = await supabase
        .from('busy_days')
        .select('busy_date');

    const busyDatesSet = new Set(
        busyDays?.map(d => d.busy_date) || []
    );

    // Calculate initial delivery date (order date + standard days)
    let deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + standardDays);

    // Count busy days between order date and initial delivery date
    let busyDayCount = 0;
    const currentDate = new Date(orderDate);
    currentDate.setDate(currentDate.getDate() + 1); // Start from day after order

    while (currentDate <= deliveryDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        if (busyDatesSet.has(dateStr)) {
            busyDayCount++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add penalty days for each busy day encountered
    if (busyDayCount > 0) {
        deliveryDate.setDate(deliveryDate.getDate() + (busyDayCount * penaltyDays));
    }

    return deliveryDate;
}

/**
 * Get delivery settings from database
 */
export async function getDeliverySettings() {
    const { data, error } = await supabase
        .from('delivery_settings')
        .select('*')
        .single();

    if (error) {
        console.error('Error fetching delivery settings:', error);
        return {
            standard_delivery_days: 3,
            busy_day_penalty_days: 2
        };
    }

    return data;
}

/**
 * Update delivery settings
 */
export async function updateDeliverySettings(
    standardDays: number,
    penaltyDays: number,
    userId: string
) {
    const { data: existing } = await supabase
        .from('delivery_settings')
        .select('id')
        .single();

    if (existing) {
        // @ts-ignore - Supabase type inference issue with new tables
        return await supabase
            .from('delivery_settings')
            .update({
                standard_delivery_days: standardDays,
                busy_day_penalty_days: penaltyDays,
                updated_at: new Date().toISOString(),
                updated_by: userId
            })
            .eq('id', existing.id);
    } else {
        // @ts-ignore - Supabase type inference issue with new tables
        return await supabase
            .from('delivery_settings')
            .insert({
                standard_delivery_days: standardDays,
                busy_day_penalty_days: penaltyDays,
                updated_by: userId
            });
    }
}

/**
 * Get all busy days
 */
export async function getBusyDays() {
    const { data, error } = await supabase
        .from('busy_days')
        .select('*')
        .order('busy_date', { ascending: true });

    if (error) {
        console.error('Error fetching busy days:', error);
        return [];
    }

    return data || [];
}

/**
 * Toggle a busy day (add if not exists, remove if exists)
 */
export async function toggleBusyDay(date: Date, userId: string, notes?: string) {
    const dateStr = date.toISOString().split('T')[0];

    // Check if day is already marked as busy
    const { data: existing } = await supabase
        .from('busy_days')
        .select('id')
        .eq('busy_date', dateStr)
        .maybeSingle(); // Use maybeSingle() to avoid 406 error when no row exists

    if (existing) {
        // Remove busy day
        // @ts-ignore - Supabase type inference issue with new tables
        return await supabase
            .from('busy_days')
            .delete()
            .eq('id', existing.id);
    } else {
        // Add busy day
        // @ts-ignore - Supabase type inference issue with new tables
        return await supabase
            .from('busy_days')
            .insert({
                busy_date: dateStr,
                created_by: userId,
                notes: notes || null
            });
    }
}
