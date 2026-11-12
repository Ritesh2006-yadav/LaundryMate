-- ==============================================================================
-- LPU | LMS (Hostel Laundry Management System) - Complete Production Database Schema
-- Lovely Professional University
-- PostgreSQL + Supabase Database Schema with Strict RLS and Role-Based Access
-- ==============================================================================

-- Enable UUID & Cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. SEQUENCES FOR COLLISION-PROOF HUMAN-READABLE IDENTIFIERS
-- ==============================================================================
CREATE SEQUENCE IF NOT EXISTS order_id_seq START WITH 1100;
CREATE SEQUENCE IF NOT EXISTS complaint_id_seq START WITH 950;
CREATE SEQUENCE IF NOT EXISTS inquiry_id_seq START WITH 8900;

-- ==============================================================================
-- 2. ENUMS AND CUSTOM TYPES
-- ==============================================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'staff', 'warden', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'Request Placed',
    'Request Accepted',
    'Clothes Picked Up',
    'In Washing',
    'In Drying',
    'Ironing',
    'Ready for Delivery',
    'Delivered',
    'Cancelled'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('Pending', 'Paid', 'Refunded', 'Failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE complaint_status AS ENUM (
    'Submitted',
    'Under Review',
    'Investigation',
    'Resolved',
    'Rejected'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE inquiry_status AS ENUM ('New', 'In Progress', 'Resolved', 'Closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE inventory_category AS ENUM (
    'Detergent',
    'Washing Powder',
    'Fabric Conditioner',
    'Laundry Bags',
    'Packaging Materials',
    'Other Supplies'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE stock_transaction_type AS ENUM ('Restock', 'Usage', 'Adjustment', 'Initial');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==============================================================================
-- 3. HOSTELS (Residential Buildings)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.hostels (
  id TEXT PRIMARY KEY, -- e.g. 'BH-1', 'BH-2', 'GH-1'
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Boys', 'Girls', 'Co-ed')),
  blocks TEXT[] NOT NULL DEFAULT '{}',
  hub_zone TEXT NOT NULL DEFAULT 'Central Laundry Complex',
  total_rooms INTEGER NOT NULL DEFAULT 400,
  capacity INTEGER NOT NULL DEFAULT 800,
  warden_id UUID, -- Foreign Key linked to profiles(id)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. PROFILES (Extends auth.users - Identity Core)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  assigned_hostel_id TEXT REFERENCES public.hostels(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key constraint back from hostels to profiles
ALTER TABLE public.hostels 
  DROP CONSTRAINT IF EXISTS fk_hostels_warden,
  ADD CONSTRAINT fk_hostels_warden FOREIGN KEY (warden_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ==============================================================================
-- 5. STUDENTS & STAFF EXTENSION TABLES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  reg_no TEXT UNIQUE NOT NULL,
  hostel_id TEXT NOT NULL REFERENCES public.hostels(id),
  hostel_block TEXT NOT NULL,
  room_number TEXT NOT NULL,
  wallet_balance NUMERIC(10,2) NOT NULL DEFAULT 1000.00 CHECK (wallet_balance >= 0),
  monthly_quota_items INTEGER NOT NULL DEFAULT 30,
  quota_used_items INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Deactivated', 'Graduated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  staff_id TEXT UNIQUE NOT NULL,
  designation TEXT NOT NULL DEFAULT 'Laundry Operations Specialist',
  assigned_hub TEXT NOT NULL DEFAULT 'Central Laundry Complex - North Wing',
  shift TEXT NOT NULL DEFAULT 'Morning (07:00 AM - 03:30 PM)',
  efficiency_score NUMERIC(4,2) DEFAULT 98.50,
  is_on_duty BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. LAUNDRY SERVICES (Tariffs & Catalog)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY, -- e.g. 'wash-fold', 'wash-iron'
  name TEXT NOT NULL,
  price_per_kg NUMERIC(8,2) NOT NULL CHECK (price_per_kg >= 0),
  unit TEXT NOT NULL DEFAULT '/kg',
  turnaround_sla TEXT NOT NULL DEFAULT '24-48 hrs',
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Sparkles',
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. ORDERS (Full Laundry Lifecycle Master)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT ('LMS' || nextval('order_id_seq')::text),
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  service_id TEXT NOT NULL REFERENCES public.services(id),
  service_name_snapshot TEXT NOT NULL, -- Preserves price/name history
  price_per_kg_snapshot NUMERIC(8,2) NOT NULL,
  status order_status NOT NULL DEFAULT 'Request Placed',
  payment_status payment_status NOT NULL DEFAULT 'Paid',
  items_count INTEGER NOT NULL DEFAULT 1 CHECK (items_count > 0),
  approx_weight_kg NUMERIC(6,2) NOT NULL DEFAULT 3.0 CHECK (approx_weight_kg > 0),
  actual_weight_kg NUMERIC(6,2) CHECK (actual_weight_kg IS NULL OR actual_weight_kg > 0),
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  hostel_id TEXT NOT NULL REFERENCES public.hostels(id),
  hostel_block TEXT NOT NULL,
  room_number TEXT NOT NULL,
  pickup_date DATE NOT NULL,
  pickup_slot TEXT NOT NULL,
  special_instructions TEXT,
  assigned_staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  intake_verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  machine_bay TEXT,
  picked_up_at TIMESTAMPTZ,
  washing_started_at TIMESTAMPTZ,
  drying_started_at TIMESTAMPTZ,
  ironing_started_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  delivery_handover_mode TEXT,
  delivery_recipient_notes TEXT,
  delivery_issue TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 8. ORDER ITEMS & AUDIT STATUS HISTORY
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  special_care_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 9. COMPLAINTS & INVESTIGATION HISTORY
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.complaints (
  id TEXT PRIMARY KEY DEFAULT ('CMP-' || nextval('complaint_id_seq')::text),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  hostel_id TEXT NOT NULL REFERENCES public.hostels(id),
  type TEXT NOT NULL CHECK (type IN ('Missing Garment', 'Fabric Damage', 'Delayed Delivery', 'Poor Quality', 'Billing Discrepancy', 'Other')),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  description TEXT NOT NULL,
  evidence_url TEXT,
  status complaint_status NOT NULL DEFAULT 'Submitted',
  assigned_staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  staff_response TEXT,
  resolution_type TEXT,
  compensation_amount NUMERIC(10,2) DEFAULT 0.00 CHECK (compensation_amount >= 0),
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.complaint_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id TEXT NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  stage complaint_status NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DEDICATED COMPLAINT INTERNAL NOTES TABLE (Zero student access)
CREATE TABLE IF NOT EXISTS public.complaint_internal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id TEXT NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  author_name TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 10. CONTACT INQUIRIES (Helpdesk & Administration Inbox)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id TEXT PRIMARY KEY DEFAULT ('INQ-' || to_char(now(), 'YYYY') || '-' || nextval('inquiry_id_seq')::text),
  full_name TEXT NOT NULL,
  email_or_reg TEXT NOT NULL,
  hostel_residence TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General Inquiry',
  subject TEXT,
  message TEXT NOT NULL,
  status inquiry_status NOT NULL DEFAULT 'New',
  admin_notes TEXT,
  admin_response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 11. NOTIFICATIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY DEFAULT ('notif-' || gen_random_uuid()::text),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'order' CHECK (type IN ('order', 'complaint', 'system', 'inventory', 'staff')),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'danger', 'success')),
  unread BOOLEAN NOT NULL DEFAULT TRUE,
  action_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 12. INVENTORY & NORMALIZED SUPPLIERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.suppliers (
  id TEXT PRIMARY KEY, -- e.g. 'SUP-DIV01', 'SUP-UNI02'
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  lead_time_days INTEGER NOT NULL DEFAULT 2,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory (
  id TEXT PRIMARY KEY, -- e.g. 'INV-101'
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category inventory_category NOT NULL,
  current_stock NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_stock_level NUMERIC(10,2) NOT NULL DEFAULT 10,
  max_stock_level NUMERIC(10,2) NOT NULL DEFAULT 500,
  unit TEXT NOT NULL DEFAULT 'Liters',
  unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  location TEXT NOT NULL,
  supplier_id TEXT REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id TEXT NOT NULL REFERENCES public.inventory(id) ON DELETE RESTRICT,
  type stock_transaction_type NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  previous_stock NUMERIC(10,2) NOT NULL,
  new_stock NUMERIC(10,2) NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 13. CONVENIENCE VIEW: HOSTELS WITH JOINED WARDEN PROFILES
-- ==============================================================================
CREATE OR REPLACE VIEW public.hostels_view AS
SELECT 
  h.id,
  h.name,
  h.gender,
  h.blocks,
  h.hub_zone,
  h.total_rooms,
  h.capacity,
  h.warden_id,
  p.full_name AS warden_name,
  p.phone AS warden_phone,
  p.email AS warden_email,
  h.created_at,
  h.updated_at
FROM public.hostels h
LEFT JOIN public.profiles p ON h.warden_id = p.id;

-- ==============================================================================
-- 14. SECURITY DEFINER CONTEXT HELPERS & TRIGGERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.auth_user_hostel_id()
RETURNS TEXT AS $$
  SELECT assigned_hostel_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Trigger to prevent privilege escalation on profiles
CREATE OR REPLACE FUNCTION public.check_profile_privilege_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF (public.auth_user_role() IS DISTINCT FROM 'admin') THEN
    IF (NEW.role IS DISTINCT FROM OLD.role) THEN
      RAISE EXCEPTION 'Access Denied: Only administrators can modify user roles.';
    END IF;
    IF (NEW.is_active IS DISTINCT FROM OLD.is_active) THEN
      RAISE EXCEPTION 'Access Denied: Only administrators can alter account active status.';
    END IF;
    IF (NEW.assigned_hostel_id IS DISTINCT FROM OLD.assigned_hostel_id) THEN
      RAISE EXCEPTION 'Access Denied: Only administrators can reassign hostel building allocations.';
    END IF;
    IF (NEW.email IS DISTINCT FROM OLD.email) THEN
      RAISE EXCEPTION 'Access Denied: Email updates must be initiated via Supabase Auth workflows.';
    END IF;
  END IF;

  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_privileges ON public.profiles;
CREATE TRIGGER trg_protect_profile_privileges
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.check_profile_privilege_escalation();

-- Revoke direct update on sensitive profile columns
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, phone, avatar_url) ON public.profiles TO authenticated;

-- ==============================================================================
-- 15. TRANSACTIONAL RPCS (Secure Server-Side Operations)
-- ==============================================================================

-- A. Secure Order Creation RPC
CREATE OR REPLACE FUNCTION public.create_student_laundry_order(
  p_service_id TEXT,
  p_items_count INTEGER,
  p_approx_weight_kg NUMERIC,
  p_pickup_date DATE,
  p_pickup_slot TEXT,
  p_special_instructions TEXT DEFAULT NULL,
  p_items JSONB DEFAULT '[]'::jsonb,
  p_pay_via_wallet BOOLEAN DEFAULT TRUE
)
RETURNS JSONB AS $$
DECLARE
  v_student_id UUID;
  v_student RECORD;
  v_service RECORD;
  v_order_id TEXT;
  v_total_amount NUMERIC(10,2);
  v_payment_status payment_status;
  v_item JSONB;
BEGIN
  v_student_id := auth.uid();
  IF (v_student_id IS NULL) THEN
    RAISE EXCEPTION 'Unauthorized: User session not found.';
  END IF;

  SELECT s.reg_no, s.hostel_id, s.hostel_block, s.room_number, s.wallet_balance, s.status, p.full_name
  INTO v_student
  FROM public.students s
  JOIN public.profiles p ON s.id = p.id
  WHERE s.id = v_student_id;

  IF (v_student IS NULL) THEN
    RAISE EXCEPTION 'Student record not found for authenticated user.';
  END IF;

  IF (v_student.status != 'Active') THEN
    RAISE EXCEPTION 'Your student laundry account is inactive. Please contact your hostel warden.';
  END IF;

  SELECT id, name, price_per_kg, is_active
  INTO v_service
  FROM public.services
  WHERE id = p_service_id;

  IF (v_service IS NULL OR NOT v_service.is_active) THEN
    RAISE EXCEPTION 'Invalid or inactive laundry service selected.';
  END IF;

  IF (p_approx_weight_kg <= 0 OR p_items_count <= 0) THEN
    RAISE EXCEPTION 'Invalid weight or items count specified.';
  END IF;

  v_total_amount := ROUND((p_approx_weight_kg * v_service.price_per_kg)::numeric, 2);

  IF (p_pay_via_wallet) THEN
    IF (v_student.wallet_balance < v_total_amount) THEN
      RAISE EXCEPTION 'Insufficient hostel wallet balance (Available: ₹%, Required: ₹%).', v_student.wallet_balance, v_total_amount;
    END IF;

    UPDATE public.students
    SET wallet_balance = wallet_balance - v_total_amount,
        quota_used_items = quota_used_items + p_items_count,
        updated_at = NOW()
    WHERE id = v_student_id;

    v_payment_status := 'Paid';
  ELSE
    v_payment_status := 'Pending';
  END IF;

  v_order_id := 'LMS' || nextval('order_id_seq')::text;

  INSERT INTO public.orders (
    id,
    student_id,
    service_id,
    service_name_snapshot,
    price_per_kg_snapshot,
    status,
    payment_status,
    items_count,
    approx_weight_kg,
    total_amount,
    hostel_id,
    hostel_block,
    room_number,
    pickup_date,
    pickup_slot,
    special_instructions,
    assigned_staff_id,
    created_at
  ) VALUES (
    v_order_id,
    v_student_id,
    v_service.id,
    v_service.name,
    v_service.price_per_kg,
    'Request Placed',
    v_payment_status,
    p_items_count,
    p_approx_weight_kg,
    v_total_amount,
    v_student.hostel_id,
    v_student.hostel_block,
    v_student.room_number,
    p_pickup_date,
    p_pickup_slot,
    p_special_instructions,
    NULL,
    NOW()
  );

  IF (jsonb_array_length(p_items) > 0) THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
      INSERT INTO public.order_items (
        order_id,
        category,
        item_name,
        quantity,
        special_care_notes
      ) VALUES (
        v_order_id,
        COALESCE(v_item->>'category', 'General Clothes'),
        COALESCE(v_item->>'itemName', v_item->>'item_name', 'Garment'),
        GREATEST(COALESCE((v_item->>'quantity')::integer, 1), 1),
        v_item->>'special_care_notes'
      );
    END LOOP;
  END IF;

  INSERT INTO public.order_status_history (
    order_id,
    status,
    actor_id,
    actor_name,
    notes,
    created_at
  ) VALUES (
    v_order_id,
    'Request Placed',
    v_student_id,
    v_student.full_name,
    'Laundry order lodged via Student Portal. Doorstep collection scheduled.',
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'total_amount', v_total_amount,
    'payment_status', v_payment_status,
    'message', 'Laundry order confirmed successfully.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B. Secure Complaint Lodging RPC
CREATE OR REPLACE FUNCTION public.submit_student_complaint(
  p_order_id TEXT,
  p_type TEXT,
  p_priority TEXT,
  p_description TEXT,
  p_evidence_url TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_student_id UUID;
  v_order RECORD;
  v_complaint_id TEXT;
  v_student_name TEXT;
BEGIN
  v_student_id := auth.uid();
  IF (v_student_id IS NULL) THEN
    RAISE EXCEPTION 'Unauthorized session.';
  END IF;

  SELECT id, student_id, hostel_id, status
  INTO v_order
  FROM public.orders
  WHERE id = p_order_id AND student_id = v_student_id;

  IF (v_order IS NULL) THEN
    RAISE EXCEPTION 'Invalid Order ID: You can only lodge complaints against your own orders.';
  END IF;

  SELECT full_name INTO v_student_name FROM public.profiles WHERE id = v_student_id;

  v_complaint_id := 'CMP-' || nextval('complaint_id_seq')::text;

  INSERT INTO public.complaints (
    id,
    order_id,
    student_id,
    hostel_id,
    type,
    priority,
    description,
    evidence_url,
    status,
    staff_response,
    created_at
  ) VALUES (
    v_complaint_id,
    v_order.id,
    v_student_id,
    v_order.hostel_id,
    p_type,
    COALESCE(p_priority, 'Medium'),
    p_description,
    p_evidence_url,
    'Submitted',
    'Grievance registered. Awaiting operational intake inspection.',
    NOW()
  );

  INSERT INTO public.complaint_updates (
    complaint_id,
    stage,
    actor_id,
    actor_name,
    note
  ) VALUES (
    v_complaint_id,
    'Submitted',
    v_student_id,
    v_student_name,
    'Complaint submitted by student resident.'
  );

  RETURN jsonb_build_object(
    'success', true,
    'complaint_id', v_complaint_id,
    'message', 'Grievance ticket lodged successfully.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 16. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 17. RLS POLICIES
-- ==============================================================================

-- Profiles
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.auth_user_role() IN ('admin', 'staff', 'warden'));

CREATE POLICY "Users can update own non-privileged profile data"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.auth_user_role() = 'admin')
  WITH CHECK (id = auth.uid() OR public.auth_user_role() = 'admin');

-- Hostels
CREATE POLICY "Anyone authenticated can view hostels"
  ON public.hostels FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage hostels"
  ON public.hostels FOR ALL TO authenticated
  USING (public.auth_user_role() = 'admin')
  WITH CHECK (public.auth_user_role() = 'admin');

-- Students
CREATE POLICY "Students read own record; Staff/Admin/Warden read"
  ON public.students FOR SELECT TO authenticated
  USING (
    id = auth.uid() 
    OR public.auth_user_role() IN ('admin', 'staff')
    OR (public.auth_user_role() = 'warden' AND hostel_id = public.auth_user_hostel_id())
  );

CREATE POLICY "Admins manage students"
  ON public.students FOR ALL TO authenticated
  USING (public.auth_user_role() = 'admin')
  WITH CHECK (public.auth_user_role() = 'admin');

-- Staff
CREATE POLICY "Staff read roster"
  ON public.staff FOR SELECT TO authenticated
  USING (public.auth_user_role() IN ('admin', 'staff', 'warden'));

CREATE POLICY "Admins manage staff"
  ON public.staff FOR ALL TO authenticated
  USING (public.auth_user_role() = 'admin')
  WITH CHECK (public.auth_user_role() = 'admin');

-- Services
CREATE POLICY "Public & authenticated can view active services"
  ON public.services FOR SELECT USING (is_active = true OR public.auth_user_role() = 'admin');

CREATE POLICY "Admins can manage services"
  ON public.services FOR ALL TO authenticated
  USING (public.auth_user_role() = 'admin')
  WITH CHECK (public.auth_user_role() = 'admin');

-- Orders
CREATE POLICY "Students can read own orders"
  ON public.orders FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR public.auth_user_role() IN ('admin', 'staff')
    OR (public.auth_user_role() = 'warden' AND hostel_id = public.auth_user_hostel_id())
  );

CREATE POLICY "Staff and Admins can update orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (public.auth_user_role() IN ('admin', 'staff'))
  WITH CHECK (public.auth_user_role() IN ('admin', 'staff'));

-- Order Items & Status History
CREATE POLICY "Read order items based on order access"
  ON public.order_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (
          o.student_id = auth.uid()
          OR public.auth_user_role() IN ('admin', 'staff')
          OR (public.auth_user_role() = 'warden' AND o.hostel_id = public.auth_user_hostel_id())
        )
    )
  );

CREATE POLICY "Read order status history based on order access"
  ON public.order_status_history FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_status_history.order_id
        AND (
          o.student_id = auth.uid()
          OR public.auth_user_role() IN ('admin', 'staff')
          OR (public.auth_user_role() = 'warden' AND o.hostel_id = public.auth_user_hostel_id())
        )
    )
  );

CREATE POLICY "Staff and Admins can log status history"
  ON public.order_status_history FOR INSERT TO authenticated
  WITH CHECK (public.auth_user_role() IN ('admin', 'staff') OR actor_id = auth.uid());

-- Complaints & Internal Notes
CREATE POLICY "Students read own complaints; Staff/Admin read assigned; Warden reads hostel"
  ON public.complaints FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR public.auth_user_role() IN ('admin', 'staff')
    OR (public.auth_user_role() = 'warden' AND hostel_id = public.auth_user_hostel_id())
  );

CREATE POLICY "Staff and Admins can update complaints"
  ON public.complaints FOR UPDATE TO authenticated
  USING (public.auth_user_role() IN ('admin', 'staff'))
  WITH CHECK (public.auth_user_role() IN ('admin', 'staff'));

CREATE POLICY "Read complaint updates"
  ON public.complaint_updates FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_updates.complaint_id
        AND (
          c.student_id = auth.uid()
          OR public.auth_user_role() IN ('admin', 'staff')
          OR (public.auth_user_role() = 'warden' AND c.hostel_id = public.auth_user_hostel_id())
        )
    )
  );

CREATE POLICY "Staff and Admins can view internal complaint notes"
  ON public.complaint_internal_notes FOR SELECT TO authenticated
  USING (public.auth_user_role() IN ('admin', 'staff', 'warden'));

CREATE POLICY "Staff and Admins can write internal complaint notes"
  ON public.complaint_internal_notes FOR INSERT TO authenticated
  WITH CHECK (public.auth_user_role() IN ('admin', 'staff'));

-- Contact Inquiries
CREATE POLICY "Public and users can submit inquiries"
  ON public.contact_inquiries FOR INSERT
  WITH CHECK (
    status = 'New'
    AND length(full_name) >= 2
    AND length(message) >= 10
  );

CREATE POLICY "Only admins and assigned wardens can read inquiries"
  ON public.contact_inquiries FOR SELECT TO authenticated
  USING (public.auth_user_role() IN ('admin', 'warden'));

CREATE POLICY "Only admins can update inquiries"
  ON public.contact_inquiries FOR UPDATE TO authenticated
  USING (public.auth_user_role() = 'admin')
  WITH CHECK (public.auth_user_role() = 'admin');

-- Notifications
CREATE POLICY "Users can manage own notifications"
  ON public.notifications FOR ALL TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Inventory & Suppliers
CREATE POLICY "Staff, Wardens and Admins can view inventory"
  ON public.inventory FOR SELECT TO authenticated
  USING (public.auth_user_role() IN ('admin', 'staff', 'warden'));

CREATE POLICY "Staff and Admins can update inventory stock"
  ON public.inventory FOR UPDATE TO authenticated
  USING (public.auth_user_role() IN ('admin', 'staff'))
  WITH CHECK (public.auth_user_role() IN ('admin', 'staff'));

CREATE POLICY "Staff, Wardens and Admins can view stock transactions"
  ON public.inventory_transactions FOR SELECT TO authenticated
  USING (public.auth_user_role() IN ('admin', 'staff', 'warden'));

CREATE POLICY "Staff and Admins can record stock transactions"
  ON public.inventory_transactions FOR INSERT TO authenticated
  WITH CHECK (public.auth_user_role() IN ('admin', 'staff'));

CREATE POLICY "Staff and Admins can view suppliers"
  ON public.suppliers FOR SELECT TO authenticated
  USING (public.auth_user_role() IN ('admin', 'staff'));

CREATE POLICY "Admins can manage suppliers"
  ON public.suppliers FOR ALL TO authenticated
  USING (public.auth_user_role() = 'admin')
  WITH CHECK (public.auth_user_role() = 'admin');

-- ==============================================================================
-- 18. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_orders_student_id ON public.orders(student_id);
CREATE INDEX IF NOT EXISTS idx_orders_hostel_id ON public.orders(hostel_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_staff ON public.orders(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at_desc ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_history_order_id ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_complaints_student_id ON public.complaints(student_id);
CREATE INDEX IF NOT EXISTS idx_complaints_hostel_id ON public.complaints(hostel_id);
CREATE INDEX IF NOT EXISTS idx_complaints_order_id ON public.complaints(order_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.contact_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread ON public.notifications(recipient_id, unread);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON public.inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item ON public.inventory_transactions(item_id);

-- ==============================================================================
-- 19. DEFAULT CAMPUS SEEDS (Hostels, Services, Suppliers, Inventory)
-- ==============================================================================

-- Seed Hostels
INSERT INTO public.hostels (id, name, gender, blocks, hub_zone, total_rooms, capacity) VALUES
('BH-1', 'BH-1 (Boys Hostel 1)', 'Boys', ARRAY['Block A', 'Block B', 'Block C'], 'Central Laundry Complex - North Wing', 420, 840),
('BH-2', 'BH-2 (Boys Hostel 2)', 'Boys', ARRAY['Block A', 'Block B', 'Block C'], 'Central Laundry Complex - North Wing', 400, 800),
('BH-3', 'BH-3 (Boys Hostel 3)', 'Boys', ARRAY['Block A', 'Block B-32', 'Block C'], 'Central Laundry Complex - North Wing', 450, 900),
('BH-4', 'BH-4 (Boys Hostel 4)', 'Boys', ARRAY['Block A', 'Block B', 'Block C'], 'Central Laundry Complex - North Wing', 380, 760),
('BH-5', 'BH-5 (Boys Hostel 5)', 'Boys', ARRAY['Block A', 'Block B', 'Block C'], 'Central Laundry Complex - North Wing', 400, 800),
('BH-6', 'BH-6 (Boys Hostel 6)', 'Boys', ARRAY['Block A', 'Block B', 'Block C'], 'Central Laundry Complex - North Wing', 420, 840),
('BH-7', 'BH-7 (Boys Hostel 7)', 'Boys', ARRAY['Block A', 'Block B', 'Block C'], 'Central Laundry Complex - North Wing', 350, 700),
('BH-8', 'BH-8 (Boys Hostel 8)', 'Boys', ARRAY['Block A', 'Block B', 'Block C'], 'Central Laundry Complex - North Wing', 360, 720),
('GH-1', 'GH-1 (Girls Hostel 1)', 'Girls', ARRAY['Block A', 'Block B-31', 'Block C'], 'Central Laundry Complex - South Wing', 400, 800),
('GH-2', 'GH-2 (Girls Hostel 2)', 'Girls', ARRAY['Block A', 'Block B-32', 'Block C'], 'Central Laundry Complex - South Wing', 450, 900),
('GH-3', 'GH-3 (Girls Hostel 3)', 'Girls', ARRAY['Block A', 'Block B', 'Block C'], 'Central Laundry Complex - South Wing', 420, 840),
('GH-4', 'GH-4 (Girls Hostel 4)', 'Girls', ARRAY['Block A', 'Block B', 'Block C'], 'Central Laundry Complex - South Wing', 380, 760),
('GH-5', 'GH-5 (Girls Hostel 5)', 'Girls', ARRAY['Block A', 'Block B', 'Block C'], 'Central Laundry Complex - South Wing', 350, 700),
('GH-6', 'GH-6 (Girls Hostel 6)', 'Girls', ARRAY['Block A', 'Block B', 'Block C'], 'Central Laundry Complex - South Wing', 360, 720)
ON CONFLICT (id) DO NOTHING;

-- Seed Services
INSERT INTO public.services (id, name, price_per_kg, unit, turnaround_sla, description, icon, is_popular, is_active, sort_order) VALUES
('wash-only', 'Wash Only', 30.00, '/kg', '24-48 hrs', 'Standard machine wash with premium detergent & fabric care.', 'Shirt', false, true, 1),
('wash-fold', 'Wash & Fold', 40.00, '/kg', '24-48 hrs', 'Machine wash, tumble dried and crisply folded ready to wear.', 'Layers', true, true, 2),
('wash-iron', 'Wash & Iron', 50.00, '/kg', '48 hrs', 'Washed, dried and steam pressed to perfection.', 'Sparkles', false, true, 3),
('wash-dry-iron', 'Wash, Dry & Iron', 60.00, '/kg', '48-72 hrs', 'Complete royal care with delicate drying and crisp steam ironing.', 'ShieldCheck', false, true, 4),
('iron-only', 'Iron Only', 20.00, '/kg', '24 hrs', 'Heavy steam press for shirts, trousers and traditional attire.', 'Flame', false, true, 5)
ON CONFLICT (id) DO NOTHING;

-- Seed Suppliers
INSERT INTO public.suppliers (id, name, phone, email, lead_time_days, address) VALUES
('SUP-DIV01', 'Diversey Chemical Solutions India', '+91 98140 33441', 'diversey.orders@diversey.in', 2, 'Industrial Area Phase 2, Ludhiana, Punjab'),
('SUP-HIN02', 'Hindustan Commercial Detergents', '+91 98721 55662', 'sales@hindustandetergents.com', 3, 'Focal Point, Jalandhar, Punjab'),
('SUP-UNI03', 'Unilever Professional Supplies', '+91 98223 99881', 'institutional@unilever.com', 2, 'Transport Nagar, Phagwara, Punjab'),
('SUP-SUP04', 'Supreme Packaging & Bags Co.', '+91 98881 22334', 'orders@supremepackaging.in', 3, 'G.T. Road, Amritsar, Punjab')
ON CONFLICT (id) DO NOTHING;

-- Seed Inventory
INSERT INTO public.inventory (id, sku, name, category, current_stock, min_stock_level, max_stock_level, unit, unit_cost, location, supplier_id) VALUES
('INV-101', 'DET-LIQ-IND01', 'Industrial Liquid Detergent (Eco-Clean Pro)', 'Detergent', 145.00, 50.00, 300.00, 'Liters', 85.00, 'Hub Central - Chem Bay A1', 'SUP-DIV01'),
('INV-102', 'PWD-OXY-HP02', 'Heavy-Duty Washing Powder (Oxy-Power Pro)', 'Washing Powder', 28.00, 60.00, 250.00, 'Kg', 110.00, 'Hub Central - Chem Bay A2', 'SUP-HIN02'),
('INV-103', 'FAB-SFT-COM03', 'Comfort Fabric Conditioner & Softener Blue', 'Fabric Conditioner', 60.00, 40.00, 180.00, 'Liters', 135.00, 'Hub North - Dispenser Rack 3', 'SUP-UNI03'),
('INV-104', 'BAG-MSH-BH04', 'Heavy-Duty Mesh Laundry Bags (LPU Branded)', 'Laundry Bags', 340.00, 150.00, 800.00, 'Units', 120.00, 'Central Intake Counter Storage', 'SUP-SUP04'),
('INV-105', 'PKG-GAR-PLY05', 'Garment Poly Wrapping Covers (50 Micron)', 'Packaging Materials', 45.00, 100.00, 500.00, 'Rolls', 220.00, 'Packing & Delivery Bay', 'SUP-SUP04'),
('INV-106', 'PKG-TAG-RFID06', 'Waterproof Barcode Garment Identification Tags', 'Packaging Materials', 1200.00, 500.00, 3000.00, 'Units', 3.50, 'Intake Station 1 & 2 Drawers', 'SUP-SUP04'),
('INV-107', 'OTH-BLR-DSC07', 'Boiler Scale Remover & Acid Treatment Salt', 'Other Supplies', 14.00, 25.00, 80.00, 'Kg', 195.00, 'Machinery Maintenance Closet #1', 'SUP-DIV01'),
('INV-108', 'OTH-STN-SPT08', 'Enzyme Stain Spotting & Collar Treatment Kit', 'Other Supplies', 35.00, 20.00, 100.00, 'Packs', 160.00, 'Spotting Station North', 'SUP-DIV01')
ON CONFLICT (id) DO NOTHING;

