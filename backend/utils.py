import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random

def generate_otp():
    return ''.join(random.choices("0123456789",k=6))


def send_email_smtplib(sender_email,recipient_email, subject , body , smtp_server , smtp_port , username , password):
    try:
        msg = MIMEMultipart()
        msg["From"] = sender_email
        msg["To"] = recipient_email
        msg["Subject"] = subject

        msg.attach(MIMEText(body, 'plain'))


        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(username,password)
            server.send_message(msg)

    except Exception as e:
        raise RuntimeError(f"Failed to send email: {e}")