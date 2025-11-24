-- Agent X Platform - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'Saloon', 'Gym', 'Real Estate', 'Restaurants', 'Education', 
        'Healthcare', 'Retail', 'Technology', 'Consulting', 'Other'
    )),
    description TEXT NOT NULL,
    start_year INTEGER NOT NULL CHECK (start_year >= 1900 AND start_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
    logo TEXT,
    products JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_active ON businesses(is_active);

-- Add constraint: one business per owner
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_business_per_owner ON businesses(owner_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT
    USING (true); -- We handle auth in backend

-- Anyone can insert (for registration)
CREATE POLICY "Anyone can insert users" ON users
    FOR INSERT
    WITH CHECK (true);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- RLS Policies for businesses table
-- Anyone can read active businesses (for public chat)
CREATE POLICY "Anyone can read active businesses" ON businesses
    FOR SELECT
    USING (is_active = true);

-- Authenticated users can insert their own business
CREATE POLICY "Users can create own business" ON businesses
    FOR INSERT
    WITH CHECK (true); -- We handle owner validation in backend

-- Users can update their own business
CREATE POLICY "Users can update own business" ON businesses
    FOR UPDATE
    USING (true); -- We handle owner validation in backend

-- Users can delete their own business
CREATE POLICY "Users can delete own business" ON businesses
    FOR DELETE
    USING (true); -- We handle owner validation in backend

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update updated_at on businesses table
CREATE TRIGGER update_businesses_updated_at
    BEFORE UPDATE ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample query to verify tables
-- SELECT * FROM users;
-- SELECT * FROM businesses;
