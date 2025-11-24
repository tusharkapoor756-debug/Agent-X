# Supabase Setup Guide for Agent X Platform

## 🎯 Quick Setup Instructions

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project: https://svnpjkbxesvriuihwvvb.supabase.co
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Schema SQL

1. Open the file `server/supabase-schema.sql`
2. Copy ALL the SQL code
3. Paste it into the Supabase SQL Editor
4. Click **Run** button (or press Ctrl+Enter)

### Step 3: Verify Tables Created

After running the SQL, verify the tables were created:

```sql
-- Check users table
SELECT * FROM users;

-- Check businesses table
SELECT * FROM businesses;
```

You should see empty tables with the correct columns.

## 📊 Database Schema Overview

### `users` Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| name | VARCHAR(50) | User's full name |
| email | VARCHAR(255) | Email (unique) |
| password | VARCHAR(255) | Hashed password (bcrypt) |
| created_at | TIMESTAMPTZ | Auto-generated timestamp |
| updated_at | TIMESTAMPTZ | Auto-updated timestamp |

### `businesses` Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| owner_id | UUID | Foreign key to users.id |
| business_name | VARCHAR(100) | Business name |
| category | VARCHAR(50) | Business category (enum) |
| description | TEXT | Business description |
| start_year | INTEGER | Year business started |
| logo | TEXT | Logo URL (optional) |
| products | JSONB | Array of products (JSON) |
| is_active | BOOLEAN | Active status (default: true) |
| created_at | TIMESTAMPTZ | Auto-generated timestamp |
| updated_at | TIMESTAMPTZ | Auto-updated timestamp |

## ✅ Features Enabled

- ✅ **Row Level Security (RLS)** - Security policies in place
- ✅ **Auto-timestamps** - created_at and updated_at auto-managed
- ✅ **Constraints** - One business per owner enforced
- ✅ **Indexes** - Optimized for common queries
- ✅ **Cascading Deletes** - Delete user → deletes their business

## 🔐 Security Notes

- Passwords are hashed with bcrypt before storage
- RLS policies allow public read for active businesses
- Authentication handled by JWT in backend
- Supabase anon key is safe to expose in frontend

## 🧪 Test Queries

After setup, you can run these queries to test:

```sql
-- Count users
SELECT COUNT(*) FROM users;

-- Count businesses
SELECT COUNT(*) FROM businesses;

-- View all active businesses
SELECT business_name, category FROM businesses WHERE is_active = true;
```

## 🚀 Ready to Use

Once you've run the schema SQL:
1. Start the backend server: `node index.js`
2. Start the frontend: `npm run dev`
3. Register a new user
4. Create your business profile
5. Start chatting!
