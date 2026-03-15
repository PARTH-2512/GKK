# Ghar Ka Khana — Setup & Testing Guide

## Step 1: Apply RLS Policies

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the entire contents of `scripts/rls_policies.sql`
4. Paste and click **Run**

This creates all Row Level Security policies for every table.

---

## Step 2: Seed Demo Data

You need your **Service Role Key** (not the anon key).
Find it in: Supabase Dashboard → Settings → API → `service_role` key

### Windows CMD:
```cmd
set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
node scripts/seed.js
```

### Windows PowerShell:
```powershell
$env:SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"
node scripts/seed.js
```

### Mac/Linux:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here node scripts/seed.js
```

---

## Step 3: Start the App

```bash
npm run dev
```

Open: http://localhost:5173

---

## Demo Accounts

| Role     | Email                        | Password  |
|----------|------------------------------|-----------|
| Admin    | admin_demo@example.com       | Demo@123  |
| Cook     | kitchen_demo@example.com     | Demo@123  |
| Customer | customer1_demo@example.com   | Demo@123  |
| Customer | customer2_demo@example.com   | Demo@123  |

---

## What the Seed Creates

- **4 demo accounts** (admin, cook, 2 customers)
- **1 approved kitchen** — "Meena's Ghar Ka Khana"
- **6 categories** — Breakfast, Lunch, Dinner, Snacks, Sweets, Beverages
- **12 food items** — Dal Baati Churma, Gujarati Thali, Poha, Methi Thepla, etc.
- **7 orders** — mix of completed, preparing, accepted, cancelled
- **2 reviews** — 5★ and 4★ for the demo kitchen

---

## Test Flows

### Customer Flow
1. Login as `customer1_demo@example.com` / `Demo@123`
2. Browse home page → see "Meena's Ghar Ka Khana"
3. Click kitchen → browse 12 food items
4. Add items to cart → go to cart → place order
5. Go to My Orders → see order history + status stepper
6. Logout → login again → verify session persistence

### Cook Flow
1. Login as `kitchen_demo@example.com` / `Demo@123`
2. Dashboard shows stats + live orders
3. Accept/reject pending orders
4. Go to Menu → add/edit food items
5. Go to Settings → toggle kitchen active/pause

### Admin Flow
1. Login as `admin_demo@example.com` / `Demo@123`
2. Dashboard shows platform stats
3. Manage Kitchens → approve/reject
4. Manage Users → ban/unban
5. Admin Logs → view all actions
