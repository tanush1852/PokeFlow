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

from flask import Flask, request, jsonify
from playwright.async_api import async_playwright
import asyncio
import nest_asyncio
from functools import wraps
import logging
from datetime import datetime

load_dotenv()
# Notion API setup
NOTION_API_KEY = os.getenv("NOTION_API_KEY")
NOTION_PAGE_ID = os.getenv("NOTION_PAGE_ID")

llm_interface = LLMModelInterface()

app = Flask(__name__)

# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

notion = Client(auth=NOTION_API_KEY)

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

@app.route('/api/emails', methods=['GET'])
def get_mails():
    try:
        # Get Gmail service
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
        
        return jsonify({
            'status': 'success',
            'message': f'Found {len(emails)} unread primary inbox emails',
            'data': emails
        }), 200

    except HttpError as error:
        return jsonify({
            'status': 'error',
            'message': str(error)
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
        # print(results)
        list_of_tasks = []
        import json
        parsed_tasks = json.loads(result)
        # print(parsed_tasks)
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