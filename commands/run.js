const chalk = require('chalk');
const Execution = require('../classes/Execution');
const fs = require('fs');

const run = async (subreddit = 'popular', numPosts = 75) => {
  //check if save file exists
  if (!fs.existsSync('reddit.json')) {
    //if not, create one with a {} to represent an empty prev run
    fs.writeFileSync('reddit.json', JSON.stringify({}), {
      encoding: 'utf8',
      flag: 'wx',
    });
  }

  const prevRunData = JSON.parse(fs.readFileSync('reddit.json', 'utf8'));

  //if there was a previous comparable (same subreddit and same numPosts) run,
  //set the previous execution to the currentExecution of the last run
  //otherwise, a blank Execution
  const prevExe =
    Object.keys(prevRunData).length &&
    prevRunData.currentExe.subreddit === subreddit &&
    prevRunData.currentExe.numPosts === numPosts
      ? prevRunData.currentExe
      : new Execution();
  // console.log('prevExe is ', prevExe);

  const currentExe = new Execution();

  //data gathering and storing calls
  await currentExe.fetchPostsAndExeDetails(subreddit, numPosts);
  //check if we need to compare against the previous run
  currentExe.getNewPosts(prevExe.allPosts);
  if (Object.keys(prevExe.allPosts).length) {
    currentExe.getOutOfTopPosts(prevExe.allPosts);
    currentExe.getChangedPosts(prevExe.allPosts);
  }

  //data printing calls
  currentExe.printExeDetails();
  currentExe.printNewPosts();
  if (Object.keys(prevExe.allPosts).length) {
    currentExe.printOutOfTopPosts();
    currentExe.printChangedPosts();
  }

  //save the current execution
  fs.writeFileSync('reddit.json', JSON.stringify({ currentExe }));
};

module.exports = run;
