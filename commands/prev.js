const Execution = require('../classes/Execution');
const chalk = require('chalk');
const fs = require('fs');

const prev = () => {
  if (fs.existsSync('reddit.json')) {
    const prevRunData = JSON.parse(fs.readFileSync('reddit.json', 'utf8'));
    if (Object.keys(prevRunData).length) {
      const currentExe = new Execution();
      //grab properties from the previous run and store on currentExe
      for (const [key, property] of Object.entries(prevRunData.currentExe)) {
        //convert time string back into a Date
        if (key === 'time') {
          currentExe[key] = new Date(property);
        } else {
          currentExe[key] = property;
        }
      }

      //   data printing calls
      currentExe.printExeDetails();
      currentExe.printNewPosts();
      if (currentExe.hasPrev) {
        currentExe.printOutOfTopPosts();
        currentExe.printChangedPosts();
      }
    }
    //if previous run empty, print no previous
    else {
      console.log(chalk.blue.bold('No previous runs to reference'));
    }
  }
  //if no file, print no previous
  else {
    console.log(chalk.blue.bold('No previous runs to reference'));
  }
};

module.exports = prev;
