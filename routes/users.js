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

    console.log('Logged in successfully');
   
    // Go to job search page 
    await page.goto('https://www.linkedin.com/jobs/search/?currentJobId=3237761134&keywords=react%20developer%20bangalore');

    // Wait for job cards to load 
    await page.waitForSelector(process.env.JOBLIST_SELECTOR, { timeout: 60000 });

    // Get the first 10 job cards on the page
    // const jobCards = await page.$$(
    //   `${process.env.JOBLIST_SELECTOR}:nth-child(-n+10)`
    // );

    const  jobCards = await page.$$('div[data-job-id]');
    console.log('Job cards:');
    console.log(jobCards);

    const jobs = [];
    for (let i = 0; i < jobCards.length; i++) {
      const jobCard = jobCards[i];
    
      // Retrieve job details from job card
      const jobTitle = await jobCard.$eval('.job-card-list__title', element => element.innerText);
      // const company = await jobCard.$eval('.job-card-container__company-name', element => element.innerText);
      // const location = await jobCard.$eval('.job-card-container__metadata-item', element => element.innerText);

      // Add job details to list of jobs
      jobs.push({
        jobTitle: jobTitle
        // company: company,
        // location: location
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