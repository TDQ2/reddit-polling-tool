#! /usr/bin/env node
const { program } = require('commander');
const run = require('./commands/run');

program
  .command('run [subreddit] [numPosts]')
  .description('poll reddit posts')
  .action(run);

program.parse();
