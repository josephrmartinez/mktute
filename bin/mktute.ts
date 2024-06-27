#!/usr/bin/env node

import { ArgumentParser } from "argparse"
import { description, version } from "../package.json"
import { runMktute } from '../src/index';
 
const parser = new ArgumentParser({
  description: description
});
parser.add_argument('-v', '--version', { action: 'version', version });
parser.parse_args()

runMktute()

