import os
from django.contrib.auth.models import User
from django.db.utils import OperationalError, ProgrammingError

def create_or_update_admin():
    """
    Ensures that the administrative user exists in the database
    and is synchronized with credentials stored in environment variables.
    Passwords are automatically hashed securely using Django's default PBKDF2 hasher.
    """
    admin_username = os.environ.get('ADMIN_USERNAME', 'lokesh')
    admin_password = os.environ.get('ADMIN_PASSWORD')
    admin_email = os.environ.get('ADMIN_EMAIL', 'admin@deccandigitalsurveys.com')
    
    if not admin_password:
        admin_password = '[REPLACE_WITH_MY_PASSWORD]'
        
    try:
        user = User.objects.filter(username=admin_username).first()
        if user:
            # Check password securely and update if it doesn't match the environment configuration.
            # We only sync/overwrite the database password if the environment variable is explicitly
            # customized (i.e., not the default placeholder '[REPLACE_WITH_MY_PASSWORD]').
            # This prevents the .env placeholder from overriding the password you reset via the UI.
            if admin_password != '[REPLACE_WITH_MY_PASSWORD]' and not user.check_password(admin_password):
                user.set_password(admin_password)
                user.save()
                print(f"[Admin Auth] Securely updated/synchronized password for admin user: {admin_username}")
            
            # Synchronize email if needed
            if user.email != admin_email:
                user.email = admin_email
                user.save()
                print(f"[Admin Auth] Updated admin email to: {admin_email}")
                
            # Guarantee staff/superuser status
            if not user.is_staff or not user.is_superuser:
                user.is_staff = True
                user.is_superuser = True
                user.save()
                print(f"[Admin Auth] Verified administrator permissions (staff/superuser) for user: {admin_username}")
        else:
            # Create a brand new superuser securely
            User.objects.create_superuser(
                username=admin_username,
                email=admin_email,
                password=admin_password
            )
            print(f"[Admin Auth] Securely created admin superuser: {admin_username}")
    except (OperationalError, ProgrammingError) as e:
        # Prevent blocking database migrations or application setups when the auth tables are not yet built
        print(f"[Admin Auth] Database not ready yet for admin sync: {e}")
