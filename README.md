# Commit Step
A web application that encourages users to code, by using daily github commits check as a driver.
Works offline

## Getting started
Before you proceed to the game, 
* I assume you are a beginner with less than **61** github repos. __why__?
    without authentication, the application can only make at most **60** API calls / hour.
    the design method used in this web application, is to get all the repos and their
    associated commits at once. hence, failure is certain if repos are more than the API limit.

Now you may check out the [web application](https://kaytbode.github.io/commit-step/).

### Prerequisites
* You need to have a valid github account
* You have to be running the latest versions of Chrome or firefox on your machine that
supports service worker background sync. Background sync enables offline functionality, and 
for this web application, it handles the fetch request sent to github.

## Built with
* Javascript, HTML and CSS
* service worker for the offline functionality
* [indexedDB](https://github.com/jakearchibald/idb) as database to store commits.

## Author
Kayode Oluborode
