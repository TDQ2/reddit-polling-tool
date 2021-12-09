const axios = require('axios');
const chalk = require('chalk');
const Post = require('./Post');

//represents a run of the program
class Execution {
  constructor() {
    this.time = '';
    this.subreddit = '';
    this.numPosts = 0;
    this.allPosts = {};
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
  this.time = new Date();

  try {
    const { data } = await axios.get(
      `https://www.reddit.com/r/${subreddit}.json?limit=${numPosts}`
    );

    //grab post data from children key and create Post objects
    data.data.children.forEach((post) => {
      const { id, title, ups: upVotes, upvote_ratio } = post.data;
      //down votes not provided directly. calculation below
      const downVotes = Math.round(upVotes / upvote_ratio - upVotes);
      this.allPosts[post.data.id] = new Post(id, title, upVotes, downVotes);
    });
  } catch (error) {
    console.log('error in reddit query');
    console.log(error);
  }
};

//determines which posts are new and sets them
Execution.prototype.getNewPosts = function (prevPosts = {}) {
  for (const [postId, post] of Object.entries(this.allPosts)) {
    if (!prevPosts[postId]) {
      this.newPosts[post.id] = post;
    }
  }
};

//print the details of the current run including current time, subreddit, and time since the last run
Execution.prototype.printExeDetails = function () {
  const timeAmOrPm = this.time.getHours() / 12 >= 1 ? 'PM' : 'AM';
  const timeString = `${this.time.getFullYear()}-${this.time.getMonth()}-${this.time.getDate()} ${
    this.time.getHours() % 12
  }:${this.time.getMinutes()}${timeAmOrPm}`;
  console.log(
    chalk.blue.bold('Reddit Polling Tool Execution run at '),
    timeString
  );
  console.log('Subreddit: r/', this.subreddit);
  console.log('Posts:', this.numPosts);
  console.log('\n');
};

//prints new posts
Execution.prototype.printNewPosts = function () {
  if (Object.keys(this.newPosts).length) {
    console.log(chalk.blue.bold('New Posts:'));

    const newPostsArray = Object.values(this.newPosts);
    //create a shallow copy to do in-place sorting
    const sortedNewPostsArray = [...newPostsArray].sort(
      (post1, post2) => post2.upVotes - post1.upVotes
    );
    sortedNewPostsArray.forEach((post, index) => {
      console.log(`${index + 1}.`, post.title);
      console.log('upvotes: ', chalk.green.bold(post.upVotes.toLocaleString()));
      console.log(
        'downvotes: ',
        chalk.red.bold(post.downVotes.toLocaleString()),
        '\n'
      );
    });
  } else {
    console.log(chalk.blue.bold('No new posts \n'));
  }
};

//prints posts moved out of the top numPosts e.g. posts that have left the top 75
Execution.prototype.printOutOfTopPosts = function (prevPostsObj) {};

//prints posts with a change in vote count
Execution.prototype.printchangedPosts = function () {};

module.exports = Execution;
