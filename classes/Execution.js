const axios = require('axios');
const chalk = require('chalk');
const Post = require('./Post');

//represents a run of the program
class Execution {
  constructor() {
    this.time = '';
    this.timeFromLast = 0;
    this.subreddit = '';
    this.numPosts = 0;
    this.allPosts = {};
    this.newPosts = {};
    this.postsOutOfTop = {};
    this.changedPosts = {};
    this.hasPrev = false;
    this.topNewPostId = '';
    this.mostChangedPostId = '';
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
    throw 'Error: Invalid reddit query';
  }
};

//determines which posts are new and sets them
Execution.prototype.getNewPosts = function (prevPosts) {
  let maxUpVotedPost = ['', 0];
  for (const [postId, post] of Object.entries(this.allPosts)) {
    if (!prevPosts[postId]) {
      this.newPosts[post.id] = post;

      if (post.upVotes > maxUpVotedPost[1]) {
        maxUpVotedPost = [post.id, post.upVotes];
      }
    }
  }
  this.topNewPostId = maxUpVotedPost[0];
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
  let maxChangedPost = ['', 0];
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

      if (
        Math.abs(post.changeInUpVotes) + Math.abs(post.changeInDownVotes) >
        maxChangedPost[1]
      ) {
        maxChangedPost = [
          post.id,
          Math.abs(post.changeInUpVotes) + Math.abs(post.changeInDownVotes),
        ];
      }
    }
  }
  this.mostChangedPostId = maxChangedPost[0];
};

//calculate the time since the last run
Execution.prototype.getTimeFromLastExe = function (prevTime) {
  this.timeFromLast = parseInt(this.time - prevTime);
};

//print the details of the current run including current time, subreddit, and time since the last run
Execution.prototype.printExeDetails = function (summary = false) {
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
  if (summary) {
    console.log(
      chalk.blue.bold('Reddit Polling Tool summary from '),
      timeString
    );
  } else {
    console.log(chalk.blue.bold('Reddit Polling Tool run at '), timeString);
  }
  console.log('Subreddit: r/', this.subreddit);
  console.log('Posts:', this.numPosts);
  console.log('\n');
};

//print the time from the last run
Execution.prototype.printTimeFromLastExe = function () {
  let tempTime = this.timeFromLast;
  const days = Math.floor(tempTime / 1000 / 60 / 60 / 24);
  tempTime -= days * 1000 * 60 * 60 * 24;
  const hours = Math.floor(tempTime / 1000 / 60 / 60);
  tempTime -= hours * 1000 * 60 * 60;
  const minutes = Math.floor(tempTime / 1000 / 60);
  tempTime -= minutes * 1000 * 60;
  const seconds = Math.floor(tempTime / 1000);

  let timeArray = [];
  if (days) {
    timeArray.push(days);
    timeArray.push('Day(s)');
  }
  if (hours) {
    timeArray.push(hours);
    timeArray.push('Hour(s)');
  }
  if (minutes) {
    timeArray.push(minutes);
    timeArray.push('Minute(s)');
  }
  if (seconds) {
    timeArray.push(seconds);
    timeArray.push('Second(s)');
  }
  if (timeArray.length) {
    timeArray.push('ago');
  }
  const timeString = timeArray.join(' ');

  console.log(chalk.blue.bold('Last run occurred:'), timeString, '\n');
};

//print new posts in order of upvotes
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

//print posts moved out of the top numPosts e.g. posts that have left the top 75 if numPosts = 75
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

//print posts with a change in vote count
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
          ? chalk.red.bold(post.changeInDownVotes.toLocaleString())
          : chalk.green.bold(post.changeInDownVotes.toLocaleString());
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

//print a summary of new posts from the last execution including the highest upvoted new post
Execution.prototype.printNewPostsSummary = function () {
  if (Object.keys(this.newPosts).length) {
    console.log(
      'Total new posts: ',
      chalk.yellow.bold(Object.keys(this.newPosts).length),
      '\n'
    );
    const topPost = this.newPosts[this.topNewPostId];
    console.log(chalk.blue.bold('The top new post was:'));
    console.log(topPost.title);
    console.log(
      'upvotes: ',
      chalk.green.bold(topPost.upVotes.toLocaleString())
    );
    console.log(
      'downvotes: ',
      chalk.red.bold(topPost.downVotes.toLocaleString()),
      '\n'
    );
  } else {
    console.log('There were no new posts', '\n');
  }
};

//print a summary of posts that left the top numPosts and display the most changed post
Execution.prototype.printOutOfTopPostsSummary = function () {
  if (Object.keys(this.postsOutOfTop).length) {
    console.log(
      `Total posts that left the top ${this.numPosts}: `,
      chalk.yellow.bold(Object.keys(this.postsOutOfTop).length),
      '\n'
    );
  } else {
    console.log(
      `There were no posts that left the top`,
      chalk.yellow.bold(this.numPosts),
      '\n'
    );
  }
};

//print a summary of posts that have a vote count change
Execution.prototype.printChangedPostsSummary = function () {
  if (Object.keys(this.changedPosts).length) {
    console.log(
      `Total posts that had a change in votes:`,
      chalk.yellow.bold(Object.keys(this.changedPosts).length),
      '\n'
    );

    const mostChangedPost = this.changedPosts[this.mostChangedPostId];
    const upVoteChange =
      mostChangedPost.changeInUpVotes > 0
        ? chalk.green.bold(mostChangedPost.changeInUpVotes.toLocaleString())
        : chalk.red.bold(mostChangedPost.changeInUpVotes.toLocaleString());
    const downVoteChange =
      mostChangedPost.changeInDownVotes > 0
        ? chalk.red.bold(mostChangedPost.changeInDownVotes.toLocaleString())
        : chalk.green.bold(mostChangedPost.changeInDownVotes.toLocaleString());

    console.log(chalk.blue.bold('The post with the high change in votes was:'));
    console.log(mostChangedPost.title);
    console.log(
      'upvotes: ',
      chalk.green.bold(mostChangedPost.upVotes.toLocaleString()),
      'change in upvotes: ',
      upVoteChange
    );
    console.log(
      'downvotes: ',
      chalk.red.bold(mostChangedPost.downVotes.toLocaleString()),
      'change in downvotes: ',
      downVoteChange,
      '\n'
    );
  } else {
    console.log(`There were no posts that left the top ${this.numPosts}`, '\n');
  }
};

module.exports = Execution;
