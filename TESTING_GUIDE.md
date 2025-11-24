# Agent X Platform - Testing Guide

## 🎯 Current Status

✅ **Backend:** Running on http://localhost:3000  
✅ **Frontend:** Running on http://localhost:5173  
⚠️ **Database:** Tables need to be created (see setup below)

**Health Check Result:**
```json
{
  "status": "ok",
  "message": "Agent X Multi-Business Platform API with Supabase",
  "supabase": "error",  ← Tables not created yet
  "gemini": "configured"
}
```

---

## 📝 Setup Required BEFORE Testing

### Create Supabase Tables (One-Time Setup)

**Steps:**

1. **Open Supabase SQL Editor**
   - Go to: https://svnpjkbxesvriuihwvvb.supabase.co
   - Login to your Supabase account
   - Click **"SQL Editor"** in left sidebar

2. **Run the Schema**
   - Click **"New Query"** button
   - Open file: `server/supabase-schema.sql`
   - **Copy ALL the SQL** (from CREATE TABLE to the end)
   - **Paste** into Supabase SQL Editor
   - Click **"Run"** button (or press Ctrl+Enter)

3. **Verify Success**
   You should see: `Success. No rows returned`

4. **Check Tables Created**
   Run this query to verify:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
   
   You should see:
   - `users`
   - `businesses`

---

## 🧪 Testing Instructions

Once tables are created, follow this testing sequence:

### Test 1: Registration (Create Account)

1. **Open Browser**
   - Go to: http://localhost:5173
   - You'll see the **Login Page**

2. **Click "Register here"**

3. **Fill Registration Form:**
   - **Name:** Test User
   - **Email:** test@example.com
   - **Password:** password123
   - **Confirm Password:** password123

4. **Click "Create Account"**

5. **Expected Result:**
   - ✅ Redirects to `/onboarding`
   - ✅ Shows "Business Onboarding" page

6. **If Error Occurs:**
   - Check browser console (F12)
   - Check server terminal for errors
   - Verify Supabase tables exist

---

### Test 2: Business Creation

On the Business Onboarding page:

1. **Fill Business Details:**
   - **Business Name:** "Shining Stars Salon"
   - **Category:** Select "Saloon"
   - **Description:** "Premium hair and beauty salon in Mumbai offering top-notch services"
   - **Start Year:** 2020

2. **Add Products:**
   - **Product 1:**
     - Name: Haircut
     - Price: 500
     - Description: Professional haircut service
   
   - Click **"+ Add Product"**
   
   - **Product 2:**
     - Name: Hair Coloring
     - Price: 1500
     - Description: Premium hair coloring
   
   - **Product 3:**
     - Name: Facial
     - Price: 800
     - Description: Refreshing facial treatment

3. **Click "Create Business Profile"**

4. **Expected Result:**
   - ✅ Redirects to `/dashboard`
   - ✅ Shows your business information
   - ✅ Shows shareable chat link

---

### Test 3: Dashboard Features

On the Dashboard:

1. **Verify Display:**
   - ✅ Business name shown in header
   - ✅ Business category displayed
   - ✅ All 3 products listed with prices
   - ✅ "Welcome, Test User" in header

2. **Copy Chat Link:**
   - Click **"Copy"** button next to chat link
   - Link format: `http://localhost:5173/chat/[uuid]`

3. **Click "Test Chat Interface"**
   - Should open chat page

---

### Test 4: Chat Interface

1. **Enter Your Name:**
   - Type: "Rahul"
   - Click "Start Chat"

2. **Initial Greeting:**
   - ✅ AI introduces itself with random Indian name
   - ✅ Mentions "Shining Stars Salon"
   - Example: *"Hello Rahul, I am from Shining Stars Salon. I am your assistant Priya Sharma. How can I help you today?"*

3. **Test Conversation (English):**
   ```
   You: "I want a haircut"
   AI: Should recommend Haircut service at ₹500
   ```

4. **Test Hindi/Hinglish:**
   ```
   You: "Mujhe haircut chahiye"
   AI: Should respond in Hindi/Hinglish
   ```

5. **Test Product Knowledge:**
   ```
   You: "What services do you offer?"
   AI: Should mention all 3 products
   ```

6. **Test Language Switching:**
   ```
   You: "Hair coloring kitne ka hai?"
   AI: Should respond in Hinglish
   ```

---

## ✅ Success Checklist

After testing, verify:

- [x] Registration works ✅
- [x] Business creation successful ✅
- [x] Dashboard shows correct data ✅
- [x] Chat link generated ✅
- [x] Chat interface loads ✅
- [x] AI greets with business name ✅
- [x] AI mentions products ✅
- [x] AI responds in user's language ✅
- [x] No "I am an AI" mentions ✅

---

## 🔍 Verify in Supabase

After testing, check database:

1. Go to Supabase Dashboard
2. Click **"Table Editor"**

**Check `users` table:**
```sql
SELECT id, name, email, created_at FROM users;
```
Should show: test@example.com

**Check `businesses` table:**
```sql
SELECT business_name, category, products FROM businesses;
```
Should show: Shining Stars Salon with 3 products

---

## 🐛 Troubleshooting

### Error: "User already exists"
**Solution:** Use different email or delete from Supabase

### Error: "Business not found"
**Solution:** Check businessId in URL matches database

### Error: "Gemini API Key not configured"
**Solution:** Check `server/.env` has GEMINI_API_KEY

### Error: "Network error"
**Solution:** 
- Backend not running? Start: `node index.js`
- Check CORS settings

### AI not responding properly
**Solution:**
- Check Gemini API key is valid
- Check server console for errors

---

## 📊 Expected Database State

After testing, your Supabase should have:

**users table:**
| id | name | email | password (hashed) |
|----|------|-------|-------------------|
| uuid | Test User | test@example.com | $2a$10$... |

**businesses table:**
| id | owner_id | business_name | category | products (JSON) |
|---|---|---|---|---|
| uuid | user-uuid | Shining Stars Salon | Saloon | [{name: "Haircut", price: 500}, ...] |

---

## 🎉 Next Steps After Testing

If all tests pass:

1. **Create More Businesses**
   - Logout and register another user
   - Create different business (Gym, Restaurant, etc.)
   - Test multiple business chats

2. **Test Edge Cases**
   - Very long business names
   - Many products (10+)
   - Special characters in product names

3. **Production Prep**
   - Deploy to Vercel/Netlify
   - Use production Gemini API key
   - Set up custom domain

---

## 🚀 You're Ready!

Once Supabase tables are created, the platform is fully functional and ready for testing!

**Quick Start:**
1. Run SQL schema in Supabase ✅
2. Open http://localhost:5173 ✅
3. Register → Create Business → Test Chat ✅

Good luck! 🎉
