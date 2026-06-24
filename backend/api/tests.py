from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken
from .models import SurveySession, Booking, ServiceContent, VisitorStats, GalleryImage


class CustomCookieJWTAuthTests(APITestCase):
    """
    Test suite for Cookie-based JWT Authentication and login/refresh/logout views.
    """

    def setUp(self):
        self.username = "admin"
        self.password = "SecuredPassword123!"
        self.email = "admin@deccandigitalsurveys.com"
        self.user = User.objects.create_superuser(
            username=self.username, password=self.password, email=self.email
        )

    def test_token_obtain_pair_sets_cookies(self):
        """
        Verify obtaining token sets HttpOnly cookies.
        """
        url = reverse('token_obtain_pair')
        response = self.client.post(
            url, {'username': self.username, 'password': self.password}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.cookies)
        self.assertIn('refresh_token', response.cookies)
        self.assertTrue(response.cookies['access_token']['httponly'])
        self.assertTrue(response.cookies['refresh_token']['httponly'])

    def test_logout_deletes_cookies(self):
        """
        Verify logging out removes the authentication cookies.
        """
        url = reverse('token_logout')
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check that the max-age or expiry makes cookies empty/expired
        self.assertEqual(response.cookies['access_token'].value, '')
        self.assertEqual(response.cookies['refresh_token'].value, '')

    def test_authenticated_request_with_cookie(self):
        """
        Verify access with a cookie containing a valid access token.
        """
        token = str(AccessToken.for_user(self.user))
        self.client.cookies['access_token'] = token
        
        # Test accessing an admin-only endpoint: dashboard-overview
        url = reverse('dashboard_overview')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unauthenticated_request_fails(self):
        """
        Verify access is blocked without authentication cookies.
        """
        url = reverse('dashboard_overview')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class BookingSerializerValidationTests(APITestCase):
    """
    Test suite for file size limits and file extension checks in BookingSerializer.
    """

    def setUp(self):
        self.url = reverse('booking-list')

    def test_valid_booking_with_documents(self):
        """
        Submit a booking request with a valid document size and extension.
        """
        valid_pdf = SimpleUploadedFile(
            "test_deed.pdf",
            b"Dummy PDF content here",
            content_type="application/pdf"
        )
        data = {
            'customer_name': 'Lokesh Goud',
            'mobile_number': '9876543210',
            'email': 'lokesh@example.com',
            'survey_type': 'Land Survey',
            'property_location': 'Siddipet, Telangana',
            'survey_date': '2026-07-01',
            'land_document': valid_pdf
        }
        response = self.client.post(self.url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_large_file_rejected(self):
        """
        Upload a document > 5MB and assert validation failure.
        """
        # Create a file exactly 6MB in size
        large_file = SimpleUploadedFile(
            "test_large.pdf",
            b"0" * (6 * 1024 * 1024),
            content_type="application/pdf"
        )
        data = {
            'customer_name': 'Lokesh Goud',
            'mobile_number': '9876543210',
            'email': 'lokesh@example.com',
            'survey_type': 'Land Survey',
            'property_location': 'Siddipet, Telangana',
            'survey_date': '2026-07-01',
            'land_document': large_file
        }
        response = self.client.post(self.url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('land_document', response.data)
        self.assertTrue(any("exceed 5MB" in str(err) for err in response.data['land_document']))

    def test_invalid_extension_rejected(self):
        """
        Upload a file with unsupported extension (.exe) and assert failure.
        """
        invalid_file = SimpleUploadedFile(
            "dangerous_script.exe",
            b"echo Hello",
            content_type="application/octet-stream"
        )
        data = {
            'customer_name': 'Lokesh Goud',
            'mobile_number': '9876543210',
            'email': 'lokesh@example.com',
            'survey_type': 'Land Survey',
            'property_location': 'Siddipet, Telangana',
            'survey_date': '2026-07-01',
            'land_document': invalid_file
        }
        response = self.client.post(self.url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('land_document', response.data)
        self.assertTrue(any("extension" in str(err) for err in response.data['land_document']))


class SurveySessionAndAnalyticsTests(APITestCase):
    """
    Test suite for SurveySessions logging and Dashboard Overview analytics calculators.
    """

    def setUp(self):
        # Create superuser for overview
        self.admin = User.objects.create_superuser(
            username="admin", password="password123", email="admin@test.com"
        )
        # Create some services
        ServiceContent.objects.create(
            title="Land Survey", slug="land-survey",
            description="Short desc", detail_text="Detail text",
            process="P1;P2", benefits="B1;B2", equipment="DGPS"
        )
        
        # Create visitor log
        VisitorStats.objects.create(ip_address="127.0.0.1", page_visited="Home")

    def test_survey_session_lifecycle(self):
        """
        Verify logging start, completion, and conversion of survey sessions.
        """
        # 1. Start survey session
        session_url = reverse('survey-session-list')
        session_data = {
            'session_id': 'session_abc_123'
        }
        res = self.client.post(session_url, session_data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        
        # 2. Update recommended service & complete session
        session_detail_url = reverse('survey-session-detail', kwargs={'session_id': 'session_abc_123'})
        update_data = {
            'session_id': 'session_abc_123',
            'recommended_service': 'Land Survey',
            'completed_at': timezone.now()
        }
        res = self.client.put(session_detail_url, update_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['recommended_service'], 'Land Survey')
        self.assertIsNotNone(res.data['completed_at'])
        
        # 3. Convert session to booking
        update_data['is_converted'] = True
        res = self.client.put(session_detail_url, update_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['is_converted'])

    def test_dashboard_overview_analytics(self):
        """
        Verify conversion, completion rate, and popular service calculations.
        """
        # Create sessions
        # Session 1: Started but abandoned
        SurveySession.objects.create(session_id="session_1", ip_address="127.0.0.1")
        # Session 2: Completed
        SurveySession.objects.create(
            session_id="session_2", ip_address="127.0.0.1",
            completed_at=timezone.now(), recommended_service="Land Survey"
        )
        # Session 3: Completed and Converted
        SurveySession.objects.create(
            session_id="session_3", ip_address="127.0.0.1",
            completed_at=timezone.now(), recommended_service="Land Survey",
            is_converted=True
        )

        # Create Bookings to count popular services
        Booking.objects.create(
            customer_name="John", mobile_number="123", email="john@test.com",
            survey_type="Land Survey", property_location="Loc", survey_date="2026-07-01"
        )
        Booking.objects.create(
            customer_name="Bob", mobile_number="789", email="bob@test.com",
            survey_type="Land Survey", property_location="Loc", survey_date="2026-07-03"
        )
        Booking.objects.create(
            customer_name="Jane", mobile_number="456", email="jane@test.com",
            survey_type="Tippon Survey", property_location="Loc", survey_date="2026-07-02"
        )

        # Force authentication of admin
        self.client.force_authenticate(user=self.admin)
        
        url = reverse('dashboard_overview')
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        
        # We expect:
        # Sessions: 3 total
        # Completed: 2 (session_2, session_3)
        # Converted: 1 (session_3)
        # Completion Rate: 2 / 3 * 100 = 66.7%
        # Conversion Rate: 1 / 2 * 100 = 50.0%
        self.assertEqual(res.data['total_survey_sessions'], 3)
        self.assertEqual(res.data['completed_survey_sessions'], 2)
        self.assertEqual(res.data['converted_survey_sessions'], 1)
        self.assertEqual(res.data['survey_completion_rate'], 66.7)
        self.assertEqual(res.data['survey_conversion_rate'], 50.0)
        
        # Popular services rankings: Land Survey: 2, Tippon Survey: 1
        popular = res.data['popular_services']
        self.assertTrue(len(popular) >= 2)
        self.assertEqual(popular[0]['survey_type'], 'Land Survey')
        self.assertEqual(popular[0]['count'], 2)
