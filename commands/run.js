const chalk = require('chalk');
const Execution = require('../classes/Execution');
const fs = require('fs');

const run = async (subreddit, numPosts) => {
  const DEFAULT_SUBREDDIT = 'popular';
  const DEFAULT_NUMPOSTS = 25;

  //check if save file exists
  if (!fs.existsSync('reddit.json')) {
    //if no file, create one
    fs.readFileSync('reddit.json', 'file to store execution results', {
      flag: 'wx',
    });
  }

  const currentExe = new Execution();

  //data gathering and storing
  await currentExe.fetchPostsAndExeDetails(DEFAULT_SUBREDDIT, DEFAULT_NUMPOSTS);
  currentExe.getNewPosts();

  //data printing
  currentExe.printExeDetails();
  currentExe.printNewPosts();
  //testing only
  //   console.log('currentExe is ', currentExe);
};

module.exports = run;
