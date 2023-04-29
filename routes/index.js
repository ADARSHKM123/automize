var express = require('express');
var router = express.Router();
const puppeteer = require('puppeteer');

/* GET job application route. */
router.get('/', async function(req, res, next) {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Login to LinkedIn
    await page.goto('https://www.linkedin.com/login');
    await page.type('#username', process.env.EMAIL);
    await page.type('#password', process.env.PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    // Go to job search page 
    await page.goto('https://www.linkedin.com/jobs/search/?currentJobId=3577101544&f_LF=f_AL&keywords=React%20Developer%20Bangalore');

    // Wait for job cards to load 
    await page.waitForSelector(process.env.JOBLIST_SELECTOR, { timeout: 60000 });

    // Get all job cards on the page
    const jobCards = await page.$$(process.env.JOBLIST_SELECTOR);

    const jobs = [];
    for (let i = 0; i < jobCards.length; i++) {
      const jobCard = jobCards[i];
    
      // Retrieve job details from job card
      const jobTitle = await jobCard.$('.job-card-container__title').innerText();
      const company = await jobCard.$('.job-card-container__company-name').innerText();
      const location = await jobCard.$('.job-card-container__metadata-item').innerText();

      // Add job details to list of jobs
      jobs.push({
        jobTitle: jobTitle,
        company: company,
        location: location
      });
    }

    // Close browser    
    await browser.close(); 
    res.send(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while submitting job applications. Please try again later.');
  }
});

module.exports = router;