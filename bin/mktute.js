#!/usr/bin/env node

import { program } from 'commander';
import { runMktute } from '../src/index.js';

program
  .version('1.0.6')
  .description('Generate tutorials from git diffs')
  .action(runMktute);

program.parse(process.argv);