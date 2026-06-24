from django.db import models

class WebsiteSettings(models.Model):
    hero_title = models.CharField(max_length=250, default="Deccan Digital Surveys")
    hero_subtitle = models.TextField(default="Professional Land Surveying Services across India")
    hero_primary_btn = models.CharField(max_length=100, default="Book Survey")
    hero_secondary_btn = models.CharField(max_length=100, default="Contact Us")
    hero_image = models.ImageField(upload_to='settings/', blank=True, null=True)
    hero_image_url = models.CharField(max_length=500, blank=True, null=True, default="/images/hero_bg.png")
    about_description = models.TextField(default="Deccan Digital Surveys was founded with a vision to revolutionize the land measurement practices in India...")
    about_mission = models.TextField(default="To deliver exceptionally precise, reliable, and technology-driven surveying solutions...")
    about_vision = models.TextField(default="To be the premier digital surveying agency in India...")
    stat_experience_years = models.IntegerField(default=8)
    stat_projects_completed = models.CharField(max_length=50, default="1,200+")
    stat_clients_served = models.CharField(max_length=50, default="950+")

    def __str__(self):
        return "Website CMS Configuration Settings"

class ServiceContent(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField(help_text="Short summary for service card")
    detail_text = models.TextField(help_text="Detailed description of the service")
    process = models.TextField(help_text="Survey process, semicolon or newline separated")
    benefits = models.TextField(help_text="Benefits of the service, semicolon or newline separated")
    equipment = models.CharField(max_length=300, help_text="Equipment used, comma separated")
    image = models.ImageField(upload_to='services/', blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True, help_text="Fallback URL or absolute asset link")
    technical_specifications = models.TextField(blank=True, null=True, help_text="Full technical specifications")
    equipment_details = models.TextField(blank=True, null=True, help_text="Detailed equipment used info")
    sample_photos_json = models.TextField(blank=True, null=True, help_text="Extra sample photos in JSON array format")

    def __str__(self):
        return self.title

class Booking(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    customer_name = models.CharField(max_length=200)
    mobile_number = models.CharField(max_length=20)
    email = models.EmailField()
    survey_type = models.CharField(max_length=150)
    property_location = models.TextField()
    coordinates = models.CharField(max_length=100, blank=True, null=True, help_text="Format: lat,lng")
    survey_date = models.DateField()
    additional_notes = models.TextField(blank=True, null=True)
    land_document = models.FileField(upload_to='bookings/documents/', blank=True, null=True)
    property_image = models.ImageField(upload_to='bookings/images/', blank=True, null=True)
    location_sketch = models.ImageField(upload_to='bookings/sketches/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    assigned_surveyor = models.ForeignKey('TeamMember', on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer_name} - {self.survey_type} ({self.survey_date})"

class GalleryImage(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='gallery/', blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True, help_text="Fallback URL or absolute asset link")
    category = models.CharField(max_length=100, default='General')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Testimonial(models.Model):
    client_name = models.CharField(max_length=200)
    role = models.CharField(max_length=200, blank=True, null=True, default="Property Owner")
    review_text = models.TextField()
    rating = models.IntegerField(default=5)
    image = models.ImageField(upload_to='testimonials/', blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.client_name}"

class TeamMember(models.Model):
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    image = models.ImageField(upload_to='team/', blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class UploadedFile(models.Model):
    file = models.FileField(upload_to='uploads/')
    file_type = models.CharField(max_length=50, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"File upload: {self.file.name}"

class ExperienceItem(models.Model):
    TYPE_CHOICES = [
        ('STAT', 'Statistic'),
        ('TIMELINE', 'Timeline Event'),
        ('PROJECT', 'Completed Project'),
    ]
    type = models.CharField(max_length=15, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    value = models.CharField(max_length=100, blank=True, null=True, help_text="e.g. '500+' or '2023'")
    description = models.TextField()
    year = models.IntegerField(blank=True, null=True, help_text="Required for Timeline Events")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.type}] {self.title}"

class Enquiry(models.Model):
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.phone}"

class VisitorStats(models.Model):
    ip_address = models.GenericIPAddressField()
    timestamp = models.DateTimeField(auto_now_add=True)
    page_visited = models.CharField(max_length=200, default='Home')

    def __str__(self):
        return f"Visitor from {self.ip_address} on {self.timestamp}"

class AboutContent(models.Model):
    mission = models.TextField()
    vision = models.TextField()
    years_experience = models.IntegerField(default=10)
    company_history = models.TextField()

    def __str__(self):
        return "Company About Us Content"


class SurveySession(models.Model):
    session_id = models.CharField(max_length=100, unique=True)
    ip_address = models.GenericIPAddressField()
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    recommended_service = models.CharField(max_length=200, null=True, blank=True)
    is_converted = models.BooleanField(default=False)

    def __str__(self):
        status = "Completed" if self.completed_at else "Abandoned"
        conv = "Converted" if self.is_converted else "Not Converted"
        return f"Survey Session {self.session_id} ({status} - {conv})"

