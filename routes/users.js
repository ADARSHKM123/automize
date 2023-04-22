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
    await page.type('#username', 'adarshkmeethal@gmail.com');
    await page.type('#password', 'Link@1234');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    // Go to job search page
    await page.goto('https://www.linkedin.com/jobs/search/?currentJobId=3577101544&f_LF=f_AL&keywords=React%20Developer%20Bangalore');

    // Enter search query and location
    // await page.type('#keywords', 'Skill -React JS Developer');
    // await page.type('#location', 'Bangalore, India');

    // Click search button and wait for job listings to load
    // await Promise.all([
    //   page.click('button[type="submit"]'),
    //   page.waitForNavigation({ waitUntil: 'networkidle0' })
    // ]);

    // Get all job cards on the page
    const jobCards = await page.$$('.jobs-search__results-list li');

    console.log(jobCards);
    const jobs = [];
    // Iterate through job cards and apply to each one
    // for (let i = 0; i < jobCards.length; i++) {
    //   const jobCard = jobCards[i];

    //   // Click on job card and wait for job description to load
    //   await Promise.all([
    //     jobCard.click(),
    //     page.waitForNavigation({ waitUntil: 'networkidle0' })
    //   ]);

    //   // Check if apply button is available
    //   const applyButton = await page.$('.jobs-s-apply button');
    //   if (applyButton) {
    //     await Promise.all([
    //       applyButton.click(),
    //       page.waitForNavigation({ waitUntil: 'networkidle0' })
    //     ]);

    //     // Fill out application form and submit
    //     await page.type('#job-application-form input[name="applicant.name"]', 'Your Name');
    //     await page.type('#job-application-form input[name="applicant.email"]', 'youremail@example.com');
    //     await page.click('#job-application-form button[type="submit"]');

    //     // Go back to job listings page
    //     await Promise.all([
    //       page.goBack(),
    //       page.waitForNavigation({ waitUntil: 'networkidle0' })
    //     ]);
    //   } else {
    //     // Go back to job listings page if apply button is not available
    //     await page.goBack();
    //   }
    // }
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
