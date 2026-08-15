import os
import smtplib
from email.message import EmailMessage
from typing import Optional
import logging

# Email configuration from environment variables
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "your-email@gmail.com")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "your-app-password")
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True").lower() == "true"

logger = logging.getLogger(__name__)

async def send_password_reset_email(recipient_email: str, username: str, reset_url: str):
    """Send password reset email with a link."""
    try:
        msg = EmailMessage()
        msg["Subject"] = "Password Reset Request"
        msg["From"] = EMAIL_HOST_USER
        msg["To"] = recipient_email
        
        # HTML content
        html_content = f"""
        <html>
        <body>
            <h2>Password Reset</h2>
            <p>Hello {username},</p>
            <p>We received a request to reset your password. Please click the link below to reset your password:</p>
            <p><a href="{reset_url}">Reset Password</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
            <p>Thank you,</p>
            <p>Your Application Team</p>
        </body>
        </html>
        """
        
        msg.add_alternative(html_content, subtype="html")
        
        # Connect to SMTP server and send email
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            if EMAIL_USE_TLS:
                server.starttls()
            
            server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
            server.send_message(msg)
            
        logger.info(f"Password reset email sent to {recipient_email}")
        
    except Exception as e:
        logger.error(f"Failed to send password reset email: {str(e)}")