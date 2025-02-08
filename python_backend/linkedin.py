from flask import Flask, request, jsonify
from playwright.async_api import async_playwright
import asyncio
import nest_asyncio
from functools import wraps
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)

nest_asyncio.apply()

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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)