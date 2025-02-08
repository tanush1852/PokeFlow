import os
import base64
from io import BytesIO
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.http import MediaIoBaseUpload

# Scopes for Gmail and Drive API
SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/drive'
]

def get_credentials():
    """Authenticate and return credentials."""
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'googledrive.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    return creds

def get_or_create_folder(drive_service):
    """Get or create the EmailAttachments folder."""
    folder_name = 'EmailAttachments'
    query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    results = drive_service.files().list(q=query, fields="files(id)").execute()
    items = results.get('files', [])
    
    if items:
        return items[0]['id']
    else:
        file_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder'
        }
        folder = drive_service.files().create(body=file_metadata, fields='id').execute()
        return folder['id']

def process_attachments(gmail_service, drive_service):
    """Main function to process emails and attachments."""
    # Get unread emails
    results = gmail_service.users().messages().list(
        userId='me',
        labelIds=['UNREAD'],
        maxResults=10
    ).execute()
    
    messages = results.get('messages', [])
    if not messages:
        print("No unread emails found.")
        return

    folder_id = get_or_create_folder(drive_service)

    for message in messages:
        msg = gmail_service.users().messages().get(
            userId='me',
            id=message['id'],
            format='full'
        ).execute()

        parts = [msg['payload']]
        attachments = []
        
        while parts:
            part = parts.pop()
            if part.get('parts'):
                parts.extend(part['parts'])
            if part.get('filename') and part['filename'] != '' and part.get('body').get('attachmentId'):
                attachments.append(part)

        for part in attachments:
            attachment_id = part['body']['attachmentId']
            filename = part['filename']
            
            # Get attachment data
            attachment = gmail_service.users().messages().attachments().get(
                userId='me',
                messageId=message['id'],
                id=attachment_id
            ).execute()

            file_data = base64.urlsafe_b64decode(attachment['data'].encode('UTF-8'))

            file_bytes = BytesIO(file_data)
            
            # Upload to Google Drive
            media = MediaIoBaseUpload(file_bytes, mimetype=part['mimeType'], resumable=True)
            file_metadata = {
                'name': filename,
                'parents': [folder_id]
            }
            drive_service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id'
            ).execute()
            print(f"Uploaded {filename} to Google Drive")

        # Mark email as read
        gmail_service.users().messages().modify(
            userId='me',
            id=message['id'],
            body={'removeLabelIds': ['UNREAD']}
        ).execute()

if __name__ == '__main__':
    creds = get_credentials()
    gmail_service = build('gmail', 'v1', credentials=creds)
    drive_service = build('drive', 'v3', credentials=creds)
    process_attachments(gmail_service, drive_service)