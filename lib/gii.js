#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var optimist = require('optimist');

var version = '1.1.2';

var booleans = ['help', 'version'];
var supported_commands = fs.readdirSync(path.join(__dirname, 'generators'));
supported_commands = supported_commands.map(function(command) {
  return command.split(/\./)[0];
});

optimist = optimist.boolean(booleans);
var args = optimist.argv;

function help() {
  var message = '\n  To view how to use a gii command, run the following:\n\n'
    + '      gii [command] --help\n\n'
    + '  where [command] can be one of the following:\n\n'
    + '      ' + supported_commands.join('\r\n      ');

  console.log(message);
}



if (args.help && !args._.length) {
  help();
} else if (args.version && !args._.length) {
  console.log('\n  gii-cli version: ' + version);
} else if (args._.length && supported_commands.indexOf(args._[0]) >= 0) {
  var generator = require('./generators/' + args._[0]);
  if (args.help) {
    generator.help();
  } else {
    generator.generate(process.argv);
    console.log('\n  ' + generator.status.message);
  }
} else {
  console.log('\n  Invalid Usage');
  help();
}