from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from .models import MagicLink
import logging

logger = logging.getLogger(__name__)


class MagicLinkEmailService:
    """
    Service class for handling magic link email operations
    """
    
    @staticmethod
    def send_magic_link(user, magic_link, request=None):
        """
        Send magic link email to user
        """
        try:
            # Get the frontend URL from settings
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            
            # Create the magic link URL
            magic_link_url = f"{frontend_url}/auth/verify?token={magic_link.token}"
            
            # Email context
            context = {
                'user': user,
                'magic_link_url': magic_link_url,
                'expires_minutes': 15,
                'site_name': 'DrawnZones',
                'token': str(magic_link.token)
            }
            
            # Create email content
            subject = f"Sign in to {context['site_name']}"
            
            # HTML email content
            html_message = f"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Sign in to {context['site_name']}</title>
                <style>
                    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ text-align: center; padding: 20px 0; border-bottom: 2px solid #00bcd4; }}
                    .logo {{ font-size: 24px; font-weight: bold; color: #00bcd4; }}
                    .content {{ padding: 30px 0; }}
                    .button {{ display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #00bcd4, #2196f3); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }}
                    .button:hover {{ background: linear-gradient(135deg, #00acc1, #1976d2); }}
                    .footer {{ text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #666; font-size: 12px; }}
                    .warning {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">{context['site_name']}</div>
                    </div>
                    
                    <div class="content">
                        <h2>Welcome back!</h2>
                        <p>Hi there,</p>
                        <p>You requested to sign in to your {context['site_name']} account. Click the button below to securely sign in:</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{magic_link_url}" class="button">Sign In to {context['site_name']}</a>
                        </div>
                        
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
                            <a href="{magic_link_url}">{magic_link_url}</a>
                        </p>
                        
                        <div class="warning">
                            <strong>⏰ This link will expire in {context['expires_minutes']} minutes.</strong>
                        </div>
                        
                        <p>If you didn't request this sign-in link, you can safely ignore this email.</p>
                        
                        <p>For security reasons, this link can only be used once and will expire automatically.</p>
                    </div>
                    
                    <div class="footer">
                        <p>This email was sent from {context['site_name']}.</p>
                        <p>If you have any questions, please contact our support team.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Plain text version
            plain_message = f"""
Welcome back to {context['site_name']}!

Hi there,

You requested to sign in to your {context['site_name']} account. Click the link below to securely sign in:

{magic_link_url}

This link will expire in {context['expires_minutes']} minutes for security reasons.

If you didn't request this sign-in link, you can safely ignore this email.

For security reasons, this link can only be used once and will expire automatically.

---
This email was sent from {context['site_name']}.
If you have any questions, please contact our support team.
            """.strip()
            
            # Send email
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
            
            logger.info(f"Magic link email sent successfully to {user.email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send magic link email to {user.email}: {str(e)}")
            return False
    
    @staticmethod
    def send_welcome_email(user):
        """
        Send welcome email to new users
        """
        try:
            context = {
                'user': user,
                'site_name': 'DrawnZones'
            }
            
            subject = f"Welcome to {context['site_name']}!"
            
            html_message = f"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to {context['site_name']}</title>
                <style>
                    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ text-align: center; padding: 20px 0; border-bottom: 2px solid #00bcd4; }}
                    .logo {{ font-size: 24px; font-weight: bold; color: #00bcd4; }}
                    .content {{ padding: 30px 0; }}
                    .footer {{ text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #666; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">{context['site_name']}</div>
                    </div>
                    
                    <div class="content">
                        <h2>Welcome to {context['site_name']}! 🎉</h2>
                        <p>Hi {user.first_name or user.email},</p>
                        <p>Welcome to {context['site_name']}! Your account has been successfully created and verified.</p>
                        <p>You can now access all the features of our platform and start creating amazing content.</p>
                        <p>If you have any questions, feel free to reach out to our support team.</p>
                        <p>Thank you for joining us!</p>
                    </div>
                    
                    <div class="footer">
                        <p>This email was sent from {context['site_name']}.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            plain_message = f"""
Welcome to {context['site_name']}!

Hi {user.first_name or user.email},

Welcome to {context['site_name']}! Your account has been successfully created and verified.
You can now access all the features of our platform and start creating amazing content.

If you have any questions, feel free to reach out to our support team.

Thank you for joining us!

---
This email was sent from {context['site_name']}.
            """.strip()
            
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
            
            logger.info(f"Welcome email sent successfully to {user.email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send welcome email to {user.email}: {str(e)}")
            return False
