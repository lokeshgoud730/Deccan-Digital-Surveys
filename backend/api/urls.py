from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    ServiceContentViewSet, BookingViewSet, GalleryImageViewSet,
    ExperienceItemViewSet, EnquiryViewSet, AboutContentViewSet,
    VisitorStatsViewSet, DashboardOverviewView, log_visitor
)

router = DefaultRouter()
router.register(r'services', ServiceContentViewSet, basename='service')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'gallery', GalleryImageViewSet, basename='gallery')
router.register(r'experience', ExperienceItemViewSet, basename='experience')
router.register(r'enquiry', EnquiryViewSet, basename='enquiry')
router.register(r'about', AboutContentViewSet, basename='about')
router.register(r'visitor-stats', VisitorStatsViewSet, basename='visitor-stats')

urlpatterns = [
    path('', include(router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('dashboard-overview/', DashboardOverviewView.as_view(), name='dashboard_overview'),
    path('log-visitor/', log_visitor, name='log_visitor'),
]
