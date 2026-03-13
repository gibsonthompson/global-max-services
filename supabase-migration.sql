-- ============================================
-- Global Max Services LLC — Form Tables
-- Run in: https://supabase.com/dashboard/project/oschjeuhejqibymdaqxw/sql/new
-- ============================================

-- Shipping Inquiries (quote requests)
CREATE TABLE IF NOT EXISTS gms_shipping_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  origin TEXT,
  destination TEXT,
  cargo_type TEXT,
  weight TEXT,
  details TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'archived')),
  notes TEXT
);

-- Driver Applications
CREATE TABLE IF NOT EXISTS gms_driver_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city_state TEXT NOT NULL,
  cdl_class TEXT NOT NULL,
  experience TEXT NOT NULL,
  endorsements TEXT,
  preferred_freight TEXT,
  violations TEXT,
  notes TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'archived'))
);

-- Enable RLS
ALTER TABLE gms_shipping_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gms_driver_applications ENABLE ROW LEVEL SECURITY;

-- Public can insert (form submissions from website)
CREATE POLICY "Anyone can insert shipping inquiries"
  ON gms_shipping_inquiries FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert driver applications"
  ON gms_driver_applications FOR INSERT WITH CHECK (true);

-- Service role can do everything (admin dashboard via API)
CREATE POLICY "Service role full access shipping"
  ON gms_shipping_inquiries FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access drivers"
  ON gms_driver_applications FOR ALL
  USING (auth.role() = 'service_role');

-- Indexes for common queries
CREATE INDEX idx_gms_shipping_status ON gms_shipping_inquiries(status);
CREATE INDEX idx_gms_shipping_created ON gms_shipping_inquiries(created_at DESC);
CREATE INDEX idx_gms_drivers_status ON gms_driver_applications(status);
CREATE INDEX idx_gms_drivers_created ON gms_driver_applications(created_at DESC);
