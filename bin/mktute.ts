import { program } from 'commander';
import { runMktute } from '../src/index';

program
  .version('1.0.9')
  .description('Generate tutorials from git diffs')
  .action(runMktute);

program.parse(process.argv);
