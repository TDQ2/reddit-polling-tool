#! /usr/bin/env node
const { program } = require('commander');
const run = require('./commands/run');
const clear = require('./commands/clear');
const prev = require('./commands/prev');

program
  .command('run [subreddit] [numPosts]')
  .description('poll reddit posts')
  .action(run);

program.command('clear').description('clear previous run').action(clear);

program
  .command('prev')
  .description('print results of the previous run')
  .action(prev);

program.parse();
