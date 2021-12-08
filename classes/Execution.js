const axios = require('axios');

//represents a run of the program
class Execution {
  constructor() {
    this.time = '';
    this.subreddit = '';
    this.numPosts = 0;
    //temp variable for testing
    this.postsArray = [];
    this.allPostsObj = {};
    this.newPosts = {};
    this.postsOutOfTop = {};
    this.changedPosts = {};
  }
}

//fetches posts from reddit API and stores them in order as posts array and in postsObj as a map for
Execution.prototype.fetchPostsAndExeDetails = async function (
  subreddit,
  numPosts
) {
  this.subreddit = subreddit;
  this.numPosts = numPosts;

  try {
    const { data } = await axios.get(
      `https://www.reddit.com/r/${subreddit}.json?limit=${numPosts}`
    );

    this.postsArray = data.data.children.sort(
      (post1, post2) => post2.data.ups - post1.data.ups
    );
  } catch (error) {
    console.log('error in reddit query');
    console.log(error);
  }
};

//determines which posts are new and sets them
Execution.prototype.getNewPosts = function (prevPostsObj) {};

//print the details of the current run including current time, subreddit, and time since the last run
Execution.prototype.printExeDetails = function () {};

//prints new posts
Execution.prototype.printNewPosts = function () {};

//prints posts moved out of the top numPosts e.g. posts that have left the top 75
Execution.prototype.printOutOfTopPosts = function (prevPostsObj) {};

//prints posts with a change in vote count
Execution.prototype.printchangedPosts = function () {};

module.exports = Execution;
