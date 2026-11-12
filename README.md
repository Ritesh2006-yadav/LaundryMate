# LPU | LMS – Hostel Laundry Management System
### Lovely Professional University • Division of Student Welfare Initiative

A complete, production-grade digital laundry management system designed specifically for the 25,000+ hostel residents of Lovely Professional University across BH-1 to BH-8 and GH-1 to GH-6.

---

## 🎨 Design System & Visual Identity
- **Primary Purple:** `#6633CC`
- **Dark Purple:** `#211747`
- **Deep Background:** `#17112F`
- **LPU Orange:** `#F58220`
- **Light Background:** `#F5F4FA`
- **White:** `#FFFFFF`

---

## 🚀 Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** **JavaScript ONLY** (Strict 0 TypeScript, zero `.ts` or `.tsx` files)
- **Styling:** Tailwind CSS + Custom CSS Variables & Animations
- **Icons:** Lucide React
- **Analytics Charts:** Recharts
- **Database & Auth:** Supabase PostgreSQL + Row-Level Security (RLS)

---

## 👥 Roles & Portals

### 1. Student Portal (`/student/login` & `/student/dashboard`)
- **Dashboard:** 4 live metric cards, quick action panel, hero service booking banner with 3D basket art, and recent requests table.
- **New Request (`/student/new-request`):** 4-step wizard:
  1. *Service Selection:* Wash Only (₹30/kg), Wash & Fold (₹40/kg), Wash & Iron (₹50/kg), Wash, Dry & Iron (₹60/kg), Iron Only (₹20/kg).
  2. *Details & Count:* Garment breakdown for shirts, t-shirts, trousers, linens, towels.
  3. *Doorstep Pickup:* Hostel block & room verification with selectable time windows.
  4. *Review & Payment:* Prepaid Hostel Wallet, UPI/Net Banking, or Cash on Collection.
- **Live Order Tracking (`/student/track-order`):** 7-checkpoint timeline (`Request Placed` → `Picked Up` → `In Washing` → `In Drying` → `Ironing` → `Ready for Delivery` → `Delivered`) with 3D washing machine graphic.
- **Raise Complaint (`/student/complaints`):** Missing/damaged clothes report with photo evidence upload.
- **My Orders (`/student/my-orders`):** Comprehensive order history with status filters.
- **Profile (`/student/profile`):** Hostel residence info, room number, and prepaid laundry balance.

### 2. Staff Portal (`/staff/login` & `/staff/dashboard`)
- **Intake Queue:** Incoming requests, in-process loads, ready for delivery, and completed counts.
- **Update Status Modal:** Quick status transition with operator remarks.
- **Plant Inventory (`/staff/inventory`):** Stock monitors for industrial detergents, fabric softeners, and waterproof RFID tags.
- **Shift Reports (`/staff/reports`):** Daily operational throughput and wash load logs.
- **Grievances (`/staff/complaints`):** Student ticket review desk.

### 3. Administrator Portal (`/admin/login` & `/admin/dashboard`)
- **Analytics Dashboard:**
  - Executive KPIs: Total Users (`1,248`), Total Orders (`428`), Completed (`396`), On-Time Delivery (`94%`).
  - **Order Trend Line Chart:** Weekly intake visualization using Recharts.
  - **Order Status Distribution Donut Chart:** Ratio of completed, in-process, and cancelled orders.
- **Directories:** Enrolled student directory, staff roster, laundry order ledger with CSV exports, grievance audits, service tariff editor, and hostel quota settings.

---

## 🔑 Demo Quick Credentials

| Role | Username / ID | Password | Access Route |
|---|---|---|---|
| **Student** | `LPU12345678` | *(Any / pre-filled)* | `/student/login` |
| **Laundry Staff** | `STF-8821` | `staff@123` | `/staff/login` |
| **Admin** | `ADM-LPU-01` | `admin@123` | `/admin/login` |

---

## 🛠️ Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build

# 4. Start production server
npm start
```
The application runs on `http://localhost:3000`.

---

## 🗄️ Database Setup (Supabase)
To connect your own Supabase project:
1. Copy `.env.local.example` to `.env.local` and add your project URL and Anon key.
2. Run `supabase/schema.sql` in the Supabase SQL Editor to initialize all tables, RLS policies, and seed data.

