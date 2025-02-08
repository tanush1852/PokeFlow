from flask import Flask, request, jsonify
from playwright.async_api import async_playwright
import asyncio
import nest_asyncio
from functools import wraps
import logging
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Apply nest_asyncio to allow nested event loops
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
    print(f"Scraping LinkedIn profiles for job title: {job_title}, location: {search_url}")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        try:
            await page.goto("https://www.linkedin.com/login")
            await page.fill("#username", email)
            await page.fill("#password", password)
            await page.click("button[type='submit']")
            await asyncio.sleep(5)  # Wait for login

            await page.goto(search_url)
            await asyncio.sleep(5)

            user_data = []
            # profiles = await page.query_selector_all(".entity-result__item")
            # print(f"Found {len(profiles)} profiles on the search page.")
            # for profile in profiles:
                # try:
                #     name_elem = await profile.query_selector(".entity-result__title-text")
                #     name = await name_elem.inner_text() if name_elem else "Unknown"
                    
                #     profile_url_elem = await profile.query_selector(".app-aware-link")
                #     profile_url = await profile_url_elem.get_attribute("href") if profile_url_elem else "N/A"
                #     print(f"Processing profile: {name} - {profile_url}")
                #     user_data.append({
                #         "user_name": name.strip(),
                #         "location": location,
                #         "linkedin_url": profile_url,
                #         "scraped_at": datetime.now().isoformat()
                #     })
                # except Exception as e:
                #     print(f"Error processing profile: {str(e)}")
                #     continue
            user_data.append({
                "op_link": search_url
            })

            return user_data

        except Exception as e:
            print(f"Scraping error: {str(e)}")
            raise
        finally:
            await browser.close()

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
    print("oaenrvuibiuebrvbaeubvbaeruv")
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