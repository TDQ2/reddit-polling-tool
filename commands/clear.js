const fs = require('fs');
const chalk = require('chalk');

const clear = () => {
  if (fs.existsSync('reddit.json')) {
    fs.writeFileSync('reddit.json', JSON.stringify({}), {
      encoding: 'utf8',
    });
    console.log(chalk.blue.bold('Previous run cleared'));
  } else {
    console.log(chalk.blue.bold('No previous runs to clear'));
  }
};

module.exports = clear;
