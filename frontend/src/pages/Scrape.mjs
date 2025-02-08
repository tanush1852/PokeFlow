import { chromium } from 'playwright';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

async function scrapeAndSave(jobTitle, location, sheetId) {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Logging into LinkedIn...');
  await page.goto('https://www.linkedin.com/login');
  await page.fill('#username', import.meta.env.VITE_LINKEDIN_EMAIL);
  await page.fill('#password', import.meta.env.VITE_LINKEDIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

  // Search for jobs
  const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(jobTitle)}&location=${encodeURIComponent(location)}`;
  await page.goto(searchUrl);
  await page.waitForSelector('.jobs-search-results__list-item');

  const jobs = await page.$$eval('.jobs-search-results__list-item', (items) =>
    items.map((job) => ({
      title: job.querySelector('.job-card-list__title')?.innerText || '',
      company: job.querySelector('.job-card-container__company-name')?.innerText || '',
      location: job.querySelector('.job-card-container__metadata-item')?.innerText || '',
      link: job.querySelector('.job-card-container__link')?.href || '',
    }))
  );

  console.log(`Found ${jobs.length} jobs.`);

  await saveToGoogleSheets(sheetId, jobs);
  await browser.close();
}

async function saveToGoogleSheets(sheetId, jobs) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'google-credentials.json', 
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  const values = jobs.map(job => [job.title, job.company, job.location, job.link]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Sheet1!A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: { values },
  });

  console.log('✅ Jobs saved to Google Sheets!');
}

// Test the function
scrapeAndSave('Frontend Developer', 'New York', 'your-sheet-id-here');
