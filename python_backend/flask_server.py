from flask import Flask, jsonify
import os.path
import base64
from email.mime.text import MIMEText
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from llm_models import LLMModelInterface
from notion_client import Client
from dotenv import load_dotenv
from meet import minutes_meet
from docs import store_markdown_to_gdoc


import os
import base64
from io import BytesIO
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.http import MediaIoBaseUpload

from flask import Flask, request, jsonify
import asyncio
import logging
import nest_asyncio
from functools import wraps
from datetime import datetime

load_dotenv()
# Notion API setup
NOTION_API_KEY = os.getenv("NOTION_API_KEY")
NOTION_PAGE_ID = os.getenv("NOTION_PAGE_ID")

llm_interface = LLMModelInterface()

app = Flask(__name__)
nest_asyncio.apply()


# If modifying these scopes, delete the file token.json.
# SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

notion = Client(auth=NOTION_API_KEY)


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

def generate_linkedin_search_url(job_title, location):
    """Generate LinkedIn search URL based on job title and location."""
    base_url = "https://www.linkedin.com/search/results/people/"
    query = f"?keywords={job_title.replace(' ', '%20')}%20{location.replace(' ', '%20')}&origin=GLOBAL_SEARCH_HEADER"
    return base_url + query

async def scrape_linkedin_users(email, password, job_title, location):
    """Async function to scrape LinkedIn user data."""
    print(1)
    search_url = generate_linkedin_search_url(job_title, location)
    return {"search_url": search_url}

def validate_request_data(f):
    """Decorator to validate request data."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        data = request.get_json()
        required_fields = ['email', 'password', 'job_title', 'location']
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
            
        return f(*args, **kwargs)
    return decorated_function


def get_or_create_notion_database():
    """Checks if a Notion database exists, otherwise creates one."""
    logging.info("Checking for existing Notion database...")

    try:
        search_results = notion.search(query="Email Tasks")
        for result in search_results["results"]:
            if result["object"] == "database":
                logging.info(f"Found existing Notion database: {result['id']}")
                return result["id"]

        # Create a new Notion database
        logging.info("No existing database found. Creating a new one...")
        database = notion.databases.create(
            parent={"page_id": NOTION_PAGE_ID},
            title=[{"text": {"content": "Email Tasks"}}],
            properties={
                "Task": {"title": {}},
                "Status": {
                    "select": {
                        "options": [
                            {"name": "To Do", "color": "red"},
                            {"name": "In Progress", "color": "yellow"},
                            {"name": "Done", "color": "green"},
                        ]
                    }
                }
            },
        )
        logging.info(f"Created new Notion database: {database['id']}")
        return database["id"]

    except Exception as e:
        logging.error(f"Error in Notion database creation: {e}")
        return None

def add_tasks_to_notion(database_id, tasks):
    """Adds extracted tasks to Notion database."""
    if not tasks:
        logging.info("No tasks to add to Notion.")
        return
    
    try:
        for task in tasks:
            notion.pages.create(
                parent={"database_id": database_id},
                properties={
                    "Task": {"title": [{"text": {"content": task}}]},
                    "Status": {"select": {"name": "To Do"}},
                },
            )
        logging.info(f"Successfully added {len(tasks)} tasks to Notion.")
    
    except Exception as e:
        logging.error(f"Error adding tasks to Notion: {e}")


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
    

def is_primary_inbox_email(service, user_id, msg_id):
    """Check if the email is in the primary inbox category."""
    try:
        # Get the full message to check its labels
        message = service.users().messages().get(userId=user_id, id=msg_id).execute()
        labels = message.get('labelIds', [])
        
        # Check if the email has CATEGORY_PERSONAL or INBOX label
        # and doesn't have CATEGORY_PROMOTIONS or CATEGORY_SOCIAL
        is_primary = ('CATEGORY_PERSONAL' in labels or 'INBOX' in labels) and \
                    'CATEGORY_PROMOTIONS' not in labels and \
                    'CATEGORY_SOCIAL' not in labels
        
        return is_primary
    except Exception as error:
        print(f"An error occurred checking labels: {error}")
        return False
    
@app.route('/api/save_attachments_drive', methods=['GET'])
def save_attachments_drive():
    creds = get_credentials()
    gmail_service = build('gmail', 'v1', credentials=creds)
    drive_service = build('drive', 'v3', credentials=creds)
    process_attachments(gmail_service, drive_service)

    return jsonify({'complete': True}), 200

@app.route('/api/scrape-linkedin', methods=['POST'])
@validate_request_data
def scrape_linkedin():
    """API endpoint to handle LinkedIn scraping requests."""
    try:
        data = request.get_json()
        email = data['email']
        password = data['password']
        job_title = data['job_title']
        location = data['location']

        # Run the scraping function
        user_data = asyncio.run(scrape_linkedin_users(email, password, job_title, location))
        document_content = f"""
## LinkedIn Search Results
#### Recomended Users List: {user_data['search_url']}"""
        document_id = store_markdown_to_gdoc(document_content, doc_title="LinkedIn Search Results")
        response = {
            "status": "success",
            "data": user_data,
            "total_results": len(user_data),
            "timestamp": datetime.now().isoformat()
        }
        
        return jsonify(response), 200

    except Exception as e:
        print(f"API error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/minutes_meet', methods=['POST'])
def minutes_of_meet():
    data = request.get_json()
    meet_data = data['meet_data']
    minutes = minutes_meet(meet_data)
    document_id = store_markdown_to_gdoc(minutes, doc_title="Minutes of Meeting")
    return jsonify({
        'status': 'success',
        'data': minutes
    }), 200

# @app.route('/api/emails', methods=['GET'])
# def get_mails():
#     try:
#         # Get Gmail service
#         service = get_gmail_service()
        
#         # Search for unread emails with primary inbox filter
#         results = service.users().messages().list(
#             userId='me',
#             q='is:unread category:primary',  # Add category:primary to filter
#             maxResults=20
#         ).execute()
        
#         messages = results.get('messages', [])
        
#         if not messages:
#             return jsonify({
#                 'status': 'success',
#                 'message': 'No unread messages found in primary inbox',
#                 'data': []
#             }), 200
            
#         # Process each message
#         emails = []
#         for message in messages:
#             # Double-check if the message is in primary inbox
#             if is_primary_inbox_email(service, 'me', message['id']):
#                 subject, content = get_email_content(service, 'me', message['id'])
#                 if subject and content:
#                     # Clean the content - remove excessive newlines and spaces
#                     content = ' '.join(content.split())
#                     emails.append({
#                         'subject': subject,
#                         'content': content,
#                         'id': message['id']
#                     })
                    
#                     # Break if we've found 10 primary inbox emails
#                     if len(emails) >= 10:
#                         break
        
#         return jsonify({
#             'status': 'success',
#             'message': f'Found {len(emails)} unread primary inbox emails',
#             'data': emails
#         }), 200

#     except HttpError as error:
#         return jsonify({
#             'status': 'error',
#             'message': str(error)
#         }), 500
    
@app.route('/api/extract_meets', methods=['GET'])
def extract_meets():
    print("Extracting meets from emails...")
    service = get_gmail_service()
    
    # Search for unread emails with primary inbox filter
    results = service.users().messages().list(
        userId='me',
        q='is:unread category:primary',  # Add category:primary to filter
        maxResults=20
    ).execute()
    
    messages = results.get('messages', [])
    
    if not messages:
        return jsonify({
            'status': 'success',
            'message': 'No unread messages found in primary inbox',
            'data': []
        }), 200
        
    # Process each message
    emails = []
    for message in messages:
        # Double-check if the message is in primary inbox
        if is_primary_inbox_email(service, 'me', message['id']):
            subject, content = get_email_content(service, 'me', message['id'])
            if subject and content:
                # Clean the content - remove excessive newlines and spaces
                content = ' '.join(content.split())
                emails.append({
                    'subject': subject,
                    'content': content,
                    'id': message['id']
                })
                
                # Break if we've found 10 primary inbox emails
                if len(emails) >= 3:
                    break
    api_key = "AIzaSyDyS3MDtriKTOr0dSSbjj6dAacbqEe2wuU"  # Replace with your Gemini API key
    results = []

    for email in emails:
        subject = email.get('subject', '')
        content = email.get('content', '')

        prompt_template = f"""
        You are an AI that extracts potential work-related meetings from emails.
        Email Subject: {subject}
        Email Content: {content}
        
        If the email describes a work-related task, return a JSON list of objects with:
        [
          {{
            "meet_title": "A short name",
            "description": "A brief description",
            "start_time": "A realistic date *only* in the date format dd/mm/yyyThh:mm or 'None'"
          }}
        ]
        If the email does not describe a meet, return an empty list. Return only the JSON no text following or preceding it.
        """
        gemini_result = llm_interface.call_gemini(prompt_template, api_key, disable_parse=True)
        if "[" in gemini_result and "]" in gemini_result:
            start = gemini_result.find("[")
            end = gemini_result.rfind("]") + 1
            result = gemini_result[start:end]
        else:
            raise ValueError("Model did not return a valid dictionary.")
        results.append({ 
            "subject": subject, 
            "content": content, 
            "meet": result 
        })

    return jsonify({
        "status": "success",
        "data": results
    }), 200
    
# @app.route('/api/extract_tasks', methods=['GET'])
# def extract_tasks():
#     # print("Extracting tasks from emails...")
#     service = get_gmail_service()
    
#     results = service.users().messages().list(
#         userId='me',
#         q='is:unread category:primary',
#         maxResults=20
#     ).execute()
    
#     messages = results.get('messages', [])
    
#     if not messages:
#         return jsonify({
#             'status': 'success',
#             'message': 'No unread messages found in primary inbox',
#             'data': []
#         }), 200
        
#     # Process each message
#     emails = []
#     for message in messages:
#         # Double-check if the message is in primary inbox
#         if is_primary_inbox_email(service, 'me', message['id']):
#             subject, content = get_email_content(service, 'me', message['id'])
#             if subject and content:
#                 # Clean the content - remove excessive newlines and spaces
#                 content = ' '.join(content.split())
#                 emails.append({
#                     'subject': subject,
#                     'content': content,
#                     'id': message['id']
#                 })
                
#                 # Break if we've found 10 primary inbox emails
#                 if len(emails) >= 3:
#                     break
#     api_key = "AIzaSyDyS3MDtriKTOr0dSSbjj6dAacbqEe2wuU"  # Replace with your Gemini API key
#     results = []

#     for email in emails:
#         subject = email.get('subject', '')
#         content = email.get('content', '')

#         prompt_template = f"""
#         You are an AI that extracts potential work-related tasks from emails.
#         Email Subject: {subject}
#         Email Content: {content}
        
#         If the email describes a work-related task, return a JSON list of objects with:
#         [
#           {{
#             "task_name": "A short name",
#             "description": "A brief description",
#             "deadline": "A realistic date *only* in the date format dd/mm/yyy or 'None'"
#           }}
#         ]
#         If the email does not describe a work-related task, return an empty list. Return only the JSON no text following or preceding it.
#         """
#         gemini_result = llm_interface.call_gemini(prompt_template, api_key, disable_parse=True)
#         if "[" in gemini_result and "]" in gemini_result:
#             start = gemini_result.find("[")
#             end = gemini_result.rfind("]") + 1
#             result = gemini_result[start:end]
#         else:
#             raise ValueError("Model did not return a valid dictionary.")
#         results.append({ 
#             "subject": subject, 
#             "content": content, 
#             "tasks": result 
#         })

#     return jsonify({
#         "status": "success",
#         "data": results
#     }), 200


@app.route('/api/send_tasks_notion', methods=['GET'])
def send_tasks_notion():
    service = get_gmail_service()
    
    results = service.users().messages().list(
        userId='me',
        q='is:unread category:primary',
        maxResults=20
    ).execute()
    
    messages = results.get('messages', [])
    
    if not messages:
        return jsonify({
            'status': 'success',
            'message': 'No unread messages found in primary inbox',
            'data': []
        }), 200
        
    # Process each message
    emails = []
    for message in messages:
        # Double-check if the message is in primary inbox
        if is_primary_inbox_email(service, 'me', message['id']):
            subject, content = get_email_content(service, 'me', message['id'])
            if subject and content:
                # Clean the content - remove excessive newlines and spaces
                content = ' '.join(content.split())
                emails.append({
                    'subject': subject,
                    'content': content,
                    'id': message['id']
                })
                
                # Break if we've found 10 primary inbox emails
                if len(emails) >= 5:
                    break
    api_key = "AIzaSyDyS3MDtriKTOr0dSSbjj6dAacbqEe2wuU"  # Replace with your Gemini API key
    results = []

    for email in emails:
        subject = email.get('subject', '')
        content = email.get('content', '')

        prompt_template = f"""
        You are an AI that extracts potential work-related tasks from emails.
        Email Subject: {subject}
        Email Content: {content}
        
        If the email describes a work-related task, return a JSON list of objects with:
        [
          {{
            "task_name": "A short name",
            "description": "A brief description",
            "deadline": "A realistic date *only* in the date format dd/mm/yyy or 'None'"
          }}
        ]
        If the email does not describe a work-related task, return an empty list. Return only the JSON no text following or preceding it.
        """
        gemini_result = llm_interface.call_gemini(prompt_template, api_key, disable_parse=True)
        if "[" in gemini_result and "]" in gemini_result:
            start = gemini_result.find("[")
            end = gemini_result.rfind("]") + 1
            result = gemini_result[start:end]
        else:
            raise ValueError("Model did not return a valid dictionary.")
        results.append({ 
            "subject": subject, 
            "content": content, 
            "tasks": result 
        })
        print(results)
        list_of_tasks = []
        import json
        parsed_tasks = json.loads(result)
        print(parsed_tasks)
        for task in parsed_tasks:

            task_name = task.get('task_name', '')
            description = task.get('description', '')
            deadline = task.get('deadline', '')
            list_of_tasks.append(f"Task: {task_name}\nDescription: {description}\nDeadline: {deadline}")

        # Get or create Notion database

        database_id = get_or_create_notion_database()
        if database_id:
            add_tasks_to_notion(database_id, list_of_tasks)
            return jsonify({
                'status': 'success',
                'message': 'Tasks added to Notion database',
                'data': list_of_tasks
            }), 200
        
@app.route('/api/send_meets_notion', methods=['GET'])
def send_meets_notion():
    service = get_gmail_service()
    
    # Search for unread emails with primary inbox filter
    results = service.users().messages().list(
        userId='me',
        q='is:unread category:primary',  # Add category:primary to filter
        maxResults=20
    ).execute()
    
    messages = results.get('messages', [])
    
    if not messages:
        return jsonify({
            'status': 'success',
            'message': 'No unread messages found in primary inbox',
            'data': []
        }), 200
        
    # Process each message
    emails = []
    for message in messages:
        # Double-check if the message is in primary inbox
        if is_primary_inbox_email(service, 'me', message['id']):
            subject, content = get_email_content(service, 'me', message['id'])
            if subject and content:
                # Clean the content - remove excessive newlines and spaces
                content = ' '.join(content.split())
                emails.append({
                    'subject': subject,
                    'content': content,
                    'id': message['id']
                })
                
                # Break if we've found 10 primary inbox emails
                if len(emails) >= 10:
                    break
    api_key = "AIzaSyDyS3MDtriKTOr0dSSbjj6dAacbqEe2wuU"  # Replace with your Gemini API key
    results = []

    for email in emails:
        subject = email.get('subject', '')
        content = email.get('content', '')

        prompt_template = f"""
        You are an AI that extracts potential work-related meetings from emails.
        Email Subject: {subject}
        Email Content: {content}
        
        If the email describes a work-related task, return a JSON list of objects with:
        [
          {{
            "meet_title": "A short name",
            "description": "A brief description",
            "start_time": "A realistic date *only* in the date format dd/mm/yyyThh:mm or 'None'"
          }}
        ]
        If the email does not describe a meet, return an empty list. Return only the JSON no text following or preceding it.
        """
        gemini_result = llm_interface.call_gemini(prompt_template, api_key, disable_parse=True)
        if "[" in gemini_result and "]" in gemini_result:
            start = gemini_result.find("[")
            end = gemini_result.rfind("]") + 1
            result = gemini_result[start:end]
        else:
            raise ValueError("Model did not return a valid dictionary.")
        results.append({ 
            "subject": subject, 
            "content": content, 
            "meet": result 
        })

        print(results)
        list_of_tasks = []
        import json
        parsed_tasks = json.loads(result)
        print(parsed_tasks)
        for task in parsed_tasks:

            task_name = task.get('meet_title', '')
            description = task.get('description', '')
            deadline = task.get('start_time', '')
            list_of_tasks.append(f"Meet: {task_name}\nDescription: {description}\nStart Time: {deadline}")

        # Get or create Notion database

        database_id = get_or_create_notion_database()
        if database_id:
            add_tasks_to_notion(database_id, list_of_tasks)
    return jsonify({
        'status': 'success',
        'message': 'Meets added to Notion database',
        'data': list_of_tasks
    }), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)