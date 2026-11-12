-- ==============================================================================
-- LPU LMS Migration: Contact Inquiries System
-- Adds public.contact_inquiries table with RLS and admin management policies
-- ==============================================================================

DO $$ BEGIN
  CREATE TYPE inquiry_status AS ENUM ('New', 'In Progress', 'Resolved', 'Closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id TEXT PRIMARY KEY DEFAULT ('INQ-' || to_char(now(), 'YYYY') || '-' || lpad((floor(random() * 9000 + 1000)::text), 4, '0')),
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_category ON public.contact_inquiries(category);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.contact_inquiries(created_at DESC);

-- Enable RLS
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can submit contact inquiry with 'New' status and validation
CREATE POLICY "Anyone can submit contact inquiry"
ON public.contact_inquiries FOR INSERT
WITH CHECK (
  status = 'New'
  AND length(full_name) >= 2
  AND length(message) >= 10
);

-- 2. ONLY authenticated users with 'admin' role can view inquiries (Privacy Protection)
CREATE POLICY "Admins can view all contact inquiries"
ON public.contact_inquiries FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 3. ONLY authenticated users with 'admin' role can update inquiries
CREATE POLICY "Admins can update contact inquiries"
ON public.contact_inquiries FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 4. ONLY authenticated users with 'admin' role can delete inquiries
CREATE POLICY "Admins can delete contact inquiries"
ON public.contact_inquiries FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

