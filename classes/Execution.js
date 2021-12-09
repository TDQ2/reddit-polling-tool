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
    this.hasPrev = false;
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
Execution.prototype.getNewPosts = function (prevPosts) {
  for (const [postId, post] of Object.entries(this.allPosts)) {
    if (!prevPosts[postId]) {
      this.newPosts[post.id] = post;
    }
  }
};

//determine which posts from the previous run left the top numPosts
Execution.prototype.getOutOfTopPosts = function (prevPosts) {
  for (const [postId, post] of Object.entries(prevPosts)) {
    if (!this.allPosts[postId]) {
      this.postsOutOfTop[postId] = post;
    }
  }
};

//determine which posts from the previous run had a change in votes
Execution.prototype.getChangedPosts = function (prevPosts) {
  for (const [postId, post] of Object.entries(this.allPosts)) {
    //if the prev run has the post, and there is a change in upvotes or downvotes
    if (
      prevPosts[postId] &&
      (post.upVotes - prevPosts[postId].upVotes != 0 ||
        post.downVotes - prevPosts[postId].downVotes != 0)
    ) {
      post.calcAndSetChangeInVotes(
        prevPosts[postId].upVotes,
        prevPosts[postId].downVotes
      );
      this.changedPosts[postId] = post;
    }
  }
};

//print the details of the current run including current time, subreddit, and time since the last run
Execution.prototype.printExeDetails = function () {
  const timeAmOrPm = this.time.getHours() / 12 >= 1 ? 'PM' : 'AM';
  //formatting: add a 0 infront of minutes if it the value is less than 10
  const minutes =
    this.time.getMinutes() / 10 > 1
      ? this.time.getMinutes()
      : `0${this.time.getMinutes()}`;
  const timeString = `${this.time.getFullYear()}-${this.time.getMonth()}-${this.time.getDate()} ${
    this.time.getHours() % 12
  }:${minutes}${timeAmOrPm}`;

  console.log('\n');
  console.log(
    chalk.blue.bold('Reddit Polling Tool Execution run at '),
    timeString
  );
  console.log('Subreddit: r/', this.subreddit);
  console.log('Posts:', this.numPosts);
  console.log('\n');
};

//prints new posts in order of upvotes
Execution.prototype.printNewPosts = function () {
  if (Object.keys(this.newPosts).length) {
    console.log(chalk.blue.bold('New Posts:'));

    const newPostsArray = Object.values(this.newPosts);
    //create a shallow copy to do in-place sorting
    const sortedNewPostsArray = [...newPostsArray].sort(
      (post1, post2) => post2.upVotes - post1.upVotes
    );
    sortedNewPostsArray.forEach((post, index) => {
      console.log(`${chalk.yellow.bold(index + 1)}.`, post.title);
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

//prints posts moved out of the top numPosts e.g. posts that have left the top 75 if numPosts = 75
Execution.prototype.printOutOfTopPosts = function () {
  if (Object.keys(this.postsOutOfTop).length) {
    console.log(chalk.blue.bold(`Posts that left the top ${this.numPosts}:`));

    const outOfTopPostsArray = Object.values(this.postsOutOfTop);
    //create a shallow copy to do in-place sorting
    const sortedOutOfTopPostsArray = [...outOfTopPostsArray].sort(
      (post1, post2) => post2.upVotes - post1.upVotes
    );
    sortedOutOfTopPostsArray.forEach((post, index) => {
      console.log(`${chalk.yellow.bold(index + 1)}.`, post.title);
      console.log('upvotes: ', chalk.green.bold(post.upVotes.toLocaleString()));
      console.log(
        'downvotes: ',
        chalk.red.bold(post.downVotes.toLocaleString()),
        '\n'
      );
    });
  } else {
    console.log(chalk.blue.bold(`No posts left the top ${this.numPosts} \n`));
  }
};

//prints posts with a change in vote count
Execution.prototype.printChangedPosts = function () {
  if (Object.keys(this.changedPosts).length) {
    console.log(chalk.blue.bold(`Posts with a change in vote count:`));

    const changePostsArray = Object.values(this.changedPosts);
    //create a shallow copy to do in-place sorting
    const sortedChangePostsArray = [...changePostsArray].sort(
      (post1, post2) => post2.upVotes - post1.upVotes
    );
    sortedChangePostsArray.forEach((post, index) => {
      const upVoteChange =
        post.changeInUpVotes > 0
          ? chalk.green.bold(post.changeInUpVotes.toLocaleString())
          : chalk.red.bold(post.changeInUpVotes.toLocaleString());
      const downVoteChange =
        post.changeInDownVotes > 0
          ? chalk.green.bold(post.changeInDownVotes.toLocaleString())
          : chalk.red.bold(post.changeInDownVotes.toLocaleString());
      console.log(`${chalk.yellow.bold(index + 1)}.`, post.title);
      console.log(
        'upvotes: ',
        chalk.green.bold(post.upVotes.toLocaleString()),
        'change in upvotes: ',
        upVoteChange
      );
      console.log(
        'downvotes: ',
        chalk.red.bold(post.downVotes.toLocaleString()),
        'change in downvotes: ',
        downVoteChange,
        '\n'
      );
    });
  } else {
    console.log(chalk.blue.bold(`No posts left the top ${this.numPosts} \n`));
  }
};

module.exports = Execution;
