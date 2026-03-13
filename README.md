# Global Max Services LLC — Website

Production website for Global Max Services LLC (USDOT #3491280).  
Static frontend + Vercel serverless API + shared Supabase backend + Telnyx SMS alerts.

## Stack

- **Frontend:** Static HTML/CSS/JS with GSAP animations (in `/public`)
- **API:** Vercel Serverless Functions (in `/api`)
- **Database:** Supabase (`oschjeuhejqibymdaqxw`) — shared project
- **SMS:** Telnyx API on form submission

## Project Structure

```
├── public/
│   ├── index.html          # Main website
│   ├── admin.html          # Admin dashboard (view/manage submissions)
│   └── images/
│       ├── logo.png
│       ├── hero-warehouse.png
│       ├── hero-port.png
│       └── hero-road.png
├── api/
│   ├── submit.js           # POST form submissions → Supabase + SMS
│   └── admin.js            # Admin CRUD (GET/PATCH/DELETE) with auth
├── supabase-migration.sql  # Run once in Supabase SQL editor
├── vercel.json             # Routing config
├── package.json            # Dependencies
└── .env.example            # Required environment variables
```

## Deployment

### 1. Run the SQL migration

Go to: https://supabase.com/dashboard/project/oschjeuhejqibymdaqxw/sql/new

Paste and run `supabase-migration.sql`. Creates two tables:
- `gms_shipping_inquiries`
- `gms_driver_applications`

### 2. Create GitHub repo

```bash
git init
git add .
git commit -m "Initial commit — Global Max Services website"
git remote add origin https://github.com/gibsonthompson/global-max-services.git
git branch -M main
git push -u origin main
```

### 3. Deploy on Vercel

1. Go to vercel.com → Add New Project
2. Import from GitHub → select `global-max-services`
3. Framework Preset: **Other**
4. Output Directory: **public**
5. Add environment variables (see `.env.example`):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://oschjeuhejqibymdaqxw.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | (from Supabase dashboard → Settings → API) |
| `TELNYX_API_KEY` | (your Telnyx API key) |
| `TELNYX_PHONE_NUMBER` | (your Telnyx 10DLC sending number) |
| `GMS_NOTIFY_PHONE` | (phone number for SMS alerts, e.g. `+17701234567`) |
| `GMS_ADMIN_KEY` | (pick any strong string — this IS the dashboard password) |

6. Deploy

### 4. Custom domain (optional)

In Vercel → Project → Settings → Domains → add the domain.
Point DNS A record to Vercel's IP.

## How It Works

**Form Submission Flow:**
1. User fills shipping inquiry or driver application on `index.html`
2. Frontend POSTs to `/api/submit`
3. API inserts row into the correct Supabase table
4. API fires Telnyx SMS to `GMS_NOTIFY_PHONE`
5. User sees success confirmation

**Admin Dashboard:**
1. Navigate to `/admin.html`
2. Enter the `GMS_ADMIN_KEY` value as password
3. View all submissions, filter by type/status, search
4. Click any row to view details, mark reviewed, archive, or delete
5. Export to CSV

## SMS Alert Format

**Shipping inquiry:**
```
New GMS Quote Request

John Smith
+14045551234
john@company.com
Chicago, IL → Dallas, TX
Cargo: General Freight
Weight: 40,000 lbs
```

**Driver application:**
```
New GMS Driver App

Mike Johnson
+17705551234
mike@email.com
Atlanta, GA
CDL: Class A
Exp: 5-10 years
```
