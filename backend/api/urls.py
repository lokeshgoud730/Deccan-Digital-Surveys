from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .views import (
    ServiceContentViewSet, BookingViewSet, GalleryImageViewSet,
    ExperienceItemViewSet, EnquiryViewSet, AboutContentViewSet,
    VisitorStatsViewSet, DashboardOverviewView, log_visitor,
    WebsiteSettingsViewSet, TestimonialViewSet, TeamMemberViewSet,
    UploadedFileViewSet, AIChatView, AIAssistantView,
    PasswordResetRequestView, PasswordResetConfirmView,
    BookingReceiptPDFView, BookingReportPDFView, BookingInvoicePDFView,
    CustomTokenObtainPairView, CustomTokenRefreshView, logout_view,
    SurveySessionViewSet
)

router = DefaultRouter()
router.register(r'services', ServiceContentViewSet, basename='service')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'gallery', GalleryImageViewSet, basename='gallery')
router.register(r'experience', ExperienceItemViewSet, basename='experience')
router.register(r'enquiry', EnquiryViewSet, basename='enquiry')
router.register(r'about', AboutContentViewSet, basename='about')
router.register(r'visitor-stats', VisitorStatsViewSet, basename='visitor-stats')
router.register(r'settings', WebsiteSettingsViewSet, basename='settings')
router.register(r'testimonials', TestimonialViewSet, basename='testimonials')
router.register(r'team', TeamMemberViewSet, basename='team')
router.register(r'uploads', UploadedFileViewSet, basename='uploads')
router.register(r'survey-sessions', SurveySessionViewSet, basename='survey-session')

urlpatterns = [
    path('', include(router.urls)),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('token/logout/', logout_view, name='token_logout'),
    path('dashboard-overview/', DashboardOverviewView.as_view(), name='dashboard_overview'),
    path('log-visitor/', log_visitor, name='log_visitor'),
    
    # AI Assistant & Chatbot
    path('ai-chat/', AIChatView.as_view(), name='ai_chat'),
    path('ai-assistant/', AIAssistantView.as_view(), name='ai_assistant'),
    
    # Password Reset
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # PDF Generators
    path('bookings/<int:pk>/receipt-pdf/', BookingReceiptPDFView.as_view(), name='booking_receipt_pdf'),
    path('bookings/<int:pk>/report-pdf/', BookingReportPDFView.as_view(), name='booking_report_pdf'),
    path('bookings/<int:pk>/invoice-pdf/', BookingInvoicePDFView.as_view(), name='booking_invoice_pdf'),
]

