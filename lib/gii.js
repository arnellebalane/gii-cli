#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var optimist = require('optimist');

var booleans = ['help'];
var supported_commands = fs.readdirSync(path.join(__dirname, 'generators'));
supported_commands = supported_commands.map(function(command) {
  command = command.split(/\./)[0];
  booleans = booleans.concat(require('./generators/' + command).booleans);
  return command;
});

optimist = optimist.boolean(booleans);
var args = optimist.argv;

function valid_arguments(arguments) {
  if ((arguments.help && arguments._.length == 1)
      || arguments._.length >= 2) {
    return supported_commands.indexOf(arguments._[0]) >= 0;
  }
  return false;
}



if (valid_arguments(args)) {
  var generator = require('./generators/' + args._[0]);
  if (args.help) {
    generator.help();
  } else {
    if (!generator.generate(args)) {
      var message = '\n  Command Failed\n\n'
        + '  Make sure that you are running gii commands inside the "protected" directory of your Yii project';

      console.log(message);
    }
  }
} else {
  var message = '\n  Invalid Usage\n\n'
    + '  to view how to use a gii command, run the following:\n\n'
    + '      gii [command] --help\n\n'
    + '  where [command] can be one of the following:\n\n'
    + '      ' + supported_commands.join('\r\n      ');

  console.log(message);
}