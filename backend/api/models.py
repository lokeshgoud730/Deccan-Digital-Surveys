from django.db import models

class ServiceContent(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField(help_text="Short summary for service card")
    detail_text = models.TextField(help_text="Detailed description of the service")
    process = models.TextField(help_text="Survey process, semicolon or newline separated")
    benefits = models.TextField(help_text="Benefits of the service, semicolon or newline separated")
    equipment = models.CharField(max_length=300, help_text="Equipment used, comma separated")
    image_url = models.CharField(max_length=500, help_text="Path/URL to service illustration or photo")

    def __str__(self):
        return self.title

class Booking(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    customer_name = models.CharField(max_length=200)
    mobile_number = models.CharField(max_length=20)
    email = models.EmailField()
    survey_type = models.CharField(max_length=150)
    property_location = models.TextField()
    survey_date = models.DateField()
    additional_notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
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
