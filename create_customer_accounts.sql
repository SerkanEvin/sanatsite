-- ============================================
-- Customer Account Database Schema
-- ============================================
-- This schema supports customer authentication, order tracking,
-- favorites, artist following, and notifications
-- ============================================

-- 1. CUSTOMERS TABLE
-- Stores customer account information
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP WITH TIME ZONE
);

-- 2. CUSTOMER ADDRESSES TABLE
-- Stores shipping and billing addresses for customers
CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    address_type VARCHAR(20) NOT NULL CHECK (address_type IN ('shipping', 'billing')),
    is_default BOOLEAN DEFAULT false,
    full_name VARCHAR(200),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CUSTOMER ORDERS TABLE
-- Stores order information for customers
CREATE TABLE customer_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    order_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    shipping_address_id UUID REFERENCES customer_addresses(id),
    billing_address_id UUID REFERENCES customer_addresses(id),
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE
);

-- 4. ORDER ITEMS TABLE
-- Stores individual items within each order
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES customer_orders(id) ON DELETE CASCADE,
    artwork_id UUID NOT NULL REFERENCES artworks(id),
    variation_id UUID REFERENCES artwork_variations(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    artist_id UUID REFERENCES artists(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. CUSTOMER FAVORITES TABLE
-- Stores artworks that customers have favorited
CREATE TABLE customer_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, artwork_id)
);

-- 6. CUSTOMER ARTIST FOLLOWS TABLE
-- Stores which artists customers are following
CREATE TABLE customer_artist_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, artist_id)
);

-- 7. CUSTOMER NOTIFICATIONS TABLE
-- Stores notifications for customers (e.g., new artwork from followed artists)
CREATE TABLE customer_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('new_artwork', 'order_update', 'promotion', 'system')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_artwork_id UUID REFERENCES artworks(id) ON DELETE SET NULL,
    related_artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
    related_order_id UUID REFERENCES customer_orders(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

-- 8. CUSTOMER SESSIONS TABLE (Optional - for session management)
-- Stores active customer sessions
CREATE TABLE customer_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES for Performance Optimization
-- ============================================

-- Customer indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_created_at ON customers(created_at);

-- Address indexes
CREATE INDEX idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX idx_customer_addresses_is_default ON customer_addresses(customer_id, is_default);

-- Order indexes
CREATE INDEX idx_customer_orders_customer_id ON customer_orders(customer_id);
CREATE INDEX idx_customer_orders_order_number ON customer_orders(order_number);
CREATE INDEX idx_customer_orders_status ON customer_orders(order_status);
CREATE INDEX idx_customer_orders_created_at ON customer_orders(created_at DESC);

-- Order items indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_artwork_id ON order_items(artwork_id);
CREATE INDEX idx_order_items_artist_id ON order_items(artist_id);

-- Favorites indexes
CREATE INDEX idx_customer_favorites_customer_id ON customer_favorites(customer_id);
CREATE INDEX idx_customer_favorites_artwork_id ON customer_favorites(artwork_id);

-- Follows indexes
CREATE INDEX idx_customer_artist_follows_customer_id ON customer_artist_follows(customer_id);
CREATE INDEX idx_customer_artist_follows_artist_id ON customer_artist_follows(artist_id);

-- Notifications indexes
CREATE INDEX idx_customer_notifications_customer_id ON customer_notifications(customer_id);
CREATE INDEX idx_customer_notifications_is_read ON customer_notifications(customer_id, is_read);
CREATE INDEX idx_customer_notifications_created_at ON customer_notifications(created_at DESC);

-- Sessions indexes
CREATE INDEX idx_customer_sessions_customer_id ON customer_sessions(customer_id);
CREATE INDEX idx_customer_sessions_token ON customer_sessions(session_token);
CREATE INDEX idx_customer_sessions_expires_at ON customer_sessions(expires_at);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_addresses_updated_at
    BEFORE UPDATE ON customer_addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_orders_updated_at
    BEFORE UPDATE ON customer_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create notification when artist adds new artwork
CREATE OR REPLACE FUNCTION notify_followers_on_new_artwork()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert notifications for all followers of the artist
    INSERT INTO customer_notifications (customer_id, notification_type, title, message, related_artwork_id, related_artist_id)
    SELECT 
        caf.customer_id,
        'new_artwork',
        'New Artwork Available',
        'An artist you follow has added a new artwork: ' || NEW.title,
        NEW.id,
        NEW.artist_id
    FROM customer_artist_follows caf
    WHERE caf.artist_id = NEW.artist_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to notify followers when new artwork is added
CREATE TRIGGER trigger_notify_followers_on_new_artwork
    AFTER INSERT ON artworks
    FOR EACH ROW
    EXECUTE FUNCTION notify_followers_on_new_artwork();

-- Function to generate unique order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'ORD-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Trigger to auto-generate order number
CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON customer_orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION generate_order_number();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on tables (uncomment if using Supabase or similar)

-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE customer_favorites ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE customer_artist_follows ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE customer_notifications ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE customer_sessions ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (customize based on your authentication system)
-- Customers can only see their own data
-- CREATE POLICY customers_select_own ON customers FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY customers_update_own ON customers FOR UPDATE USING (auth.uid() = id);

-- CREATE POLICY customer_orders_select_own ON customer_orders FOR SELECT USING (customer_id = auth.uid());
-- CREATE POLICY customer_favorites_all_own ON customer_favorites FOR ALL USING (customer_id = auth.uid());
-- CREATE POLICY customer_notifications_all_own ON customer_notifications FOR ALL USING (customer_id = auth.uid());

-- ============================================
-- SAMPLE QUERIES FOR COMMON OPERATIONS
-- ============================================

-- Get customer's past orders with items
-- SELECT 
--     co.order_number,
--     co.order_status,
--     co.total_amount,
--     co.created_at,
--     json_agg(json_build_object(
--         'artwork_id', oi.artwork_id,
--         'quantity', oi.quantity,
--         'unit_price', oi.unit_price
--     )) as items
-- FROM customer_orders co
-- JOIN order_items oi ON co.id = oi.order_id
-- WHERE co.customer_id = 'CUSTOMER_UUID_HERE'
-- GROUP BY co.id
-- ORDER BY co.created_at DESC;

-- Get customer's favorites with artwork details
-- SELECT 
--     cf.created_at as favorited_at,
--     a.*
-- FROM customer_favorites cf
-- JOIN artworks a ON cf.artwork_id = a.id
-- WHERE cf.customer_id = 'CUSTOMER_UUID_HERE'
-- ORDER BY cf.created_at DESC;

-- Get customer's followed artists
-- SELECT 
--     caf.created_at as followed_at,
--     ar.*
-- FROM customer_artist_follows caf
-- JOIN artists ar ON caf.artist_id = ar.id
-- WHERE caf.customer_id = 'CUSTOMER_UUID_HERE'
-- ORDER BY caf.created_at DESC;

-- Get unread notifications for customer
-- SELECT *
-- FROM customer_notifications
-- WHERE customer_id = 'CUSTOMER_UUID_HERE'
--   AND is_read = false
-- ORDER BY created_at DESC;

-- Mark notification as read
-- UPDATE customer_notifications
-- SET is_read = true, read_at = CURRENT_TIMESTAMP
-- WHERE id = 'NOTIFICATION_UUID_HERE' AND customer_id = 'CUSTOMER_UUID_HERE';
