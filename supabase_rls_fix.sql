-- ==========================================================
-- OPTION A: DISABLE ROW-LEVEL SECURITY (Simplest & Matches Original Design)
-- Execute this block in the Supabase SQL Editor to solve the issues immediately.
-- ==========================================================

ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE experience_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE survey_sessions DISABLE ROW LEVEL SECURITY;

-- ==========================================================
-- OPTION B: KEEP RLS ENABLED & ADD SECURE POLICIES
-- Run this block INSTEAD of Option A if you prefer to keep RLS active for security.
-- ==========================================================

/*
-- Enable RLS on all tables
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_stats ENABLE ROW LEVEL SECURITY;

-- Website Settings Policies
CREATE POLICY "Allow public read website_settings" ON website_settings FOR SELECT USING (true);
CREATE POLICY "Allow admin update website_settings" ON website_settings FOR UPDATE TO authenticated USING (true);

-- Service Content Policies
CREATE POLICY "Allow public read service_content" ON service_content FOR SELECT USING (true);
CREATE POLICY "Allow admin write service_content" ON service_content FOR ALL TO authenticated USING (true);

-- Bookings Policies
CREATE POLICY "Allow public insert bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public tracking bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Allow admin manage bookings" ON bookings FOR ALL TO authenticated USING (true);

-- Gallery Images Policies
CREATE POLICY "Allow public read gallery_images" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Allow admin write gallery_images" ON gallery_images FOR ALL TO authenticated USING (true);

-- Testimonials Policies
CREATE POLICY "Allow public read testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Allow admin write testimonials" ON testimonials FOR ALL TO authenticated USING (true);

-- Team Members Policies
CREATE POLICY "Allow public read team_members" ON team_members FOR SELECT USING (true);
CREATE POLICY "Allow admin write team_members" ON team_members FOR ALL TO authenticated USING (true);

-- Experience Items Policies
CREATE POLICY "Allow public read experience_items" ON experience_items FOR SELECT USING (true);
CREATE POLICY "Allow admin write experience_items" ON experience_items FOR ALL TO authenticated USING (true);

-- Enquiries Policies
CREATE POLICY "Allow public insert enquiries" ON enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin read enquiries" ON enquiries FOR SELECT TO authenticated USING (true);

-- Visitor Stats Policies
CREATE POLICY "Allow public insert visitor_stats" ON visitor_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin read visitor_stats" ON visitor_stats FOR SELECT TO authenticated USING (true);
*/
