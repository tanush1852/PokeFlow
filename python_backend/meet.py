import os
from openai import OpenAI
from dotenv import load_dotenv, find_dotenv

def minutes_meet(text):
    # Load environment variables
    _ = load_dotenv(find_dotenv())

    # Initialize OpenAI client
    client = OpenAI(
        api_key=os.getenv('OPENAI_API_KEY', '')
    )

    # Create chat completion
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system", 
                "content": "You are a professional technical meeting minutes writer."
            },
            {
                "role": "user", 
                "content": f"""Please create a concise meeting summary following this format:

Participants: <list of participants>
Discussed: <key discussion points>
Follow-up Actions: <action items with owners>

Provide a formal, technical summary of the meeting transcript below:

{text}

The summary should be between 200-300 words, highlighting key agreements and action items."""
            }
        ]
    )

    # Return the generated content
    return response.choices[0].message.content

def generate_meeting_minutes_from_audio(audio_file_path):
    """
    Generate meeting minutes from an audio file.
    
    Args:
        audio_file_path (str): Path to the audio file to be transcribed
    
    Returns:
        dict: A dictionary containing the transcript and meeting minutes
    """
    # Load environment variables
    _ = load_dotenv(find_dotenv())

    # Initialize OpenAI client
    client = OpenAI(
        api_key=os.getenv('OPENAI_API_KEY', '')
    )

    # Transcribe the audio file
    with open(audio_file_path, "rb") as audio_file:
        transcript_response = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )
    
    # Extract the transcript text
    transcript = transcript_response.text

    # Generate meeting minutes from the transcript
    minutes_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system", 
                "content": "You are a professional technical meeting minutes writer."
            },
            {
                "role": "user", 
                "content": f"""Please create a concise meeting summary from the following transcript:

{transcript}

Provide the summary in this format:
Participants: <list of participants>
Discussed: <key discussion points>
Follow-up Actions: <action items with owners>

The summary should be between 200-300 words, highlighting key agreements and action items."""
            }
        ]
    )

    # Return both the transcript and the generated minutes
    return {
        "transcript": transcript,
        "minutes": minutes_response.choices[0].message.content
    }