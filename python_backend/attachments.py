from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import base64
import os
import pickle

class GmailDriveSync:
    def __init__(self):
        # If modifying these scopes, delete the token.pickle file
        self.SCOPES = [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/drive.file'
        ]
        self.creds = None

    def authenticate(self):
        """Handles authentication for both Gmail and Drive APIs."""
        if os.path.exists('token.pickle'):
            with open('token.pickle', 'rb') as token:
                self.creds = pickle.load(token)

        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                self.creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    'googledrive.json', self.SCOPES)
                self.creds = flow.run_local_server(port=0)

            with open('token.pickle', 'wb') as token:
                pickle.dump(self.creds, token)

        self.gmail_service = build('gmail', 'v1', credentials=self.creds)
        self.drive_service = build('drive', 'v3', credentials=self.creds)

    def get_unread_emails(self, max_results=10):
        """Fetches unread emails from Gmail."""
        try:
            results = self.gmail_service.users().messages().list(
                userId='me',
                labelIds=['UNREAD'],
                maxResults=max_results
            ).execute()

            return results.get('messages', [])
        except Exception as e:
            print(f"Error fetching emails: {e}")
            return []

    def get_attachments(self, message_id):
        """Gets attachments from a specific email."""
        try:
            message = self.gmail_service.users().messages().get(
                userId='me',
                id=message_id
            ).execute()

            parts = message['payload'].get('parts', [])
            attachments = []

            for part in parts:
                if part.get('filename'):
                    attachment = self.gmail_service.users().messages().attachments().get(
                        userId='me',
                        messageId=message_id,
                        id=part['body']['attachmentId']
                    ).execute()

                    file_data = base64.urlsafe_b64decode(attachment['data'])
                    
                    # Save attachment temporarily
                    temp_path = os.path.join('temp', part['filename'])
                    os.makedirs('temp', exist_ok=True)
                    
                    with open(temp_path, 'wb') as f:
                        f.write(file_data)
                    
                    attachments.append({
                        'filename': part['filename'],
                        'path': temp_path
                    })

            return attachments
        except Exception as e:
            print(f"Error processing message {message_id}: {e}")
            return []

    def upload_to_drive(self, file_path, folder_id):
        """Uploads a file to Google Drive in the specified folder."""
        try:
            file_metadata = {
                'name': os.path.basename(file_path),
                'parents': [folder_id]
            }

            media = MediaFileUpload(
                file_path,
                resumable=True
            )

            file = self.drive_service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id'
            ).execute()

            return file.get('id')
        except Exception as e:
            print(f"Error uploading file {file_path}: {e}")
            return None

    def create_drive_folder(self, folder_name):
        """Creates a folder in Google Drive and returns its ID."""
        try:
            file_metadata = {
                'name': folder_name,
                'mimeType': 'application/vnd.google-apps.folder'
            }

            file = self.drive_service.files().create(
                body=file_metadata,
                fields='id'
            ).execute()

            return file.get('id')
        except Exception as e:
            print(f"Error creating folder: {e}")
            return None

    def cleanup(self):
        """Removes temporary files."""
        if os.path.exists('temp'):
            for file in os.listdir('temp'):
                os.remove(os.path.join('temp', file))
            os.rmdir('temp')

def main():
    # Initialize the sync object
    syncer = GmailDriveSync()
    
    # Authenticate
    syncer.authenticate()
    
    # Get folder name from user
    folder_name = input("Enter the name for the Drive folder to store attachments: ")
    
    # Create folder in Drive
    folder_id = syncer.create_drive_folder(folder_name)
    if not folder_id:
        print("Failed to create folder in Drive")
        return

    # Get unread emails
    messages = syncer.get_unread_emails()
    
    # Process each email
    for message in messages:
        attachments = syncer.get_attachments(message['id'])
        
        # Upload attachments to Drive
        for attachment in attachments:
            file_id = syncer.upload_to_drive(attachment['path'], folder_id)
            if file_id:
                print(f"Successfully uploaded {attachment['filename']}")
            else:
                print(f"Failed to upload {attachment['filename']}")

    # Cleanup temporary files
    syncer.cleanup()

if __name__ == '__main__':
    main()