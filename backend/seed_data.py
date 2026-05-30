import os
import sys
import django

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'survey_backend.settings')
django.setup()

from api.models import ServiceContent, ExperienceItem, AboutContent, GalleryImage

def seed_database():
    print("Seeding database...")
    
    # 1. Clear existing database records
    ServiceContent.objects.all().delete()
    ExperienceItem.objects.all().delete()
    AboutContent.objects.all().delete()
    
    # 2. Seed Services (12 Services)
    services_data = [
        {
            "title": "Land Survey",
            "slug": "land-survey",
            "description": "Boundary definition, ownership mapping, and topographic mapping for rural and urban lands.",
            "detail_text": "Our Land Surveying service provides accurate boundary demarcation using state-of-the-art DGPS and Total Station equipment. We resolve property boundary disputes, establish clear ownership lines, and provide certified maps suitable for legal registration and property records.",
            "process": "Historical document analysis; Site reconnaissance; Boundary measurement with GPS/DGPS; Precision Total Station mapping; Draft preparation; Certified map delivery.",
            "benefits": "Resolves boundary disputes; Assures precise land area calculations; Required for legal sales and mortgages; Prevents future encroachment issues.",
            "equipment": "CHNAV DGPS Receiver, Leica Flexline TS07 Total Station",
            "image_url": "/images/services/land_survey.png"
        },
        {
            "title": "Layout Survey (DTCP, HMDA, YTDA, Farm Lands)",
            "slug": "layout-survey",
            "description": "Precision plotting, demarcations, and layout designs matching DTCP, HMDA, and YTDA guidelines.",
            "detail_text": "We offer complete layout planning and physical demarcation services matching strict urban development authority standards. Whether you are developing commercial plots, residential areas, or farm lands, we ensure every plot is aligned precisely with regulatory codes.",
            "process": "Boundary verification; Plan design matching authority rules; Physical staking of roads and plots; Boundary stone markings; Approval drawing creation.",
            "benefits": "Ensures quick approvals from HMDA, DTCP, or YTDA; Maximum layout efficiency; Clear physical identification of plots for buyers.",
            "equipment": "Trimble R12 DGPS, Leica Total Station",
            "image_url": "/images/services/layout_survey.png"
        },
        {
            "title": "Tippon Survey",
            "slug": "tippon-survey",
            "description": "Verification, measurement, and resolution of agricultural land matching government land records (Tippon).",
            "detail_text": "Tippon surveys involve validating current land physical boundaries against historic land revenue records (Tippon maps). This is critical for resolving legacy ownership disputes in rural farming communities and matching layout coordinates with public registry datasets.",
            "process": "Collection of government Tippon sheets; DGPS positioning of key coordinate points; Comparison of revenue dimensions with actual dimensions; Correction reporting and map updates.",
            "benefits": "Legal protection against title disputes; Accurate correction of land area records; Resolves ancestral boundary confusion.",
            "equipment": "High-precision DGPS, Handheld Laser Distance Meters",
            "image_url": "/images/services/tippon_survey.png"
        },
        {
            "title": "Canal Survey",
            "slug": "canal-survey",
            "description": "Hydrographic tracking, route optimization, and contouring for canal networks and irrigation layouts.",
            "detail_text": "Precision contour mapping and hydrographic data collection for canal alignment, widening, or desiltation works. We map cross-sections and calculate exact volume capacities to support engineering hydraulics and flow management.",
            "process": "Baseline alignment staking; Cross-section leveling at regular intervals; Long-section profile generation; Silt volume calculations.",
            "benefits": "Optimized hydraulic flow; Prevents overflow risks; Accurate estimation of excavation/silt removal volumes.",
            "equipment": "Auto Levels, Leica Total Stations, RTK DGPS",
            "image_url": "/images/services/canal_survey.png"
        },
        {
            "title": "Municipal Survey",
            "slug": "municipal-survey",
            "description": "Boundary verification, property tax mapping, and road alignment layout surveys for municipal authorities.",
            "detail_text": "We assist city governments and local corporations in mapping urban assets, verifying property boundaries for tax assessments, and aligning public utilities like sewerage pipelines and roads.",
            "process": "Urban base map creation; Property boundary digitization; Geographic Information System (GIS) data matching; Road alignment surveying.",
            "benefits": "Increases property tax collections; Avoids public land encroachment; Streamlines municipal utility development.",
            "equipment": "Trimble S5 Robotic Total Station, GIS Data Controllers",
            "image_url": "/images/services/municipal_survey.png"
        },
        {
            "title": "Municipal Plans",
            "slug": "municipal-plans",
            "description": "Creation of master plans, layout drafts, and structural layouts conforming to municipal planning rules.",
            "detail_text": "Providing complete drawing sets, setback verification, and building height documentation matching local municipal corporation bylaws. Essential for obtaining construction permits and commercial occupancy certificates.",
            "process": "Site physical verification; CAD drafting of site plan and floor layouts; Building code compliance review; Digital submission package compilation.",
            "benefits": "Fast-tracked building permission approvals; Avoids code violations and fines; High-precision CAD drafts.",
            "equipment": "CAD Software, Laser Measures, Handheld GPS",
            "image_url": "/images/services/municipal_plans.png"
        },
        {
            "title": "Gram Panchayat Plans",
            "slug": "gram-panchayat-plans",
            "description": "Rural planning layouts, public utility mapping, and layout submissions matching Gram Panchayat codes.",
            "detail_text": "Specialized layouts and zoning maps tailored for rural Gram Panchayats. We help rural landowners divide fields, build houses, or construct commercial complexes while ensuring compliance with rural zoning rules.",
            "process": "Local village map matching; Plot boundary demarcation; Road width verification; Gram Panchayat format drawings.",
            "benefits": "Ensures legal permissions in rural sectors; Affordable plans; Avoids local government disputes.",
            "equipment": "GPS, Precision Survey Tapes, Total Stations",
            "image_url": "/images/services/panchayat_plans.png"
        },
        {
            "title": "Earth Work Quantities",
            "slug": "earth-work-quantities",
            "description": "Cut-and-fill volume estimations, soil grading profile layouts, and material quantity takeoffs.",
            "detail_text": "Precision calculation of soil volume to be excavated (cut) or filled to achieve a desired grade. Essential for infrastructure planning, mining operations, and large venture site developments.",
            "process": "Pre-excavation contour mapping; Post-excavation/grading surveys; 3D surface model comparisons in CAD; Volume calculation report production.",
            "benefits": "Saves excavation costs; Verification of contractor invoices; Precise material billing.",
            "equipment": "Contour DGPS, Drone Lidar, CAD Surface Modeling Software",
            "image_url": "/images/services/earthwork.png"
        },
        {
            "title": "Pipeline Survey",
            "slug": "pipeline-survey",
            "description": "Route selection, profiles, contouring, and alignment staking for water, gas, and sewage pipelines.",
            "detail_text": "Route selection, mapping, and staking for transmission lines and utility conduits. We survey right-of-way boundaries, compile profile elevation drawings, and identify terrain challenges to guarantee safe installation.",
            "process": "Feasibility route study; High-precision corridor topographic survey; Obstacle identification; Centerline staking and easement mapping.",
            "benefits": "Avoids underground hazards; Optimal slope alignments; Clear right-of-way permissions.",
            "equipment": "Pipe Locators, RTK DGPS, Digital Levels",
            "image_url": "/images/services/pipeline_survey.png"
        },
        {
            "title": "Grid and Contour Survey",
            "slug": "grid-and-contour-survey",
            "description": "Topographic map generation, elevation contours, and grid level tracking for design construction.",
            "detail_text": "Detailed level mapping using a grid system to determine elevations, slope characteristics, and water flow patterns on a property. Necessary before any high-rise building or heavy manufacturing plant architecture can be drafted.",
            "process": "Grid layout staking; Elevation readings at grid intersections; Coordinate contour interpolation; 3D elevation map generation.",
            "benefits": "Crucial for drainage planning; Prevents building structural issues; Complete 3D visualization of terrain.",
            "equipment": "Auto Levels, Leica TS07, Trimble DGPS",
            "image_url": "/images/services/contour_survey.png"
        },
        {
            "title": "Road and Rail Survey",
            "slug": "road-and-rail-survey",
            "description": "High-precision geometric alignment, profiles, and structural cross-section mapping for transit links.",
            "detail_text": "Aligning highways, streets, and railways according to engineering designs. We perform alignment staking, curve setting, slope staking, and post-construction quality control to ensure strict adherence to safety specifications.",
            "process": "Establishment of permanent survey benchmarks; Centerline mapping; Cross-section detailing; Structural setting out (bridges, culverts).",
            "benefits": "Ensures transit safety and design compliance; Minimizes construction errors; Optimizes logistics alignment.",
            "equipment": "Robotic Total Stations, DGPS, High Precision Digital Levels",
            "image_url": "/images/services/road_rail_survey.png"
        },
        {
            "title": "Venture Developments",
            "slug": "venture-developments",
            "description": "Comprehensive mapping, plot markings, infrastructure layout, and grading designs for gated communities.",
            "detail_text": "Full-scale layout services for real estate promoters and construction firms. We manage the entire survey cycle from boundary surveying and contour leveling to utility staking, road profiling, and plot numbering.",
            "process": "Boundary verification; Topographic contour mapping; Road network planning; Drainage flow staking; Individual plot markings.",
            "benefits": "Speeds up project marketing; Clear visual layout for potential buyers; Integrated utility planning.",
            "equipment": "DGPS, Drone Mapping, Dual Leica Total Stations",
            "image_url": "/images/services/venture_development.png"
        }
    ]
    
    for item in services_data:
        ServiceContent.objects.create(**item)
    print(f"Seeded {len(services_data)} services.")
    
    # 3. Seed Experience Items (Stats and Timelines)
    experience_data = [
        {
            "type": "STAT",
            "title": "Completed Projects",
            "value": "1,200+",
            "description": "Successfully completed land, layout, and contour surveys across multiple states."
        },
        {
            "type": "STAT",
            "title": "Satisfied Clients",
            "value": "950+",
            "description": "Residential builders, infrastructure developers, farmers, and government agencies."
        },
        {
            "type": "STAT",
            "title": "Districts Covered",
            "value": "25+",
            "description": "Serving clients extensively throughout Telangana, Andhra Pradesh, and adjoining regions."
        },
        {
            "type": "STAT",
            "title": "Years of Excellence",
            "value": "8+",
            "description": "Providing top-grade digital surveying services with digital instruments."
        },
        {
            "type": "TIMELINE",
            "title": "Founding of Deccan Digital Surveys",
            "value": "2018",
            "description": "Started in Hyderabad with basic Total Station equipment focusing on local farm land surveys.",
            "year": 2018
        },
        {
            "type": "TIMELINE",
            "title": "Adoption of DGPS & GPS Surveying",
            "value": "2020",
            "description": "Upgraded tools to high-precision satellite DGPS receivers to offer layout marking with sub-centimeter accuracy.",
            "year": 2020
        },
        {
            "type": "TIMELINE",
            "title": "Branch Expansions to Jangaon & Siddipet",
            "value": "2022",
            "description": "Established regional offices in Siddipet and Jangaon to cater to rapid highway developments and layouts in central Telangana.",
            "year": 2022
        },
        {
            "type": "TIMELINE",
            "title": "Milestone: 1,000+ Completed Projects",
            "value": "2024",
            "description": "Crossed 1,000 projects across rural boundary mapping, road designs, and DTCP approval plans.",
            "year": 2024
        }
    ]
    
    for item in experience_data:
        ExperienceItem.objects.create(**item)
    print(f"Seeded {len(experience_data)} experience items.")
    
    # 4. Seed About us details
    AboutContent.objects.create(
        mission="To deliver exceptionally precise, reliable, and technology-driven surveying solutions that facilitate infrastructure growth, secure land ownership, and optimize urban development across India.",
        vision="To be the premier digital surveying agency in India, recognized for integrity, extreme precision, and seamless delivery of layout approvals and engineering maps.",
        years_experience=8,
        company_history="Deccan Digital Surveys was founded in 2018 with a vision to revolutionize the traditional land measurement practices in India. By introducing advanced electronic distance measurements and satellite-based coordinates (DGPS/GNSS), we helped eliminate boundaries errors and legal disputes. Over the past 8 years, our team has grown from 2 surveyors to a multidisciplinary engineering team with regional offices in Jangaon and Siddipet."
    )
    print("Seeded AboutUs content.")
    
    # 5. Seed initial dummy Gallery Images pointing to assets
    gallery_data = [
        {
            "title": "Layout Demarcation",
            "description": "Staking out road boundaries and plot marking using DGPS in Jangaon project.",
            "image_url": "/images/gallery/layout_demarcation.png",
            "category": "Layout"
        },
        {
            "title": "Highway Contour Survey",
            "description": "Contour mapping for regional highway widening using Total Stations.",
            "image_url": "/images/gallery/highway_contour.png",
            "category": "Road & Rail"
        },
        {
            "title": "DGPS Base Station Setup",
            "description": "Setting up the CHCNAV DGPS base station for sub-centimeter boundary plotting.",
            "image_url": "/images/gallery/dgps_setup.png",
            "category": "Land"
        },
        {
            "title": "Topographic Drone Survey",
            "description": "Aerial mapping of 150-acre venture development project for contour extraction.",
            "image_url": "/images/gallery/drone_mapping.png",
            "category": "Drone Mapping"
        }
    ]
    for item in gallery_data:
        GalleryImage.objects.create(**item)
    print("Seeded Gallery image data.")
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
