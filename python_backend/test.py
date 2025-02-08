import os.path
import csv
import base64
from email.mime.text import MIMEText
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

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
                "credentials.json", SCOPES
            )
            creds = flow.run_local_server(port=0)
        with open("token.json", "w") as token:
            token.write(creds.to_json())
    
    return build("gmail", "v1", credentials=creds)

def get_email_content(service, user_id, msg_id):
    """Get the content of a specific email."""
    try:
        message = service.users().messages().get(userId=user_id, id=msg_id, format='full').execute()
        
        # Get subject from headers
        subject = ''
        headers = message['payload']['headers']
        for header in headers:
            if header['name'] == 'Subject':
                subject = header['value']
                break
        
        # Get email body
        if 'parts' in message['payload']:
            parts = message['payload']['parts']
            data = parts[0]['body'].get('data', '')
        else:
            data = message['payload']['body'].get('data', '')
        
        if data:
            text = base64.urlsafe_b64decode(data).decode('utf-8')
        else:
            text = "No content"
            
        return subject, text
    except Exception as error:
        print(f"An error occurred: {error}")
        return None, None

def main():
    try:
        # Get Gmail service
        service = get_gmail_service()
        
        # Search for unread emails
        results = service.users().messages().list(
            userId='me',
            q='is:unread',
            maxResults=10
        ).execute()
        
        messages = results.get('messages', [])
        
        if not messages:
            print("No unread messages found.")
            return
            
        # Prepare CSV file
        with open('unread_emails.csv', 'w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(['Subject', 'Content'])
            
            # Process each message
            for message in messages:
                subject, content = get_email_content(service, 'me', message['id'])
                if subject and content:
                    # Clean the content - remove excessive newlines and spaces
                    content = ' '.join(content.split())
                    writer.writerow([subject, content])
        
        print(f"Successfully saved {len(messages)} unread emails to unread_emails.csv")

    except HttpError as error:
        print(f"An error occurred: {error}")

if __name__ == "__main__":
    main()