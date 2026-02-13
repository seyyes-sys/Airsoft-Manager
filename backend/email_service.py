import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import date
import os

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", SMTP_USER)
APP_URL = os.getenv("APP_URL", "http://localhost:3000")


async def send_email(to_email: str, subject: str, html_content: str):
    """Envoyer un email"""
    message = MIMEMultipart("alternative")
    message["From"] = EMAIL_FROM
    message["To"] = to_email
    message["Subject"] = subject
    
    html_part = MIMEText(html_content, "html")
    message.attach(html_part)
    
    try:
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            start_tls=True
        )
    except Exception as e:
        print(f"Erreur lors de l'envoi de l'email: {e}")
        raise


async def send_confirmation_email(
    email: str,
    first_name: str,
    game_date: date,
    registration_id: int
):
    """Envoyer un email de confirmation d'inscription"""
    subject = "Confirmation d'inscription - Partie d'Airsoft"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #1a1a1a;
                color: #e0e0e0;
                padding: 20px;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #2d2d2d;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            }}
            h1 {{
                color: #4CAF50;
                border-bottom: 2px solid #4CAF50;
                padding-bottom: 10px;
            }}
            .info {{
                background-color: #3a3a3a;
                padding: 15px;
                border-left: 4px solid #4CAF50;
                margin: 20px 0;
            }}
            .button {{
                display: inline-block;
                background-color: #4CAF50;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
            }}
            .footer {{
                margin-top: 30px;
                font-size: 12px;
                color: #888;
                text-align: center;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎯 Confirmation d'inscription</h1>
            <p>Bonjour {first_name},</p>
            <p>Merci pour votre inscription à la partie d'airsoft !</p>
            
            <div class="info">
                <strong>Date de la partie :</strong> {game_date.strftime('%d/%m/%Y')}
            </div>
            
            <p>Pour finaliser votre inscription, veuillez cliquer sur le bouton ci-dessous :</p>
            
            <a href="{APP_URL}/confirm/{registration_id}" class="button">
                Confirmer mon inscription
            </a>
            
            <p>Nous vous enverrons un rappel quelques jours avant la partie.</p>
            
            <p>À bientôt sur le terrain ! 🔫</p>
            
            <div class="footer">
                <p>Si vous n'avez pas demandé cette inscription, vous pouvez ignorer cet email.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    await send_email(email, subject, html_content)


async def send_reminder_email(
    email: str,
    first_name: str,
    game_date: date
):
    """Envoyer un email de rappel"""
    subject = "Rappel - Partie d'Airsoft"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #1a1a1a;
                color: #e0e0e0;
                padding: 20px;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #2d2d2d;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            }}
            h1 {{
                color: #FF9800;
                border-bottom: 2px solid #FF9800;
                padding-bottom: 10px;
            }}
            .info {{
                background-color: #3a3a3a;
                padding: 15px;
                border-left: 4px solid #FF9800;
                margin: 20px 0;
            }}
            .footer {{
                margin-top: 30px;
                font-size: 12px;
                color: #888;
                text-align: center;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>⚠️ Rappel - Partie d'Airsoft</h1>
            <p>Bonjour {first_name},</p>
            <p>Nous vous rappelons que vous êtes inscrit(e) à la prochaine partie d'airsoft !</p>
            
            <div class="info">
                <strong>Date de la partie :</strong> {game_date.strftime('%d/%m/%Y')}
            </div>
            
            <p><strong>N'oubliez pas d'apporter :</strong></p>
            <ul>
                <li>Votre équipement d'airsoft</li>
                <li>Vos protections (lunettes, masque)</li>
                <li>De l'eau et de quoi grignoter</li>
                <li>Votre bonne humeur ! 😊</li>
            </ul>
            
            <p>À très bientôt ! 🎯</p>
            
            <div class="footer">
                <p>Airsoft Manager - Gestion des parties</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    await send_email(email, subject, html_content)


async def send_rejection_email(
    email: str,
    first_name: str,
    game_date: date,
    rejection_reason: str
):
    """Envoyer un email de rejet d'inscription"""
    subject = "Inscription refusée - Partie d'Airsoft"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #1a1a1a;
                color: #e0e0e0;
                padding: 20px;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #2d2d2d;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            }}
            h1 {{
                color: #f44336;
                border-bottom: 2px solid #f44336;
                padding-bottom: 10px;
            }}
            .info {{
                background-color: #3a3a3a;
                padding: 15px;
                border-left: 4px solid #f44336;
                margin: 20px 0;
            }}
            .reason {{
                background-color: #3a3a3a;
                padding: 15px;
                border-left: 4px solid #ff9800;
                margin: 20px 0;
            }}
            .footer {{
                margin-top: 30px;
                font-size: 12px;
                color: #888;
                text-align: center;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>❌ Inscription refusée</h1>
            <p>Bonjour {first_name},</p>
            <p>Nous sommes désolés de vous informer que votre inscription à la partie d'airsoft a été refusée.</p>
            
            <div class="info">
                <strong>Date de la partie :</strong> {game_date.strftime('%d/%m/%Y')}
            </div>
            
            <div class="reason">
                <strong>Motif du refus :</strong><br>
                {rejection_reason}
            </div>
            
            <p>Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez plus d'informations, n'hésitez pas à nous contacter.</p>
            
            <p>À bientôt peut-être ! 🎯</p>
            
            <div class="footer">
                <p>Airsoft Manager - Gestion des parties</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    await send_email(email, subject, html_content)


async def send_approval_email(
    email: str,
    first_name: str,
    game_date: date,
    registration_id: int
):
    """Envoyer un email d'approbation d'inscription"""
    subject = "Inscription approuvée - Partie d'Airsoft"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #1a1a1a;
                color: #e0e0e0;
                padding: 20px;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #2d2d2d;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            }}
            h1 {{
                color: #4CAF50;
                border-bottom: 2px solid #4CAF50;
                padding-bottom: 10px;
            }}
            .info {{
                background-color: #3a3a3a;
                padding: 15px;
                border-left: 4px solid #4CAF50;
                margin: 20px 0;
            }}
            .button {{
                display: inline-block;
                background-color: #4CAF50;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
            }}
            .footer {{
                margin-top: 30px;
                font-size: 12px;
                color: #888;
                text-align: center;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>✅ Inscription approuvée</h1>
            <p>Bonjour {first_name},</p>
            <p>Bonne nouvelle ! Votre inscription à la partie d'airsoft a été approuvée par l'administrateur.</p>
            
            <div class="info">
                <strong>Date de la partie :</strong> {game_date.strftime('%d/%m/%Y')}
            </div>
            
            <p>Pour finaliser votre inscription, veuillez cliquer sur le bouton ci-dessous :</p>
            
            <a href="{APP_URL}/confirm/{registration_id}" class="button">
                Confirmer mon inscription
            </a>
            
            <p>Nous vous enverrons un rappel quelques jours avant la partie.</p>
            
            <p>À bientôt sur le terrain ! 🔫</p>
            
            <div class="footer">
                <p>Si vous n'êtes plus disponible, vous pouvez ignorer cet email.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    await send_email(email, subject, html_content)
