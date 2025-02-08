from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import os.path
import pickle
import time

# Update scopes to include Google Meet API
SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/meetings.reader'
]

def get_credentials():
    """Gets valid user credentials from storage or initiates OAuth2 flow."""
    creds = None
    
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
            
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
            
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
            
    return creds

def extract_meeting_code(meet_link):
    """Extracts the meeting code from a Google Meet link."""
    return meet_link.split('/')[-1]

def get_transcript(meet_link):
    """Gets transcript for a specified Google Meet session."""
    try:
        creds = get_credentials()
        service = build('meet', 'v2', credentials=creds)
        
        meeting_code = extract_meeting_code(meet_link)
        
        # Get the meeting
        meeting = service.meetings().get(
            meetingId=meeting_code
        ).execute()
        
        # Get transcripts
        transcripts = service.meetings().recordings().transcripts().list(
            meetingId=meeting_code
        ).execute()
        
        if 'transcripts' not in transcripts:
            return "No transcript available for this meeting."
            
        # Get the latest transcript
        latest_transcript = transcripts['transcripts'][0]
        transcript_id = latest_transcript['id']
        
        # Get the actual transcript content
        transcript_content = service.meetings().recordings().transcripts().get(
            meetingId=meeting_code,
            transcriptId=transcript_id
        ).execute()
        
        # Format the transcript
        formatted_transcript = ""
        for segment in transcript_content['segments']:
            speaker = segment.get('speaker', 'Unknown Speaker')
            text = segment.get('text', '')
            start_time = segment.get('startTime', '')
            formatted_transcript += f"[{start_time}] {speaker}: {text}\n"
            
        return formatted_transcript
        
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return None

def main():
    """Main function to run the transcript generator."""
    meet_link = input("Please enter the Google Meet link: ")
    
    transcript = get_transcript(meet_link)
    
    if transcript:
        filename = f"transcript_{time.strftime('%Y%m%d_%H%M%S')}.txt"
        with open(filename, 'w') as f:
            f.write(transcript)
        print(f"Transcript saved to {filename}")
    else:
        print("Failed to generate transcript")

if __name__ == "__main__":
    main()