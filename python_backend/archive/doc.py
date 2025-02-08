from flask import Flask, jsonify
import os
import base64
from googleapiclient.http import MediaIoBaseUpload
from io import BytesIO
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv
import logging
from datetime import datetime

load_dotenv()
app = Flask(__name__)

# Define scopes for both Gmail and Drive
SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/drive.file"
]

def get_gmail_service():
    """Gets authenticated Gmail service."""
    creds = None
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                "googledrive.json", SCOPES
            )
            creds = flow.run_local_server(port=0)
        with open("token.json", "w") as token:
            token.write(creds.to_json())
    
    return build("gmail", "v1", credentials=creds)

def get_drive_service(creds):
    """Gets authenticated Google Drive service."""
    return build("drive", "v3", credentials=creds)

def is_primary_inbox_email(service, user_id, msg_id):
    """Check if the email is in the primary inbox category."""
    try:
        message = service.users().messages().get(userId=user_id, id=msg_id).execute()
        labels = message.get('labelIds', [])
        is_primary = ('CATEGORY_PERSONAL' in labels or 'INBOX' in labels) and \
                    'CATEGORY_PROMOTIONS' not in labels and \
                    'CATEGORY_SOCIAL' not in labels
        
        return is_primary
    except Exception as error:
        logging.error(f"An error occurred checking labels: {error}")
        return False

def process_attachments(service, user_id, msg_id, drive_service):
    """Extract attachments from email and upload to Google Drive."""
    try:
        # Get the email message
        message = service.users().messages().get(userId=user_id, id=msg_id).execute()
        
        if 'payload' not in message:
            return []

        uploaded_files = []
        parts = [message['payload']]
        
        # Helper function to process message parts recursively
        def process_parts(parts):
            for part in parts:
                if 'parts' in part:
                    process_parts(part['parts'])
                
                if 'filename' in part and part['filename']:
                    # Get attachment data
                    if 'body' in part and 'attachmentId' in part['body']:
                        attachment = service.users().messages().attachments().get(
                            userId=user_id,
                            messageId=msg_id,
                            id=part['body']['attachmentId']
                        ).execute()
                        
                        if 'data' in attachment:
                            # Decode attachment data
                            file_data = base64.urlsafe_b64decode(attachment['data'])
                            
                            # Create file metadata
                            file_metadata = {
                                'name': part['filename'],
                                'mimeType': part['mimeType']
                            }
                            
                            # Create file in memory
                            fh = BytesIO(file_data)
                            
                            # Create media upload object
                            media = MediaIoBaseUpload(
                                fh,
                                mimetype=part['mimeType'],
                                resumable=True
                            )
                            
                            # Upload to Drive
                            file = drive_service.files().create(
                                body=file_metadata,
                                media_body=media,
                                fields='id, name, webViewLink'
                            ).execute()
                            
                            uploaded_files.append({
                                'filename': part['filename'],
                                'drive_id': file.get('id'),
                                'drive_link': file.get('webViewLink'),
                                'mime_type': part['mimeType']
                            })
        
        process_parts(parts)
        return uploaded_files
    
    except Exception as error:
        logging.error(f"An error occurred processing attachments: {error}")
        return []

@app.route('/api/process_email_attachments', methods=['GET'])
def process_email_attachments():
    """API endpoint to process email attachments and upload to Drive."""
    try:
        # Get Gmail service
        gmail_service = get_gmail_service()
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
        
        # Get Drive service
        drive_service = get_drive_service(creds)
        
        # Search for unread emails with attachments
        results = gmail_service.users().messages().list(
            userId='me',
            q='has:attachment is:unread category:primary',
            maxResults=10
        ).execute()
        
        messages = results.get('messages', [])
        
        if not messages:
            return jsonify({
                'status': 'success',
                'message': 'No unread messages with attachments found',
                'data': []
            }), 200
        
        all_attachments = []
        
        # Process each message
        for message in messages:
            if is_primary_inbox_email(gmail_service, 'me', message['id']):
                attachments = process_attachments(
                    gmail_service, 
                    'me', 
                    message['id'],
                    drive_service
                )
                if attachments:
                    all_attachments.extend(attachments)
        
        return jsonify({
            'status': 'success',
            'message': f'Successfully processed {len(all_attachments)} attachments',
            'data': all_attachments
        }), 200
        
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)