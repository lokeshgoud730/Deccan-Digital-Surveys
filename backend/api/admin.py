from django.contrib import admin
from .models import (
    ServiceContent, Booking, GalleryImage, ExperienceItem, 
    Enquiry, VisitorStats, AboutContent, WebsiteSettings, 
    Testimonial, TeamMember, UploadedFile
)

admin.site.register(ServiceContent)
admin.site.register(Booking)
admin.site.register(GalleryImage)
admin.site.register(ExperienceItem)
admin.site.register(Enquiry)
admin.site.register(VisitorStats)
admin.site.register(AboutContent)
admin.site.register(WebsiteSettings)
admin.site.register(Testimonial)
admin.site.register(TeamMember)
admin.site.register(UploadedFile)

