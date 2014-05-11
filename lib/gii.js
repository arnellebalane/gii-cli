#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var optimist = require('optimist');

optimist = optimist.boolean(['activerecord', 'a', 'form', 'f']);
optimist = optimist.string(['parent', 'p', 'table', 't']);
var args = optimist.argv;

var supported_commands = fs.readdirSync(path.join(__dirname, 'generators'));

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
} else {
  console.log(help);
}