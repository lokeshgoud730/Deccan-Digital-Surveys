-- 1. Create Tables

-- Website Settings Table
CREATE TABLE IF NOT EXISTS website_settings (
    id SERIAL PRIMARY KEY,
    hero_title TEXT DEFAULT 'Deccan Digital Surveys',
    hero_subtitle TEXT DEFAULT 'Precision DGPS & Total Station Land Surveying Services Across Telangana & Andhra Pradesh',
    hero_primary_btn TEXT DEFAULT 'Book Survey',
    hero_secondary_btn TEXT DEFAULT 'Contact Us',
    hero_image_url TEXT DEFAULT '/images/hero_bg.png',
    about_description TEXT DEFAULT 'Deccan Digital Surveys was founded in 2018 with a vision to revolutionize land measurement in India.',
    about_mission TEXT DEFAULT 'To deliver exceptionally precise, reliable, and technology-driven surveying solutions.',
    about_vision TEXT DEFAULT 'To be the premier digital surveying agency in India.',
    stat_experience_years INTEGER DEFAULT 8,
    stat_projects_completed TEXT DEFAULT '1,200+',
    stat_clients_served TEXT DEFAULT '950+'
);

-- Service Content Table
CREATE TABLE IF NOT EXISTS service_content (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    detail_text TEXT NOT NULL,
    process TEXT NOT NULL,
    benefits TEXT NOT NULL,
    equipment TEXT NOT NULL,
    image_url TEXT,
    technical_specifications TEXT,
    equipment_details TEXT,
    sample_photos_json TEXT DEFAULT '[]'
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    email TEXT,
    survey_type TEXT DEFAULT 'Land Survey',
    property_location TEXT DEFAULT 'Not Specified',
    coordinates TEXT,
    survey_date DATE,
    additional_notes TEXT,
    status TEXT DEFAULT 'PENDING',
    assigned_surveyor INTEGER,
    acres FLOAT,
    village TEXT,
    district TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Gallery Images Table
CREATE TABLE IF NOT EXISTS gallery_images (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    category TEXT DEFAULT 'General',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    client_name TEXT NOT NULL,
    role TEXT DEFAULT 'Property Owner',
    review_text TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    image_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Experience Items Table
CREATE TABLE IF NOT EXISTS experience_items (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    value TEXT,
    description TEXT NOT NULL,
    year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enquiries Table
CREATE TABLE IF NOT EXISTS enquiries (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Visitor Stats Table
CREATE TABLE IF NOT EXISTS visitor_stats (
    id SERIAL PRIMARY KEY,
    ip_address TEXT NOT NULL,
    page_visited TEXT DEFAULT 'Home',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Survey Sessions Table
CREATE TABLE IF NOT EXISTS survey_sessions (
    id SERIAL PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    ip_address TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    recommended_service TEXT,
    is_converted BOOLEAN DEFAULT FALSE
);

-- 2. Disable Row Level Security (RLS) to ensure public client operations work immediately
ALTER TABLE website_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE experience_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE survey_sessions DISABLE ROW LEVEL SECURITY;

-- 3. Seed Website Settings CMS singleton
INSERT INTO website_settings (id, hero_title, hero_subtitle, hero_primary_btn, hero_secondary_btn, about_description, about_mission, about_vision, stat_experience_years, stat_projects_completed, stat_clients_served)
VALUES (
    1,
    'Deccan Digital Surveys',
    'Precision DGPS & Total Station Land Surveying Services Across Telangana & Andhra Pradesh',
    'Book Survey',
    'Contact Us',
    'Deccan Digital Surveys was founded in 2018 with a vision to revolutionize land measurement in India. By introducing advanced electronic distance measurements and satellite-based coordinates (DGPS/GNSS), we helped eliminate boundaries errors and legal disputes. Over the past 8 years, our team has grown from 2 surveyors to a multidisciplinary engineering team with regional offices in Jangaon and Siddipet.',
    'To deliver exceptionally precise, reliable, and technology-driven surveying solutions that facilitate infrastructure growth, secure land ownership, and optimize urban development across India.',
    'To be the premier digital surveying agency in India, recognized for integrity, extreme precision, and seamless delivery of layout approvals and engineering maps.',
    8,
    '1,200+',
    '950+'
) ON CONFLICT (id) DO NOTHING;

-- 4. Seed Service Content
INSERT INTO service_content (title, slug, description, detail_text, process, benefits, equipment, image_url, technical_specifications, equipment_details, sample_photos_json)
VALUES 
(
    'Land Survey',
    'land-survey',
    'Boundary definition, ownership mapping, and topographic mapping for rural and urban lands.',
    'Our Land Surveying service provides accurate boundary demarcation using state-of-the-art DGPS and Total Station equipment. We resolve property boundary disputes, establish clear ownership lines, and provide certified maps suitable for legal registration and property records.',
    'Historical document analysis; Site reconnaissance; Boundary measurement with GPS/DGPS; Precision Total Station mapping; Draft preparation; Certified map delivery.',
    'Resolves boundary disputes; Assures precise land area calculations; Required for legal sales and mortgages; Prevents future encroachment issues.',
    'CHNAV DGPS Receiver, Leica Flexline TS07 Total Station',
    '/images/services/land_survey.png',
    'Accuracy: Horizontal +/- 8mm + 1ppm, Vertical +/- 15mm + 1ppm; Coordinate System: UTM / WGS84 or local grid system.',
    'CHCNAV i90 IMU-RTK GNSS Receiver, Leica FlexLine TS07 reflectorless total station.',
    '[]'
),
(
    'Layout Survey (DTCP, HMDA, YTDA, Farm Lands)',
    'layout-survey',
    'Precision plotting, demarcations, and layout designs matching DTCP, HMDA, and YTDA guidelines.',
    'We offer complete layout planning and physical demarcation services matching strict urban development authority standards. Whether you are developing commercial plots, residential areas, or farm lands, we ensure every plot is aligned precisely with regulatory codes.',
    'Boundary verification; Plan design matching authority rules; Physical staking of roads and plots; Boundary stone markings; Approval drawing creation.',
    'Ensures quick approvals from HMDA, DTCP, or YTDA; Maximum layout efficiency; Clear physical identification of plots for buyers.',
    'Trimble R12 DGPS, Leica Total Station',
    '/images/services/layout_survey.png',
    'Design Standards: Conforms to HMDA/DTCP layout zoning bylaws. Point Staking Tolerance: +/- 5mm.',
    'Trimble R12 GNSS system with Trimble Access controller.',
    '[]'
),
(
    'Tippon Survey',
    'tippon-survey',
    'Verification, measurement, and resolution of agricultural land matching government land records (Tippon).',
    'Tippon surveys involve validating current land physical boundaries against historic land revenue records (Tippon maps). This is critical for resolving legacy ownership disputes in rural farming communities and matching layout coordinates with public registry datasets.',
    'Collection of government Tippon sheets; DGPS positioning of key coordinate points; Comparison of revenue dimensions with actual dimensions; Correction reporting and map updates.',
    'Legal protection against title disputes; Accurate correction of land area records; Resolves ancestral boundary confusion.',
    'High-precision DGPS, Handheld Laser Distance Meters',
    '/images/services/tippon_survey.png',
    'Record Alignment: Legacy revenue chain conversion mapping to WGS84 coordinate systems.',
    'South Galaxy G1 DGPS, Leica DISTO D2 laser meters.',
    '[]'
),
(
    'Canal Survey',
    'canal-survey',
    'Hydrographic tracking, route optimization, and contouring for canal networks and irrigation layouts.',
    'Precision contour mapping and hydrographic data collection for canal alignment, widening, or desiltation works. We map cross-sections and calculate exact volume capacities to support engineering hydraulics and flow management.',
    'Baseline alignment staking; Cross-section leveling at regular intervals; Long-section profile generation; Silt volume calculations.',
    'Optimized hydraulic flow; Prevents overflow risks; Accurate estimation of excavation/silt removal volumes.',
    'Auto Levels, Leica Total Stations, RTK DGPS',
    '/images/services/canal_survey.png',
    'Vertical Level Accuracy: +/- 1.5mm double-run leveling per km.',
    'Sokkia B40A automatic levels, Leica TS07 Total Station.',
    '[]'
),
(
    'Municipal Survey',
    'municipal-survey',
    'Boundary verification, property tax mapping, and road alignment layout surveys for municipal authorities.',
    'We assist city governments and local corporations in mapping urban assets, verifying property boundaries for tax assessments, and aligning public utilities like sewerage pipelines and roads.',
    'Urban base map creation; Property boundary digitization; Geographic Information System (GIS) data matching; Road alignment surveying.',
    'Increases property tax collections; Avoids public land encroachment; Streamlines municipal utility development.',
    'Trimble S5 Robotic Total Station, GIS Data Controllers',
    '/images/services/municipal_survey.png',
    'Feature Mapping Tolerance: Class 1 Surveying Standard (+/- 10mm).',
    'Trimble S5 Robotic Total Station, Trimble TSC7 controller.',
    '[]'
),
(
    'Municipal Plans',
    'municipal-plans',
    'Creation of master plans, layout drafts, and structural layouts conforming to municipal planning rules.',
    'Providing complete drawing sets, setback verification, and building height documentation matching local municipal corporation bylaws. Essential for obtaining construction permits and commercial occupancy certificates.',
    'Site physical verification; CAD drafting of site plan and floor layouts; Building code compliance review; Digital submission package compilation.',
    'Fast-tracked building permission approvals; Avoids code violations and fines; High-precision CAD drafts.',
    'CAD Software, Laser Measures, Handheld GPS',
    '/images/services/municipal_plans.png',
    'CAD Output formats: DWG, DXF, PDF conforming to APDPMS/TS-bPASS formats.',
    'AutoCAD Map 3D, high-performance workstation computing.',
    '[]'
),
(
    'Gram Panchayat Plans',
    'gram-panchayat-plans',
    'Rural planning layouts, public utility mapping, and layout submissions matching Gram Panchayat codes.',
    'Specialized layouts and zoning maps tailored for rural Gram Panchayats. We help rural landowners divide fields, build houses, or construct commercial complexes while ensuring compliance with rural zoning rules.',
    'Local village map matching; Plot boundary demarcation; Road width verification; Gram Panchayat format drawings.',
    'Ensures legal permissions in rural sectors; Affordable plans; Avoids local government disputes.',
    'GPS, Precision Survey Tapes, Total Stations',
    '/images/services/panchayat_plans.png',
    'Zoning regulations matching rural village planning formats.',
    'Garmin GPSMAP 64csx, high-precision steel measurement bands.',
    '[]'
),
(
    'Earth Work Quantities',
    'earth-work-quantities',
    'Cut-and-fill volume estimations, soil grading profile layouts, and material quantity takeoffs.',
    'Precision calculation of soil volume to be excavated (cut) or filled to achieve a desired grade. Essential for infrastructure planning, mining operations, and large venture site developments.',
    'Pre-excavation contour mapping; Post-excavation/grading surveys; 3D surface model comparisons in CAD; Volume calculation report production.',
    'Saves excavation costs; Verification of contractor invoices; Precise material billing.',
    'Contour DGPS, Drone Lidar, CAD Surface Modeling Software',
    '/images/services/earthwork.png',
    'Volume estimation error margin: < 2.5% calculated via tin volume surfaces.',
    'DJI Matrice 300 RTK with L1 Lidar sensor, Civil 3D software.',
    '[]'
),
(
    'Pipeline Survey',
    'pipeline-survey',
    'Route selection, profiles, contouring, and alignment staking for water, gas, and sewage pipelines.',
    'Route selection, mapping, and staking for transmission lines and utility conduits. We survey right-of-way boundaries, compile profile elevation drawings, and identify terrain challenges to guarantee safe installation.',
    'Feasibility route study; High-precision corridor topographic survey; Obstacle identification; Centerline staking and easement mapping.',
    'Avoids underground hazards; Optimal slope alignments; Clear right-of-way permissions.',
    'Pipe Locators, RTK DGPS, Digital Levels',
    '/images/services/pipeline_survey.png',
    'Utility Depth Verification: Up to 3 meters with Ground Penetrating Radar integration.',
    'RD8100 precision utility locator, Leica NA724 levels.',
    '[]'
),
(
    'Grid and Contour Survey',
    'grid-and-contour-survey',
    'Topographic map generation, elevation contours, and grid level tracking for design construction.',
    'Detailed level mapping using a grid system to determine elevations, slope characteristics, and water flow patterns on a property. Necessary before any high-rise building or heavy manufacturing plant architecture can be drafted.',
    'Grid layout staking; Elevation readings at grid intersections; Coordinate contour interpolation; 3D elevation map generation.',
    'Crucial for drainage planning; Prevents building structural issues; Complete 3D visualization of terrain.',
    'Auto Levels, Leica TS07, Trimble DGPS',
    '/images/services/contour_survey.png',
    'Grid Intervals: 5m, 10m, or 20m configurations. Contour intervals: 0.5m, 1m elevation curves.',
    'CHCNAV i90 DGPS, Sokkia levels, Civil 3D rendering engine.',
    '[]'
),
(
    'Road and Rail Survey',
    'road-and-rail-survey',
    'High-precision geometric alignment, profiles, and structural cross-section mapping for transit links.',
    'Aligning highways, streets, and railways according to engineering designs. We perform alignment staking, curve setting, slope staking, and post-construction quality control to ensure strict adherence to safety specifications.',
    'Establishment of permanent survey benchmarks; Centerline mapping; Cross-section detailing; Structural setting out (bridges, culverts).',
    'Ensures transit safety and design compliance; Minimizes construction errors; Optimizes logistics alignment.',
    'Robotic Total Stations, DGPS, High Precision Digital Levels',
    '/images/services/road_rail_survey.png',
    'Profile accuracy: +/- 2mm vertical control accuracy.',
    'Leica TS16 Robotic Total Station, Trimble DGPS.',
    '[]'
),
(
    'Venture Developments',
    'venture-developments',
    'Comprehensive mapping, plot markings, infrastructure layout, and grading designs for gated communities.',
    'Full-scale layout services for real estate promoters and construction firms. We manage the entire survey cycle from boundary surveying and contour leveling to utility staking, road profiling, and plot numbering.',
    'Boundary verification; Topographic contour mapping; Road network planning; Drainage flow staking; Individual plot markings.',
    'Speeds up project marketing; Clear visual layout for potential buyers; Integrated utility planning.',
    'DGPS, Drone Mapping, Dual Leica Total Stations',
    '/images/services/venture_development.png',
    'Integrated community layout matching state regulatory design standards.',
    'DJI Phantom 4 RTK, Leica Flexline TS07 Total Station, Trimble DGPS receivers.',
    '[]'
)
ON CONFLICT (slug) DO NOTHING;

-- 5. Seed Experience Items
INSERT INTO experience_items (type, title, value, description, year)
VALUES 
('STAT', 'Completed Projects', '1,200+', 'Successfully completed land, layout, and contour surveys across multiple states.', NULL),
('STAT', 'Satisfied Clients', '950+', 'Residential builders, infrastructure developers, farmers, and government agencies.', NULL),
('STAT', 'Districts Covered', '25+', 'Serving clients extensively throughout Telangana, Andhra Pradesh, and adjoining regions.', NULL),
('STAT', 'Years of Excellence', '8+', 'Providing top-grade digital surveying services with digital instruments.', NULL),
('TIMELINE', 'Founding of Deccan Digital Surveys', '2018', 'Started in Hyderabad with basic Total Station equipment focusing on local farm land surveys.', 2018),
('TIMELINE', 'Adoption of DGPS & GPS Surveying', '2020', 'Upgraded tools to high-precision satellite DGPS receivers to offer layout marking with sub-centimeter accuracy.', 2020),
('TIMELINE', 'Branch Expansions to Jangaon & Siddipet', '2022', 'Established regional offices in Siddipet and Jangaon to cater to rapid highway developments and layouts in central Telangana.', 2022),
('TIMELINE', 'Milestone: 1,000+ Completed Projects', '2024', 'Crossed 1,000 projects across rural boundary mapping, road designs, and DTCP approval plans.', 2024);

-- 6. Seed Gallery Images
INSERT INTO gallery_images (title, description, image_url, category)
VALUES 
('Layout Demarcation', 'Staking out road boundaries and plot marking using DGPS in Jangaon project.', '/images/gallery/layout_demarcation.png', 'Layout'),
('Highway Contour Survey', 'Contour mapping for regional highway widening using Total Stations.', '/images/gallery/highway_contour.png', 'Road & Rail'),
('DGPS Base Station Setup', 'Setting up the CHCNAV DGPS base station for sub-centimeter boundary plotting.', '/images/gallery/dgps_setup.png', 'Land'),
('Topographic Drone Survey', 'Aerial mapping of 150-acre venture development project for contour extraction.', '/images/gallery/drone_mapping.png', 'Drone Mapping');

-- 7. Seed Testimonials
INSERT INTO testimonials (client_name, role, review_text, rating, image_url)
VALUES 
('Lokesh Goud', 'Property Developer', 'Deccan Digital Surveys did an amazing job mapping our 50-acre venture. The DGPS coordinate accuracy saved us boundary disputes and got our layouts cleared quickly by HMDA.', 5, '/images/testimonials/avatar1.png'),
('Srinivas Reddy', 'Agriculturalist', 'Resolved a 10-year agricultural boundary dispute in Siddipet in just one afternoon. They compared revenue Tippon sheets with high-precision RTK coordinates. Excellent and polite team.', 5, '/images/testimonials/avatar2.png'),
('Anitha Rao', 'Villa Venture Owner', 'Very professional, fast delivery of CAD drafts and contour elevations. Essential partner for modern architectural layouts and DTCP approval drawings.', 5, '/images/testimonials/avatar3.png');

-- 8. Seed Team Members
INSERT INTO team_members (name, role, image_url, bio)
VALUES 
('K. Raghupathy', 'Founder & Lead Surveyor', '/images/team/raghu.png', 'Over 15 years of land and revenue surveying experience. Specialist in Tippon coordinates mapping and regional zoning compliance.'),
('M. Sandeep', 'DGPS Specialist Engineer', '/images/team/sandeep.png', 'Expert in dual-frequency satellite GNSS/RTK systems and 3D terrain surface contour profiling.');
