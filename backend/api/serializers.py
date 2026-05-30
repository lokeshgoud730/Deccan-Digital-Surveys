from rest_framework import serializers
from .models import ServiceContent, Booking, GalleryImage, ExperienceItem, Enquiry, AboutContent, VisitorStats

class ServiceContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceContent
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'

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
