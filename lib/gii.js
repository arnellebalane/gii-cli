#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var optimist = require('optimist');

optimist = optimist.boolean(['activerecord', 'a', 'form', 'f', 'help']);
optimist = optimist.string(['parent', 'p', 'table', 't']);
var args = optimist.argv;

var supported_commands = fs.readdirSync(path.join(__dirname, 'generators'));
supported_commands = supported_commands.map(function(command) {
  return command.split(/\./)[0];
});

function valid_arguments(arguments) {
  if (arguments._.length >= 2) {
    for (var i = 0; i < supported_commands.length; i++) {
      if (arguments._[0] == supported_commands[i]) {
        return true;
      }
    }
  }
  return false;
}



if (valid_arguments(args)) {
  var generator = require('./generators/' + args._[0]);
  if (args.help) {
    generator.help();
  } else {
    generator.generate(args);
  }
} else {
  var message = '\n  Invalid Usage\n\n'
    + '  to view how to use a certain command, run the following:\n\n'
    + '      gii [command] --help\n\n'
    + '  where [command] can be one of the following:\n\n'
    + '      ' + supported_commands.join('\r\n      ');

  console.log(message);
}