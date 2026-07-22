import os
import json
from datetime import datetime
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.http import HttpResponse, Http404
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.views import APIView

# ReportLab Imports for PDF generation
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

# Gemini SDK Import
try:
    import google.generativeai as genai
except ImportError:
    genai = None

from .models import (
    ServiceContent, Booking, GalleryImage, ExperienceItem, 
    Enquiry, AboutContent, VisitorStats, WebsiteSettings, 
    Testimonial, TeamMember, UploadedFile, SurveySession
)
from .serializers import (
    ServiceContentSerializer, BookingSerializer, GalleryImageSerializer,
    ExperienceItemSerializer, EnquirySerializer, AboutContentSerializer, 
    VisitorStatsSerializer, WebsiteSettingsSerializer, TestimonialSerializer, 
    TeamMemberSerializer, UploadedFileSerializer, SurveySessionSerializer
)

# HELPER: Send WhatsApp Notification (via Twilio if configured, else fallback mock)
def send_whatsapp_mock(to_number, message_text):
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
    from_number = os.environ.get('TWILIO_WHATSAPP_FROM', 'whatsapp:+14155238886') # Twilio Sandbox
    
    if account_sid and auth_token:
        try:
            from twilio.rest import Client
            client = Client(account_sid, auth_token)
            
            # Format numbers to match E.164 (e.g. +91...)
            clean_to = to_number.strip()
            if not clean_to.startswith('+'):
                if len(clean_to) == 10:
                    clean_to = f"+91{clean_to}"
                else:
                    clean_to = f"+{clean_to}"
                    
            formatted_to = f"whatsapp:{clean_to}"
            
            message = client.messages.create(
                body=message_text,
                from_=from_number,
                to=formatted_to
            )
            print(f"[Twilio WhatsApp] Dispatched message SID: {message.sid}")
            return
        except Exception as e:
            print(f"[Twilio WhatsApp] Failed to send: {e}. Falling back to print log.")

    print(f"\n================ WHATSAPP NOTIFICATION MOCK ================")
    print(f"To: {to_number}")
    print(f"Message: {message_text}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"============================================================\n")

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admin users to edit objects.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class SurveySessionViewSet(viewsets.ModelViewSet):
    queryset = SurveySession.objects.all()
    serializer_class = SurveySessionSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'session_id'

    def perform_create(self, serializer):
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        serializer.save(ip_address=ip)

class WebsiteSettingsViewSet(viewsets.ModelViewSet):
    queryset = WebsiteSettings.objects.all()
    serializer_class = WebsiteSettingsSerializer
    permission_classes = [IsAdminOrReadOnly]

    def list(self, request, *args, **kwargs):
        # Guarantee at least one settings record exists
        if not WebsiteSettings.objects.exists():
            WebsiteSettings.objects.create()
        settings_obj = WebsiteSettings.objects.first()
        serializer = self.get_serializer(settings_obj)
        return Response([serializer.data])

class ServiceContentViewSet(viewsets.ModelViewSet):
    queryset = ServiceContent.objects.all().order_by('id')
    serializer_class = ServiceContentSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by('-created_at')
    serializer_class = BookingSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'track']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    @action(detail=False, methods=['get'])
    def track(self, request):
        booking_id = request.query_params.get('id')
        phone = request.query_params.get('phone')
        
        if not booking_id or not phone:
            return Response({'error': 'Please provide both Booking ID and Mobile Number.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            booking = Booking.objects.get(pk=booking_id)
            clean_db_phone = ''.join(filter(str.isdigit, booking.mobile_number))[-10:] if booking.mobile_number else ''
            clean_query_phone = ''.join(filter(str.isdigit, phone))[-10:] if phone else 'none'
            
            if clean_db_phone == clean_query_phone:
                serializer = self.get_serializer(booking)
                data = serializer.data
                if booking.status == 'COMPLETED' and booking.assigned_surveyor:
                    data['surveyor_name'] = booking.assigned_surveyor.name
                    data['surveyor_role'] = booking.assigned_surveyor.role
                return Response(data)
            else:
                return Response({'error': 'No active booking record found matching these parameters.'}, status=status.HTTP_404_NOT_FOUND)
        except (Booking.DoesNotExist, ValueError):
            return Response({'error': 'No active booking record found matching these parameters.'}, status=status.HTTP_404_NOT_FOUND)

    def perform_create(self, serializer):
        # Default empty fields before saving
        data = serializer.validated_data
        
        # If property_location is not provided, populate it with village and district
        if not data.get('property_location'):
            village = data.get('village', '')
            district = data.get('district', '')
            parts = []
            if village:
                parts.append(f"Village: {village}")
            if district:
                parts.append(f"District: {district}")
            data['property_location'] = ", ".join(parts) or "Not Specified"
            
        # If survey_type is not provided, default to "Land Survey"
        if not data.get('survey_type'):
            data['survey_type'] = "Land Survey"
            
        # If survey_date is not provided, default to today's date
        if not data.get('survey_date'):
            from django.utils import timezone
            data['survey_date'] = timezone.now().date()

        booking = serializer.save()

        # 1. Customer Email
        if booking.email:
            customer_subject = f"Booking Confirmed - Deccan Digital Surveys"
            customer_message = (
                f"Dear {booking.customer_name},\n\n"
                f"Thank you for booking your survey with Deccan Digital Surveys.\n"
                f"Here are your booking details:\n"
                f"- Survey Type: {booking.survey_type}\n"
                f"- Preferred Date: {booking.survey_date}\n"
                f"- Location: {booking.property_location}\n"
                f"- Booking Status: PENDING\n\n"
                f"Our team will contact you shortly to review your details and confirm the schedule.\n\n"
                f"Best regards,\nDeccan Digital Surveys Team"
            )
            try:
                send_mail(
                    customer_subject,
                    customer_message,
                    settings.DEFAULT_FROM_EMAIL or 'noreply@deccandigitalsurveys.com',
                    [booking.email],
                    fail_silently=True
                )
            except Exception as e:
                print(f"Error sending customer email: {e}")

        # 2. Admin Email
        admin_subject = f"New Survey Booking Alert - {booking.customer_name}"
        admin_message = (
            f"Hello Admin,\n\n"
            f"A new survey booking has been submitted online:\n"
            f"- Customer Name: {booking.customer_name}\n"
            f"- Mobile Number: {booking.mobile_number}\n"
            f"- Email: {booking.email or 'N/A'}\n"
            f"- Acres: {booking.acres or 'N/A'}\n"
            f"- Village: {booking.village or 'N/A'}\n"
            f"- District: {booking.district or 'N/A'}\n"
            f"- Survey Type: {booking.survey_type}\n"
            f"- Date: {booking.survey_date}\n"
            f"- Location: {booking.property_location}\n"
            f"- Notes: {booking.additional_notes or 'None'}\n\n"
            f"Please log in to the admin panel to view details.\n\n"
            f"System Alert Services"
        )
        try:
            send_mail(
                admin_subject,
                admin_message,
                settings.DEFAULT_FROM_EMAIL or 'noreply@deccandigitalsurveys.com',
                [admin[1] for admin in settings.ADMINS] if settings.ADMINS else ['admin@deccandigitalsurveys.com'],
                fail_silently=True
            )
        except Exception as e:
            print(f"Error sending admin email: {e}")

        # 3. WhatsApp Notification (Booking Received)
        whatsapp_msg = (
            f"Hello {booking.customer_name}, your land survey booking for a {booking.survey_type} "
            f"on {booking.survey_date} has been received. Status: PENDING. Deccan Digital Surveys."
        )
        send_whatsapp_mock(booking.mobile_number, whatsapp_msg)

    def perform_update(self, serializer):
        original_status = self.get_object().status
        booking = serializer.save()
        new_status = booking.status

        # If status changed, send WhatsApp notifications
        if original_status != new_status:
            if new_status == 'CONFIRMED':
                send_whatsapp_mock(
                    booking.mobile_number,
                    f"Hi {booking.customer_name}, your booking for {booking.survey_type} on {booking.survey_date} is CONFIRMED. Our surveyors will arrive as scheduled."
                )
            elif new_status == 'COMPLETED':
                send_whatsapp_mock(
                    booking.mobile_number,
                    f"Hi {booking.customer_name}, your {booking.survey_type} survey has been successfully COMPLETED. You can track status, download your receipt/invoice/report, and review your surveyor using Booking ID: {booking.id} at http://localhost:5173/track"
                )

class GalleryImageViewSet(viewsets.ModelViewSet):
    queryset = GalleryImage.objects.all().order_by('-uploaded_at')
    serializer_class = GalleryImageSerializer
    permission_classes = [IsAdminOrReadOnly]

class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all().order_by('-created_at')
    serializer_class = TestimonialSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [IsAdminOrReadOnly()]

class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all().order_by('id')
    serializer_class = TeamMemberSerializer
    permission_classes = [IsAdminOrReadOnly]

class UploadedFileViewSet(viewsets.ModelViewSet):
    queryset = UploadedFile.objects.all().order_by('-uploaded_at')
    serializer_class = UploadedFileSerializer
    permission_classes = [permissions.IsAdminUser]

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
        from django.db.models import Count
        from django.utils import timezone
        
        today = timezone.now().date()
        
        total_bookings = Booking.objects.count()
        today_bookings = Booking.objects.filter(created_at__date=today).count()
        pending_surveys = Booking.objects.filter(status='PENDING').count()
        completed_surveys = Booking.objects.filter(status='COMPLETED').count()
        cancelled_surveys = Booking.objects.filter(status='CANCELLED').count()

        total_visitors = VisitorStats.objects.values('ip_address').distinct().count()
        total_services = ServiceContent.objects.count()
        total_gallery_images = GalleryImage.objects.count()

        # Survey Analytics
        total_sessions = SurveySession.objects.count()
        completed_sessions = SurveySession.objects.filter(completed_at__isnull=False).count()
        converted_sessions = SurveySession.objects.filter(is_converted=True).count()
        
        survey_completion_rate = round((completed_sessions / total_sessions * 100), 1) if total_sessions > 0 else 0.0
        survey_conversion_rate = round((converted_sessions / completed_sessions * 100), 1) if completed_sessions > 0 else 0.0
        today_survey_sessions = SurveySession.objects.filter(started_at__date=today).count()

        # Popular Services Grouping
        popular_services = list(
            Booking.objects.values('survey_type')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )

        return Response({
            'total_bookings': total_bookings,
            'today_bookings': today_bookings,
            'pending_surveys': pending_surveys,
            'completed_surveys': completed_surveys,
            'cancelled_surveys': cancelled_surveys,
            'total_visitors': total_visitors,
            'total_services': total_services,
            'total_gallery_images': total_gallery_images,
            
            # New Analytics Fields
            'total_survey_sessions': total_sessions,
            'completed_survey_sessions': completed_sessions,
            'converted_survey_sessions': converted_sessions,
            'survey_completion_rate': survey_completion_rate,
            'survey_conversion_rate': survey_conversion_rate,
            'today_survey_sessions': today_survey_sessions,
            'popular_services': popular_services
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


# ================= AI ASSISTANT & CHATBOT VIEWS =================

class AIAssistantView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        description = request.data.get('description', '')
        if not description:
            return Response({'error': 'Please enter a description.'}, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve dynamic list of CMS services to train Gemini uploader
        services = list(ServiceContent.objects.all().values('title', 'slug', 'description'))
        
        gemini_api_key = os.environ.get('GEMINI_API_KEY') or getattr(settings, 'GEMINI_API_KEY', None)
        if genai and gemini_api_key:
            try:
                genai.configure(api_key=gemini_api_key)
                # Ask Gemini to recommend a survey matching the user's description
                prompt = (
                    f"User Requirements: \"{description}\"\n\n"
                    f"Available Services: {json.dumps(services)}\n\n"
                    f"You are an AI Land Surveying Assistant. Analyze the user's requirements description and select the single best matching service from the available services list.\n"
                    f"Respond ONLY in a strict JSON format with keys:\n"
                    f"1. 'recommended_survey': The Exact Title of the recommended service.\n"
                    f"2. 'slug': The Slug of the recommended service.\n"
                    f"3. 'description': The Short Description of the recommended service.\n"
                    f"4. 'rationale': A brief explanation of why this service matches. You MUST provide the explanation in English first, followed by a professional Telugu translation at the bottom clearly labeled as 'తెలుగు అనువాదం: ...'."
                )
                
                model = genai.GenerativeModel(model_name="gemini-1.5-flash")
                response = model.generate_content(
                    prompt, 
                    generation_config={"response_mime_type": "application/json"}
                )
                
                parsed_res = json.loads(response.text)
                return Response(parsed_res)
            except Exception as e:
                print(f"Gemini AI Assistant error: {e}. Falling back to keyword-matching engine.")

        # FALLBACK: Keyword mapping with pre-configured English & Telugu rationales
        desc_lower = description.lower()
        keyword_mappings = {
            'land-survey': ['boundary', 'fence', 'ownership', 'encroachment', 'dispute', 'acre', 'rural', 'farm land', 'patta'],
            'layout-survey': ['layout', 'plot', 'hmda', 'dtcp', 'ytda', 'subdivision', 'real estate', 'venture', 'gated'],
            'tippon-survey': ['tippon', 'tipon', 'revenue', 'village map', 'fmb', 'legacy records'],
            'canal-survey': ['canal', 'irrigation', 'water flow', 'hydrological', 'hydrographic', 'reservoir'],
            'municipal-survey': ['municipal', 'municipality', 'municipal survey', 'town survey'],
            'municipal-plans': ['plan', 'master plan', 'municipal plan', 'layout draft']
        }

        fallback_rationales = {
            'land-survey': (
                "Based on your requirements, we recommend a Land Survey. This covers boundary definition, ownership mapping, and topographic mapping.\n\n"
                "తెలుగు అనువాదం: మీ అవసరాల ఆధారంగా, మేము భూమి సర్వేను (Land Survey) సిఫార్సు చేస్తున్నాము. ఇది సరిహద్దు గుర్తింపు, యాజమాన్య మ్యాపింగ్ మరియు టోపోగ్రాఫిక్ మ్యాపింగ్‌లను కవర్ చేస్తుంది."
            ),
            'layout-survey': (
                "Based on your requirements, we recommend a Layout Survey. This covers precision plotting, demarcations, and layout designs matching DTCP, HMDA, and YTDA guidelines.\n\n"
                "తెలుగు అనువాదం: మీ అవసరాల ఆధారంగా, మేము లేఅవుట్ సర్వేను (Layout Survey) సిఫార్సు చేస్తున్నాము. ఇది ఖచ్చితమైన ప్లాటింగ్, సరిహద్దు గుర్తింపు మరియు DTCP, HMDA, YTDA నిబంధనలకు అనుగుణంగా లేఅవుట్ డిజైన్‌లను కవర్ చేస్తుంది."
            ),
            'tippon-survey': (
                "Based on your requirements, we recommend a Tippon Survey. This covers verification, measurement, and resolution of agricultural land matching revenue FMB records.\n\n"
                "తెలుగు అనువాదం: మీ అవసరాల ఆధారంగా, మేము టిప్పన్ సర్వేను (Tippon Survey) సిఫార్సు చేస్తున్నాము. ఇది రెవెన్యూ FMB రికార్డులకు సరిపోయే వ్యవసాయ భూమి యొక్క ధృవీకరణ, కొలత మరియు సరిహద్దు పరిష్కారాలను కవర్ చేస్తుంది."
            ),
            'canal-survey': (
                "Based on your requirements, we recommend a Canal Survey. This covers hydrographic tracking, route optimization, and contouring for canal networks.\n\n"
                "తెలుగు అనువాదం: మీ అవసరాల ఆధారంగా, మేము కాలువ సర్వేను (Canal Survey) సిఫార్సు చేస్తున్నాము. ఇది కాలువ నెట్‌వర్క్‌ల కోసం హైడ్రోగ్రాఫిక్ ట్రాకింగ్, రూట్ ఆప్టిమైజేషన్ మరియు కాంటౌరింగ్‌ను కవర్ చేస్తుంది."
            ),
            'municipal-survey': (
                "Based on your requirements, we recommend a Municipal Survey. This covers boundary verification, property tax mapping, and road alignment layout surveys.\n\n"
                "తెలుగు అనువాదం: మీ అవసరాల ఆధారంగా, మేము మున్సిపల్ సర్వేను (Municipal Survey) సిఫార్సు చేస్తున్నాము. ఇది సరిహద్దుల ధృవీకరణ, ఆస్తి పన్ను మ్యాపింగ్ మరియు రోడ్డు అమరిక లేఅవుట్ సర్వేలను కవర్ చేస్తుంది."
            ),
            'municipal-plans': (
                "Based on your requirements, we recommend Municipal Plans. This covers master plans, layout drafts, and structural layouts conforming to municipal planning rules.\n\n"
                "తెలుగు అనువాదం: మీ అవసరాల ఆధారంగా, మేము మున్సిపల్ ప్లాన్లను (Municipal Plans) సిఫార్సు చేస్తున్నాము. ఇది మున్సిపల్ ప్లానింగ్ నిబంధనల ప్రకారం మాస్టర్ ప్లాన్లు, లేఅవుట్ డ్రాఫ్ట్లు మరియు నిర్మాణ లేఅవుట్‌లను కవర్ చేస్తుంది."
            ),
        }

        recommended_slug = 'land-survey'
        max_matches = 0

        for slug, keywords in keyword_mappings.items():
            matches = sum(1 for kw in keywords if kw in desc_lower)
            if matches > max_matches:
                max_matches = matches
                recommended_slug = slug

        try:
            service = ServiceContent.objects.get(slug=recommended_slug)
            return Response({
                'recommended_survey': service.title,
                'slug': service.slug,
                'description': service.description,
                'rationale': fallback_rationales.get(recommended_slug, f"Based on your requirements, we recommend a {service.title}.")
            })
        except ServiceContent.DoesNotExist:
            return Response({
                'recommended_survey': "Land Surveying",
                'slug': "land-survey",
                'description': "Demarcation of physical property boundaries.",
                'rationale': fallback_rationales.get('land-survey')
            })


class AIChatView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        message = request.data.get('message', '')
        history = request.data.get('history', [])

        if not message:
            return Response({'error': 'Message is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Gather dynamic CMS context for chatbot training
        services_list = list(ServiceContent.objects.all().values('title', 'description', 'detail_text'))
        settings_obj = WebsiteSettings.objects.first() or WebsiteSettings()
        
        system_context = (
            f"You are an AI assistant for Deccan Digital Surveys, a premium engineering surveying firm in India.\n"
            f"Company Bio: {settings_obj.about_description}\n"
            f"Mission: {settings_obj.about_mission}\n"
            f"Vision: {settings_obj.about_vision}\n"
            f"Contact info: Phone: 90000 00000, Email: contact@deccandigitalsurveys.com\n"
            f"Available Services and descriptions: {json.dumps(services_list)}\n\n"
            f"Please answer the user's questions professionally. If the user asks in Telugu or requests a Telugu translation, "
            f"you MUST provide the response in Telugu. Keep answers concise, helpful, and directly quote pricing guidelines "
            f"(surveys generally start at Rs. 5,000 depending on acreage and equipment needed like DGPS or Total Station) and booking details."
        )

        gemini_api_key = os.environ.get('GEMINI_API_KEY') or getattr(settings, 'GEMINI_API_KEY', None)

        if genai and gemini_api_key:
            try:
                genai.configure(api_key=gemini_api_key)
                model = genai.GenerativeModel(
                    model_name="gemini-1.5-flash",
                    system_instruction=system_context
                )
                
                # Format history for Gemini chat API
                chat = model.start_chat()
                response = chat.send_message(message)
                return Response({'response': response.text})
            except Exception as e:
                print(f"Gemini API Error: {e}, falling back to mock chatbot engine.")

        # Fallback keyword-matching chatbot logic
        msg_lower = message.lower()
        
        import re
        is_telugu = bool(re.search(r'[\u0c00-\u0c7f]', message)) or "telugu" in msg_lower
        
        if is_telugu:
            reply = "నమస్కారం! నేను డెక్కన్ డిజిటల్ సర్వీసెస్ AI సహాయకుడిని. మీకు ఎలా సహాయపడగలను?"
            
            if any(k in msg_lower for k in ["ధర", "ఖర్చు", "రేటు", "రేట్లు", "ధరలు", "ఖర్చులు", "price", "cost", "charges", "rate"]):
                reply = (
                    "మా సర్వేయింగ్ ఛార్జీలు రూ. 5,000 నుండి ప్రారంభమవుతాయి. మొత్తం ఖర్చు భూమి విస్తీర్ణం, "
                    "భూభాగం మరియు హై-ప్రిసిషన్ శాటిలైట్ DGPS లేదా ప్రామాణిక టోటల్ స్టేషన్ పరికరాలు అవసరమా "
                    "అనే అంశాలపై ఆధారపడి ఉంటుంది. ఖచ్చితమైన ధర కోసం దయచేసి మా బుకింగ్ ఫారమ్‌ను పూరించండి!"
                )
            elif any(k in msg_lower for k in ["బుక్", "షెడ్యూల్", "అపాయింట్‌మెంట్", "book", "schedule", "appointment"]):
                reply = (
                    "మీరు నేరుగా ఆన్‌లైన్‌లో సర్వేను బుక్ చేసుకోవచ్చు! మెనూలోని 'Book Survey' పేజీకి వెళ్లి, "
                    "వివరాలను నమోదు చేసి, తేదీని ఎంచుకుని, మ్యాప్‌లో మీ స్థానాన్ని గుర్తించండి. "
                    "అలాగే మీ ల్యాండ్ డాక్యుమెంట్లు (టిప్పన్ లేదా రిజిస్ట్రేషన్ కాపీ) అప్‌లోడ్ చేయండి."
                )
            elif any(k in msg_lower for k in ["సంప్రదించండి", "ఫోన్", "నెంబర్", "కాల్", "ఈమెయిల్", "contact", "phone", "call", "email"]):
                reply = (
                    "మీరు మా ప్రధాన కార్యాలయాన్ని ఫోన్ ద్వారా +91 90000 00000 లేదా ఈమెయిల్ contact@deccandigitalsurveys.com "
                    "ద్వారా సంప్రదించవచ్చు. మాకు జనగామ మరియు సిద్దిపేటలో ప్రాంతీయ కార్యాలయాలు కూడా ఉన్నాయి."
                )
            else:
                matched_service = None
                for service in ServiceContent.objects.all():
                    if service.title.lower() in msg_lower or service.slug.replace('-', ' ') in msg_lower:
                        matched_service = service
                        break
                
                if matched_service:
                    reply = (
                        f"అవును, మేము హై-ప్రిసిషన్ {matched_service.title} సేవలను అందిస్తాము. "
                        f"వివరాలు: {matched_service.description} మేము దీనిని {matched_service.equipment} పరికరాలతో చేస్తాము."
                    )
                else:
                    reply = (
                        "డెక్కన్ డిజిటల్ సర్వీసెస్ ల్యాండ్ బౌండరీ డెమార్కేషన్, లేఅవుట్ అప్రూవల్స్ (HMDA/DTCP), "
                        "కాంటూర్ మ్యాపింగ్, పైప్‌లైన్/కెనాల్ ఇంజనీరింగ్ లేఅవుట్ సేవలను అందిస్తుంది. "
                        "సహాయం కోసం మా సపోర్ట్ డెస్క్ +91 90000 00000 ని సంప్రదించండి."
                    )
        else:
            # Fallback English
            reply = "Thank you for reaching out! I'm the assistant for Deccan Digital Surveys."
            if "price" in msg_lower or "cost" in msg_lower or "charges" in msg_lower or "rate" in msg_lower:
                reply = (
                    "Our surveying charges start from Rs. 5,000. The total cost depends on factors such as "
                    "the total acreage of the property, terrain, and whether high-precision satellite DGPS "
                    "or standard Total Station equipment is required. Please fill out our Booking Form to get an accurate quote!"
                )
            elif "book" in msg_lower or "schedule" in msg_lower or "appointment" in msg_lower:
                reply = (
                    "You can book a survey directly online! Simply go to our 'Book Survey' page in the top menu, "
                    "fill out the customer details, choose your preferred date, select the coordinates on the interactive map, "
                    "and upload documents (like Tippon copies or land registries) for review."
                )
            elif "contact" in msg_lower or "phone" in msg_lower or "call" in msg_lower or "email" in msg_lower:
                reply = (
                    f"You can contact us at our main headquarters via Phone at +91 90000 00000 or by email at "
                    f"contact@deccandigitalsurveys.com. We also have regional offices in Jangaon and Siddipet."
                )
            else:
                # Look up if user asked about a specific service
                matched_service = None
                for service in ServiceContent.objects.all():
                    if service.title.lower() in msg_lower or service.slug.replace('-', ' ') in msg_lower:
                        matched_service = service
                        break
                
                if matched_service:
                    reply = (
                        f"Yes, we provide high-precision {matched_service.title}. "
                        f"Details: {matched_service.detail_text} We execute this using {matched_service.equipment}."
                    )
                else:
                    reply = (
                        f"Deccan Digital Surveys specializes in premium land boundary demarcation, layout approvals (HMDA/DTCP), "
                        f"contour mapping, and pipeline/canal engineering layouts. You can contact our support desk at +91 90000 00000 "
                        f"for direct assistance."
                    )

        return Response({'response': reply})


# ================= PASSWORD RESET CMS FLOW =================

class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '')
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Create absolute URL link using dynamic FRONTEND_URL configuration
            frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173').rstrip('/')
            reset_url = f"{frontend_url}/login?action=reset&uid={uid}&token={token}"

            subject = "Password Reset Request - Deccan Digital Surveys CMS"
            body = (
                f"Hello {user.username},\n\n"
                f"We received a request to reset your password for the Deccan Digital Surveys CMS dashboard.\n"
                f"Click the link below to set a new password:\n"
                f"{reset_url}\n\n"
                f"If you did not make this request, please ignore this email.\n\n"
                f"Deccan Digital Surveys System Portal"
            )

            send_mail(
                subject,
                body,
                settings.DEFAULT_FROM_EMAIL or 'noreply@deccandigitalsurveys.com',
                [email],
                fail_silently=False
            )
            return Response({'message': 'Password reset link sent to your registered email.'})
        except User.DoesNotExist:
            # Do not leak user existence, return 200 message
            return Response({'message': 'Password reset link sent to your registered email.'})

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uidb64 = request.data.get('uid', '')
        token = request.data.get('token', '')
        new_password = request.data.get('new_password', '')

        if not uidb64 or not token or not new_password:
            return Response({'error': 'UID, token, and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            
            if default_token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save()
                return Response({'message': 'Password reset completed. You can now log in.'})
            else:
                return Response({'error': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': 'Invalid request parameters.'}, status=status.HTTP_400_BAD_REQUEST)


# ================= PDF GENERATION VIEWS =================

class BasePDFView(APIView):
    permission_classes = [permissions.AllowAny]

    def get_booking(self, pk):
        try:
            booking = Booking.objects.get(pk=pk)
            # If user is staff, allow access immediately
            if self.request.user and self.request.user.is_staff:
                return booking
            
            # Otherwise, verify request using phone or email query params for client access
            phone = self.request.query_params.get('phone')
            email = self.request.query_params.get('email')
            
            clean_db_phone = ''.join(filter(str.isdigit, booking.mobile_number))[-10:] if booking.mobile_number else ''
            clean_query_phone = ''.join(filter(str.isdigit, phone))[-10:] if phone else 'none'
            
            if (phone and clean_db_phone == clean_query_phone) or (email and booking.email.lower() == email.lower()):
                return booking
                
            raise Http404("Unauthorized access to booking documents.")
        except Booking.DoesNotExist:
            raise Http404("Booking not found")

class BookingReceiptPDFView(BasePDFView):
    def get(self, request, pk):
        booking = self.get_booking(pk)
        
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="booking_{booking.id}_receipt.pdf"'
        
        p = canvas.Canvas(response, pagesize=letter)
        width, height = letter
        
        # Draw Header
        p.setFillColor(colors.HexColor('#0f4c81')) # Corporate blue
        p.rect(0, height - 100, width, 100, fill=True, stroke=False)
        
        p.setFillColor(colors.white)
        p.setFont("Helvetica-Bold", 24)
        p.drawString(40, height - 60, "DECCAN DIGITAL SURVEYS")
        p.setFont("Helvetica", 10)
        p.drawString(40, height - 80, "High Precision DGPS & Total Station Land Surveys")
        
        # Title
        p.setFillColor(colors.HexColor('#121212'))
        p.setFont("Helvetica-Bold", 16)
        p.drawString(40, height - 150, "BOOKING ACKNOWLEDGEMENT RECEIPT")
        p.setFont("Helvetica", 10)
        p.drawString(40, height - 170, f"Issued Date: {datetime.now().strftime('%Y-%m-%d')} | Receipt ID: DDS-REC-{booking.id:04d}")
        
        # Details Layout Box
        p.rect(40, height - 380, width - 80, 180, stroke=True, fill=False)
        
        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, height - 220, "Customer Details")
        p.setFont("Helvetica", 10)
        p.drawString(50, height - 240, f"Full Name: {booking.customer_name}")
        p.drawString(50, height - 260, f"Mobile Number: {booking.mobile_number}")
        p.drawString(50, height - 280, f"Email Address: {booking.email}")
        
        p.setFont("Helvetica-Bold", 12)
        p.drawString(320, height - 220, "Survey Specifications")
        p.setFont("Helvetica", 10)
        p.drawString(320, height - 240, f"Survey Category: {booking.survey_type}")
        p.drawString(320, height - 260, f"Proposed Date: {booking.survey_date}")
        p.drawString(320, height - 280, f"Property Coordinates: {booking.coordinates or 'Not Pinmarked'}")
        
        # Location & Notes
        p.setFont("Helvetica-Bold", 10)
        p.drawString(50, height - 320, "Property Physical Location:")
        p.setFont("Helvetica", 10)
        p.drawString(50, height - 335, f"{booking.property_location[:100]}")
        p.drawString(50, height - 350, f"{booking.property_location[100:200]}")
        
        # Bottom text
        p.setFont("Helvetica-Bold", 11)
        p.drawString(40, height - 420, "Terms and Guidelines:")
        p.setFont("Helvetica", 9)
        p.drawString(40, height - 440, "1. Please keep original land title deeds, revenue tippon copies, and survey boundary files handy for verification.")
        p.drawString(40, height - 455, "2. Coordinates saved are indicative. Our surveyors will establish official benchmarks using base DGPS stations.")
        p.drawString(40, height - 470, "3. Final price will be estimated post benchmark verification and acreage cross-check.")
        
        # Footer branding
        p.setStrokeColor(colors.HexColor('#0f4c81'))
        p.line(40, 60, width - 40, 60)
        p.setFont("Helvetica", 8)
        p.setFillColor(colors.gray)
        p.drawString(40, 45, "Deccan Digital Surveys (HQ Hyderabad, Siddipet, Jangaon) | Support: +91 90000 00000")
        
        p.showPage()
        p.save()
        return response

class BookingReportPDFView(BasePDFView):
    def get(self, request, pk):
        booking = self.get_booking(pk)
        
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="survey_report_{booking.id}.pdf"'
        
        p = canvas.Canvas(response, pagesize=letter)
        width, height = letter
        
        # Header banner
        p.setFillColor(colors.HexColor('#1e3a8a')) # Navy
        p.rect(0, height - 100, width, 100, fill=True, stroke=False)
        
        p.setFillColor(colors.white)
        p.setFont("Helvetica-Bold", 20)
        p.drawString(40, height - 60, "OFFICIAL FIELD SURVEY REPORT")
        
        p.setFillColor(colors.HexColor('#121212'))
        p.setFont("Helvetica-Bold", 14)
        p.drawString(40, height - 150, "TECHNICAL SURVEY SPECIFICATIONS REPORT")
        
        # Details Box
        p.rect(40, height - 400, width - 80, 220, stroke=True, fill=False)
        
        p.setFont("Helvetica-Bold", 11)
        p.drawString(50, height - 210, "FIELD GENERAL INFORMATION")
        p.setFont("Helvetica", 10)
        p.drawString(50, height - 230, f"Customer / Requester Name: {booking.customer_name}")
        p.drawString(50, height - 250, f"Mobile: {booking.mobile_number}")
        p.drawString(50, height - 270, f"Email: {booking.email}")
        p.drawString(50, height - 290, f"Survey Date: {booking.survey_date}")
        p.drawString(50, height - 310, f"Project Category: {booking.survey_type}")
        
        p.setFont("Helvetica-Bold", 11)
        p.drawString(320, height - 210, "GPS TECHNICAL LOG")
        p.setFont("Helvetica", 10)
        p.drawString(320, height - 230, f"DGPS Benchmarks Set: 2 Stations")
        p.drawString(320, height - 250, f"GPS Coordinates: {booking.coordinates or 'N/A'}")
        p.drawString(320, height - 270, f"Verification Method: RTK Dual-Frequency")
        p.drawString(320, height - 290, f"Accuracy Achieved: < 5mm horizontal")
        p.drawString(320, height - 310, f"Processing Engine: CORS-India RTK Network")
        
        # Location Details
        p.setFont("Helvetica-Bold", 10)
        p.drawString(50, height - 350, "Physical Site Location Surveyed:")
        p.setFont("Helvetica", 9)
        p.drawString(50, height - 365, f"{booking.property_location}")
        
        # Notes
        p.setFont("Helvetica-Bold", 11)
        p.drawString(40, height - 450, "Field Surveyor Remarks & Observations:")
        p.setFont("Helvetica", 10)
        p.drawString(40, height - 480, f"Status: {booking.status}. All corners marked with boundary concrete stones.")
        p.drawString(40, height - 500, f"Notes: {booking.additional_notes or 'No encroachment observed.'}")
        
        # Signatures
        p.setFont("Helvetica-Bold", 10)
        p.drawString(40, 150, "Prepared By:")
        p.drawString(width - 200, 150, "Authorized Signatory:")
        p.setFont("Helvetica", 9)
        p.drawString(40, 100, "Deccan Digital Surveys Field Surveyor")
        p.drawString(width - 200, 100, "Deccan Digital Surveys Inspector")
        
        # Footer branding
        p.setStrokeColor(colors.HexColor('#1e3a8a'))
        p.line(40, 60, width - 40, 60)
        p.setFont("Helvetica", 8)
        p.setFillColor(colors.gray)
        p.drawString(40, 45, "Deccan Digital Surveys | Certified Boundary Engineers | ISO 9001:2015 Precision Standards")
        
        p.showPage()
        p.save()
        return response

class BookingInvoicePDFView(BasePDFView):
    def get(self, request, pk):
        booking = self.get_booking(pk)
        
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="invoice_{booking.id}.pdf"'
        
        p = canvas.Canvas(response, pagesize=letter)
        width, height = letter
        
        # Logo banner
        p.setFillColor(colors.HexColor('#0f4c81')) # Corporate blue
        p.rect(0, height - 100, width, 100, fill=True, stroke=False)
        p.setFillColor(colors.white)
        p.setFont("Helvetica-Bold", 24)
        p.drawString(40, height - 60, "DECCAN DIGITAL SURVEYS")
        
        p.setFillColor(colors.HexColor('#121212'))
        p.setFont("Helvetica-Bold", 18)
        p.drawString(40, height - 150, "TAX INVOICE / BILL")
        p.setFont("Helvetica", 10)
        p.drawString(40, height - 170, f"Invoice No: DDS-INV-{booking.id:04d} | Date: {datetime.now().strftime('%Y-%m-%d')}")
        
        # Address Details
        p.setFont("Helvetica-Bold", 10)
        p.drawString(40, height - 210, "Billed To:")
        p.setFont("Helvetica", 10)
        p.drawString(40, height - 225, f"{booking.customer_name}")
        p.drawString(40, height - 240, f"Mobile: {booking.mobile_number}")
        p.drawString(40, height - 255, f"Email: {booking.email}")
        
        # Invoice Table Headers
        p.setFillColor(colors.HexColor('#f1f5f9'))
        p.rect(40, height - 320, width - 80, 25, fill=True, stroke=False)
        
        p.setFillColor(colors.HexColor('#121212'))
        p.setFont("Helvetica-Bold", 10)
        p.drawString(50, height - 312, "Description of Survey Services")
        p.drawString(350, height - 312, "Qty (Acres)")
        p.drawString(420, height - 312, "Base Fee (Rs)")
        p.drawString(500, height - 312, "Total (Rs)")
        
        # Invoice line items (calculated mock totals based on survey category)
        survey_rates = {
            'Land Survey': 6000,
            'Tippon Survey': 8000,
            'Layout Survey': 12000,
            'Contour Survey': 10000,
        }
        
        base_rate = survey_rates.get(booking.survey_type, 7500)
        gst = int(base_rate * 0.18)
        grand_total = base_rate + gst
        
        p.setFont("Helvetica", 10)
        p.drawString(50, height - 350, f"Precision {booking.survey_type} Services")
        p.drawString(350, height - 350, "1.00")
        p.drawString(420, height - 350, f"{base_rate:,.2f}")
        p.drawString(500, height - 350, f"{base_rate:,.2f}")
        
        # Lines separator
        p.line(40, height - 370, width - 40, height - 370)
        
        # Summary calculations
        p.drawString(380, height - 400, "Subtotal:")
        p.drawString(500, height - 400, f"{base_rate:,.2f}")
        
        p.drawString(380, height - 420, "GST (18%):")
        p.drawString(500, height - 420, f"{gst:,.2f}")
        
        p.setFont("Helvetica-Bold", 12)
        p.drawString(380, height - 450, "Grand Total:")
        p.drawString(500, height - 450, f"{grand_total:,.2f}")
        
        # Payment details
        p.setFont("Helvetica-Bold", 10)
        p.drawString(40, height - 500, "Payment Instructions & Bank Transfer:")
        p.setFont("Helvetica", 9)
        p.drawString(40, height - 515, "Bank Name: HDFC Bank India")
        p.drawString(40, height - 530, "A/C Name: DECCAN DIGITAL SURVEYS PRIVATE LIMITED")
        p.drawString(40, height - 545, "A/C Number: 50200020491039")
        p.drawString(40, height - 560, "IFSC Code: HDFC0000122")
        
        # Status watermark or box
        p.rect(40, height - 640, 180, 50, stroke=True, fill=False)
        p.setFont("Helvetica-Bold", 14)
        p.setFillColor(colors.HexColor('#0f4c81'))
        p.drawString(60, height - 620, f"STATUS: {booking.status}")
        
        # Footer branding
        p.setStrokeColor(colors.HexColor('#0f4c81'))
        p.line(40, 60, width - 40, 60)
        p.setFont("Helvetica", 8)
        p.setFillColor(colors.gray)
        p.drawString(40, 45, "Invoice generated electronically. Thank you for your business.")
        
        p.showPage()
        p.save()
        return response


# ================= CUSTOM LOGIN VIEW (WITH ADMIN SYNC) =================

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .utils import create_or_update_admin

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token pair view that performs an on-the-fly check and creation/update
    of the administrator account using environment configurations before validating credentials.
    Sets HttpOnly cookies for JWT tokens.
    """
    def post(self, request, *args, **kwargs):
        create_or_update_admin()
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')
            
            # Set Access Token Cookie
            response.set_cookie(
                key=settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token'),
                value=access_token,
                max_age=int(settings.SIMPLE_JWT.get('ACCESS_TOKEN_LIFETIME').total_seconds()),
                secure=settings.SIMPLE_JWT.get('AUTH_COOKIE_SECURE', False),
                httponly=settings.SIMPLE_JWT.get('AUTH_COOKIE_HTTP_ONLY', True),
                samesite=settings.SIMPLE_JWT.get('AUTH_COOKIE_SAMESITE', 'Lax'),
                path=settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/')
            )
            # Set Refresh Token Cookie
            response.set_cookie(
                key=settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token'),
                value=refresh_token,
                max_age=int(settings.SIMPLE_JWT.get('REFRESH_TOKEN_LIFETIME').total_seconds()),
                secure=settings.SIMPLE_JWT.get('AUTH_COOKIE_SECURE', False),
                httponly=settings.SIMPLE_JWT.get('AUTH_COOKIE_HTTP_ONLY', True),
                samesite=settings.SIMPLE_JWT.get('AUTH_COOKIE_SAMESITE', 'Lax'),
                path=settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/')
            )
        return response

class CustomTokenRefreshView(TokenRefreshView):
    """
    Custom token refresh view that reads the refresh token from HttpOnly cookies
    and sets the new access token in an HttpOnly cookie.
    """
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token'))
        if refresh_token:
            request.data['refresh'] = refresh_token
        
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            access_token = response.data.get('access')
            response.set_cookie(
                key=settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token'),
                value=access_token,
                max_age=int(settings.SIMPLE_JWT.get('ACCESS_TOKEN_LIFETIME').total_seconds()),
                secure=settings.SIMPLE_JWT.get('AUTH_COOKIE_SECURE', False),
                httponly=settings.SIMPLE_JWT.get('AUTH_COOKIE_HTTP_ONLY', True),
                samesite=settings.SIMPLE_JWT.get('AUTH_COOKIE_SAMESITE', 'Lax'),
                path=settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/')
            )
        return response

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def logout_view(request):
    """
    Deletes access and refresh token cookies to log out the user.
    """
    response = Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
    response.delete_cookie(settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token'), path=settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/'))
    response.delete_cookie(settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token'), path=settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/'))
    return response


