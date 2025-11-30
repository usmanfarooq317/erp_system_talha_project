-- Create database
CREATE DATABASE erp_system;

-- Connect to the database
erp_system;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    previous_pending DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendors table
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    place VARCHAR(255),
    company VARCHAR(255),
    remaining DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales table
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    previous_pending DECIMAL(15,2) DEFAULT 0,
    total_sale DECIMAL(15,2) DEFAULT 0,
    grand_total DECIMAL(15,2) DEFAULT 0,
    paid_now DECIMAL(15,2) DEFAULT 0,
    pending DECIMAL(15,2) DEFAULT 0,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales line items table
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 0,
    weight DECIMAL(10,2) DEFAULT 0,
    price_per_kg DECIMAL(10,2) DEFAULT 0,
    line_total DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchases table
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_name VARCHAR(255) NOT NULL,
    grand_total DECIMAL(15,2) DEFAULT 0,
    paid_now DECIMAL(15,2) DEFAULT 0,
    pending DECIMAL(15,2) DEFAULT 0,
    mode_of_payment VARCHAR(50) DEFAULT 'cash',
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase line items table
CREATE TABLE purchase_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    qty INTEGER DEFAULT 0,
    weight DECIMAL(10,2) DEFAULT 0,
    price_per_kg DECIMAL(10,2) DEFAULT 0,
    line_total DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor transactions table
CREATE TABLE vendor_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('received', 'paid', 'goods')),
    amount DECIMAL(15,2) NOT NULL,
    method VARCHAR(100),
    bill_ref VARCHAR(255),
    balance_after DECIMAL(15,2) DEFAULT 0,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock table
CREATE TABLE stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_name VARCHAR(255) NOT NULL,
    bag_weight DECIMAL(10,2) NOT NULL,
    bags INTEGER DEFAULT 0,
    total_weight DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_name, bag_weight)
);

-- Stock movements table
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'sale')),
    record_id UUID NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    bag_weight DECIMAL(10,2) NOT NULL,
    qty_bags INTEGER NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recycle bin tables
CREATE TABLE recycle_bin_sales (
    id UUID PRIMARY KEY,
    customer_id UUID,
    customer_name VARCHAR(255) NOT NULL,
    previous_pending DECIMAL(15,2) DEFAULT 0,
    total_sale DECIMAL(15,2) DEFAULT 0,
    grand_total DECIMAL(15,2) DEFAULT 0,
    paid_now DECIMAL(15,2) DEFAULT 0,
    pending DECIMAL(15,2) DEFAULT 0,
    date TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recycle_bin_purchases (
    id UUID PRIMARY KEY,
    vendor_name VARCHAR(255) NOT NULL,
    grand_total DECIMAL(15,2) DEFAULT 0,
    paid_now DECIMAL(15,2) DEFAULT 0,
    pending DECIMAL(15,2) DEFAULT 0,
    mode_of_payment VARCHAR(50) DEFAULT 'cash',
    date TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recycle_bin_vendors (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    place VARCHAR(255),
    company VARCHAR(255),
    remaining DECIMAL(15,2) DEFAULT 0,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recycle_bin_customers (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    previous_pending DECIMAL(15,2) DEFAULT 0,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO users (username, password) VALUES ('admin', 'admin');

-- Create indexes for better performance
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_purchases_date ON purchases(date);
CREATE INDEX idx_purchase_items_purchase_id ON purchase_items(purchase_id);
CREATE INDEX idx_vendor_transactions_vendor_id ON vendor_transactions(vendor_id);
CREATE INDEX idx_vendor_transactions_date ON vendor_transactions(date);
CREATE INDEX idx_stock_product_bag ON stock(product_name, bag_weight);
CREATE INDEX idx_stock_movements_date ON stock_movements(date);