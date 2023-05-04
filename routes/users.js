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

    await page.goto('https://www.linkedin.com/jobs/search/?currentJobId=3237761134&keywords=react%20developer%20bangalore');

    await page.waitForSelector(process.env.JOBLIST_SELECTOR, { timeout: 60000 });

    // Get the job cards on the page
    const jobCards = await page.$$('div.job-card-container');

    console.log(`Found ${jobCards.length} jobs`);

    if (jobCards.length === 0) {
      throw new Error('No job cards found on the page');
    }

    const jobs = [];
    for (let i = 0; i < jobCards.length; i++) {
      const jobCard = jobCards[i];

      const jobTitle = await jobCard.$eval('.job-card-list__title', element => element.innerText);
      const company = await jobCard.$eval('.job-card-container__company-name', element => element.innerText);
      const location = await jobCard.$eval('.job-card-container__metadata-item', element => element.innerText);
      const applyButton = await jobCard.$('.jobs-apply-button');
      
      // Click the "Apply" button to go to the job detail page
      if (applyButton) {
        await applyButton.click();
        await page.waitForNavigation();

        // Apply to the job
        const applyButton = await page.$('button.jobs-apply-button');
        if (applyButton) {
          await applyButton.click();
          console.log(`Applied to job: ${jobTitle}`);
        } else {
          console.log(`Unable to apply to job: ${jobTitle}`);
        }

        // Go back to the job search results
        await page.goBack();
        await page.waitForSelector(process.env.JOBLIST_SELECTOR, { timeout: 60000 });
      }

      // Add job details to list of jobs
      jobs.push({
        jobTitle: jobTitle,
        company: company,
        location: location
      });
    }

    // Close browser    
    // await browser.close(); 
    res.send(jobs);
    console.log(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while submitting job applications. Please try again later.');
  }
});

module.exports = router;