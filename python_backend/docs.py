from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import markdown
import os.path
import pickle

def store_markdown_to_gdoc(markdown_text, doc_title=None, doc_id=None):
    """
    Stores markdown text in a Google Doc, either creating a new doc or updating an existing one.
    
    Args:
        markdown_text (str): The markdown text to store
        doc_title (str, optional): Title for new document. Required if doc_id is None
        doc_id (str, optional): ID of existing document to update
        
    Returns:
        str: The ID of the created/updated document
    """
    # If you modify these scopes, delete the file token.pickle
    SCOPES = ['https://www.googleapis.com/auth/documents']
    
    creds = None
    # The file token.pickle stores the user's access and refresh tokens
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
            
    # If there are no (valid) credentials available, let the user log in
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'googledrive.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    # Build the Docs API service
    service = build('docs', 'v1', credentials=creds)
    
    # Convert markdown to HTML
    html_content = markdown.markdown(markdown_text)
    
    if doc_id:
        # Update existing document
        doc = service.documents().get(documentId=doc_id).execute()
        
        # Clear existing content
        requests = [{
            'deleteContentRange': {
                'range': {
                    'startIndex': 1,
                    'endIndex': doc.get('body').get('content')[-1].get('endIndex') - 1
                }
            }
        }]
        
        service.documents().batchUpdate(
            documentId=doc_id,
            body={'requests': requests}
        ).execute()
        
    else:
        # Create new document
        if not doc_title:
            raise ValueError("doc_title is required when creating a new document")
            
        doc = service.documents().create(
            body={'title': doc_title}
        ).execute()
        doc_id = doc.get('documentId')
    
    # Insert the HTML content
    requests = [{
        'insertText': {
            'location': {
                'index': 1,
            },
            'text': markdown_text
        }
    }]
    
    # Apply text styling
    service.documents().batchUpdate(
        documentId=doc_id,
        body={'requests': requests}
    ).execute()
    
    return doc_id

# def main():
#     # Example usage
#     markdown_text = """
#     # Sample Markdown Document
    
#     This is a **bold** text and this is *italic*.
    
#     ## Subheading
    
#     - List item 1
#     - List item 2
    
#     [Link text](https://example.com)
#     """
    
#     try:
#         # Create new document
#         doc_id = store_markdown_to_gdoc(markdown_text, doc_title="My Markdown Document")
#         print(f"Created document with ID: {doc_id}")
        
#         # Update existing document
#         updated_markdown = "# Updated Content\n\nThis document has been updated."
#         store_markdown_to_gdoc(updated_markdown, doc_id=doc_id)
#         print(f"Updated document with ID: {doc_id}")
        
#     except Exception as e:
#         print(f"An error occurred: {str(e)}")

# if __name__ == '__main__':
#     main()