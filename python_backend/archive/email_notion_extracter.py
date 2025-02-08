import os
import re
import json
import base64
import logging
import google.auth
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from notion_client import Client
from dotenv import load_dotenv
from email import message_from_bytes

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    filename="email_to_notion.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

# Notion API setup
NOTION_API_KEY = os.getenv("NOTION_API_KEY")
NOTION_PAGE_ID = os.getenv("NOTION_PAGE_ID")  # The parent page where the database should be created

# Gmail API scopes
SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

def authenticate_gmail():
    """Authenticates with Gmail API and returns the service."""
    logging.info("Authenticating with Gmail API...")
    creds = None
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
            creds = flow.run_local_server(port=0)
        with open("token.json", "w") as token:
            token.write(creds.to_json())

    logging.info("Gmail authentication successful.")
    return build("gmail", "v1", credentials=creds)

def fetch_emails(service):
    """Fetches unread emails and extracts tasks."""
    logging.info("Fetching unread emails from Gmail...")
    tasks = []

    try:
        results = service.users().messages().list(userId="me", labelIds=["INBOX"], q="is:unread").execute()
        messages = results.get("messages", [])

        logging.info(f"Found {len(messages)} unread emails.")

        for msg in messages:
            msg_id = msg["id"]
            message = service.users().messages().get(userId="me", id=msg_id).execute()
            payload = message["payload"]
            headers = payload.get("headers", [])
            
            subject = next((h["value"] for h in headers if h["name"] == "Subject"), "No Subject")

            # Decode email body
            body = "No Content"
            if "parts" in payload:
                for part in payload["parts"]:
                    if part["mimeType"] == "text/plain":
                        body = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8", errors="ignore")
                        break

            # Extract tasks using regex (assuming tasks are listed with bullet points or numbered)
            task_matches = re.findall(r"(?m)^(?:-|\d+\.)\s+(.*)", body)
            if task_matches:
                tasks.extend(task_matches)
                logging.info(f"Extracted {len(task_matches)} tasks from email with subject: {subject}")
            elif "Task:" in subject:  # If task is mentioned in subject
                tasks.append(subject.replace("Task:", "").strip())
                logging.info(f"Extracted task from subject: {subject}")

    except Exception as e:
        logging.error(f"Error fetching emails: {e}")

    return tasks

# Initialize Notion client
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

if __name__ == "__main__":
    logging.info("Starting Email to Notion script...")

    gmail_service = authenticate_gmail()
    tasks = fetch_emails(gmail_service)

    if tasks:
        notion_db_id = get_or_create_notion_database()
        if notion_db_id:
            add_tasks_to_notion(notion_db_id, tasks)
    else:
        logging.info("No new tasks found in emails.")

    logging.info("Script execution completed.")
