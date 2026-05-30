from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import ServiceContent, Booking, GalleryImage, ExperienceItem, Enquiry, AboutContent, VisitorStats
from .serializers import (
    ServiceContentSerializer, BookingSerializer, GalleryImageSerializer,
    ExperienceItemSerializer, EnquirySerializer, AboutContentSerializer, VisitorStatsSerializer
)

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admin users to edit objects.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

class ServiceContentViewSet(viewsets.ModelViewSet):
    queryset = ServiceContent.objects.all().order_by('id')
    serializer_class = ServiceContentSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by('-created_at')
    serializer_class = BookingSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

class GalleryImageViewSet(viewsets.ModelViewSet):
    queryset = GalleryImage.objects.all().order_by('-uploaded_at')
    serializer_class = GalleryImageSerializer
    permission_classes = [IsAdminOrReadOnly]

class ExperienceItemViewSet(viewsets.ModelViewSet):
    queryset = ExperienceItem.objects.all().order_by('id')
    serializer_class = ExperienceItemSerializer
    permission_classes = [IsAdminOrReadOnly]

class EnquiryViewSet(viewsets.ModelViewSet):
    queryset = Enquiry.objects.all().order_by('-created_at')
    serializer_class = EnquirySerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

class AboutContentViewSet(viewsets.ModelViewSet):
    queryset = AboutContent.objects.all()
    serializer_class = AboutContentSerializer
    permission_classes = [IsAdminOrReadOnly]

class VisitorStatsViewSet(viewsets.ModelViewSet):
    queryset = VisitorStats.objects.all().order_by('-timestamp')
    serializer_class = VisitorStatsSerializer
    permission_classes = [permissions.IsAdminUser]

class DashboardOverviewView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, *args, **kwargs):
        total_bookings = Booking.objects.count()
        total_visitors = VisitorStats.objects.values('ip_address').distinct().count()
        total_services = ServiceContent.objects.count()
        total_gallery_images = GalleryImage.objects.count()

        return Response({
            'total_bookings': total_bookings,
            'total_visitors': total_visitors,
            'total_services': total_services,
            'total_gallery_images': total_gallery_images
        })

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def log_visitor(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    
    page = request.data.get('page', 'Home')
    
    VisitorStats.objects.create(ip_address=ip, page_visited=page)
    return Response({'status': 'logged'}, status=status.HTTP_201_CREATED)
