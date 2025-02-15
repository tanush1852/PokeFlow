import time
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
import csv
import math

def initiate(url):
    chromedriver_path = ChromeDriverManager().install()
    if not chromedriver_path.endswith("chromedriver.exe"):
        chromedriver_dir = os.path.dirname(chromedriver_path)
        chromedriver_path = os.path.join(chromedriver_dir, "chromedriver.exe")

    service = Service(chromedriver_path)
    options = webdriver.ChromeOptions()
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    # options.add_experimental_option("excludeSwitches", ["enable-automation"])
    # The below feature stops chrome from flagging the browser as being controlled by and automated software, thereby allowing to bypass all bot detection
    options.add_argument('--disable-blink-features=AutomationControlled')

    options.debugger_address = "127.0.0.1:9222"
    # Disable the below feature if you actually want to show selenium working
    # options.add_argument("--headless=new")

    # Begin the driver
    driver = webdriver.Chrome(service=service, options=options)
    driver.maximize_window()
    driver.get(url)
    wait=WebDriverWait(driver,10)

    profiles=driver.find_elements(By.CLASS_NAME, "iyHucNqQzIHRHUJCcOznhcpYyQxInIUzbkkU")
    print(len(profiles))
    for profile in profiles:
        name_elem=profile.find_element(By.XPATH, '//a[@class="TYwFhGrAOkNlxnxENufwIbYSlSJAqSIcLM "]//span[@aria-hidden="true"]')
        name=name_elem.text.strip()
        print(name)
        link=profile.find_element(By.CLASS_NAME, "TYwFhGrAOkNlxnxENufwIbYSlSJAqSIcLM ").get_attribute("href")
        print(link)        

    for i in range(2,11):
        try:
            new_url=url+f'&page={i}'
            driver.get(new_url)
            time.sleep(2)
            profiles=driver.find_elements(By.CLASS_NAME, "iyHucNqQzIHRHUJCcOznhcpYyQxInIUzbkkU")
            print(len(profiles))
            for profile in profiles:
                link=profile.find_element(By.CLASS_NAME, "TYwFhGrAOkNlxnxENufwIbYSlSJAqSIcLM ").get_attribute("href")
                print(link)
        except:
            print("hagg diya bruh")

# Function to generate LinkedIn search URL for users
def generate_linkedin_search_url(job_title, location):
    base_url = "https://www.linkedin.com/search/results/people/"
    query = f"?keywords={job_title.replace(' ', '%20')}%20{location.replace(' ', '%20')}&origin=GLOBAL_SEARCH_HEADER"
    return base_url + query

# Input job title and location
job_title = input("Enter job title: ")
location = input("Enter location: ")

# Generate LinkedIn search URL
search_url = generate_linkedin_search_url(job_title, location)
initiate(search_url)