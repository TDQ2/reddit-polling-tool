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

  await currentExe.fetchPostsAndExeDetails(DEFAULT_SUBREDDIT, DEFAULT_NUMPOSTS);

  console.log('current Exe is ', currentExe);

  currentExe.postsArray.forEach((post) => {
    console.log(`${post.data.title} \nupvotes: ${post.data.ups} \n`);
  });

  console.log(chalk.blue('Program executed!'));
};

module.exports = run;
