import google.generativeai as genai
from youtube_transcript_api import YouTubeTranscriptApi
import os

# Configure your Gemini API key
GOOGLE_API_KEY = "Your gemini api key"  # Replace with your actual API key
genai.configure(api_key=GOOGLE_API_KEY)

from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs

def get_youtube_transcript(youtube_url):
    """Retrieves the transcript from a YouTube video URL."""
    try:
        parsed_url = urlparse(youtube_url)
        query_params = parse_qs(parsed_url.query)

        if "v" in query_params:
            video_id = query_params["v"][0]
        elif "youtu.be" in parsed_url.netloc:
            video_id = parsed_url.path.lstrip("/")
        else:
            return "Error: Could not extract video ID from URL."

        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        transcript = " ".join([entry['text'] for entry in transcript_list])
        return transcript

    except Exception as e:
        return f"Error: Could not retrieve transcript. {e}"

def generate_detailed_summary(youtube_url):
    """Generates a detailed summary of a YouTube video using Gemini Flash."""

    model = genai.GenerativeModel('gemini-2.0-flash')  # Use Gemini Flash

    transcript = get_youtube_transcript(youtube_url)

    if "Error:" in transcript:
      return transcript #Return error message

    prompt = f"""
    Provide an extremely detailed summary of the following YouTube video transcript. Include all relevant information, code snippets, explanations of concepts, timestamps if available, and any other pertinent details.

    Transcript:
    {transcript}
    """

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error: Could not generate summary. {e}"

# Example usage:
# youtube_link = "https://youtu.be/D9W7AFeJ3kk?si=fXmPxX6i7VwClG6c" #Replace with your youtube link.
# summary = generate_detailed_summary(youtube_link)
# print(summary)