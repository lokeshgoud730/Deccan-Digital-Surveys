from rest_framework import serializers
from .models import (
    ServiceContent, Booking, GalleryImage, ExperienceItem, 
    Enquiry, AboutContent, VisitorStats, WebsiteSettings, 
    Testimonial, TeamMember, UploadedFile, SurveySession
)

class WebsiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebsiteSettings
        fields = '__all__'

class ServiceContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceContent
        fields = '__all__'

    def to_internal_value(self, data):
        # In multipart/form-data, if image is an empty/null string representation,
        # we treat it as None to clear the image field in the database.
        if 'image' in data and data['image'] in ['', 'null', 'None']:
            data = data.copy()
            data['image'] = None
        return super().to_internal_value(data)

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'

    def validate_land_document(self, value):
        if value:
            # 5MB size limit
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("File size must not exceed 5MB.")
            ext = value.name.split('.')[-1].lower()
            allowed_exts = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
            if ext not in allowed_exts:
                raise serializers.ValidationError(f"Unsupported file extension. Allowed: {', '.join(allowed_exts)}")
        return value

    def validate_property_image(self, value):
        if value:
            # 5MB size limit
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("File size must not exceed 5MB.")
            ext = value.name.split('.')[-1].lower()
            allowed_exts = ['jpg', 'jpeg', 'png']
            if ext not in allowed_exts:
                raise serializers.ValidationError(f"Unsupported file extension. Allowed: {', '.join(allowed_exts)}")
        return value

    def validate_location_sketch(self, value):
        if value:
            # 5MB size limit
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("File size must not exceed 5MB.")
            ext = value.name.split('.')[-1].lower()
            allowed_exts = ['pdf', 'jpg', 'jpeg', 'png']
            if ext not in allowed_exts:
                raise serializers.ValidationError(f"Unsupported file extension. Allowed: {', '.join(allowed_exts)}")
        return value

class GalleryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryImage
        fields = '__all__'

class ExperienceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExperienceItem
        fields = '__all__'

class EnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = '__all__'

class AboutContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutContent
        fields = '__all__'

class VisitorStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitorStats
        fields = '__all__'

class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = '__all__'

class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = '__all__'

class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = '__all__'


class SurveySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveySession
        fields = '__all__'
        read_only_fields = ['ip_address']

