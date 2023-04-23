var express = require('express');
var router = express.Router();
const puppeteer = require('puppeteer');

/* GET job application route. */
router.get('/', async function(req, res, next) {

  try {
    const browser = await puppeteer.launch( { headless: false });
    const page = await browser.newPage();

    // Login to LinkedIn
    await page.goto('https://www.linkedin.com/login');
    await page.type('#username', process.env.EMAIL);
    await page.type('#password', process.env.PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    // Go to job search page
    await page.goto('https://www.linkedin.com/jobs/search/?currentJobId=3577101544&f_LF=f_AL&keywords=React%20Developer%20Bangalore');

    // Get all job cards on the page
    const jobCards = await page.$$('.jobs-search__results-list li');

    console.log('jobCards');
    console.log(jobCards);
    const jobs = [];
    for (let i = 0; i < jobCards.length; i++) {
      const jobCard = jobCards[i];
    
      // Retrieve job details from job card
      const jobTitle = await jobCard.$eval('.job-card-list__title', element => element.innerText);
      const company = await jobCard.$eval('.job-card-container__company-name', element => element.innerText);
      const location = await jobCard.$eval('.job-card-container__metadata-item', element => element.innerText);

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
    // res.send('Job applications submitted successfully!',jobCards);
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while submitting job applications. Please try again later.');
  }
});

module.exports = router;
