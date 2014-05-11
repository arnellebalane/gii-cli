#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var optimist = require('optimist');

optimist = optimist.boolean(['activerecord', 'a', 'form', 'f']);
optimist = optimist.string(['parent', 'p', 'table', 't']);
var args = optimist.argv;

var supported_types = ['model', 'controller'];
var directory_map = {
  'model': 'models',
  'controller': 'controllers'
};

console.log(args);

var help = '\ncommand-line version of yii framework\'s gii tool\n\n'
  + 'note : this command needs to be executed inside the "protected"\n'
  + '       directory of your yii project\n\n'
  + 'usage: gii <type> [<options>] <name> [<arguments>]\n\n'
  + 'where:\n\n'
  + '  type                       [' + supported_types.join(', ') + ']\n\n'
  + '  options\n'
  + '    [type = model]\n'
  + '      --activerecord, -a     create an ActiveRecord model\n'
  + '      --form, -f             create a FormModel model\n'
  + '      --parent, -p           set the parent class for the model\n'
  + '      --table, -t            set the corresponding database table\n'
  + '                               for the model\n'
  + '    [type = controller]\n'
  + '      --parent, -p           set the parent class for the controller\n\n'
  + '  name                       the name of the class to be generated\n\n'
  + '  arguments\n'
  + '    [type = model]           list of model attributes to be added\n'
  + '    [type = controller]      list of controller actions to be added';



var generator = {
  'directory': process.cwd(),
  'generate': function(type) {
    var files = fs.readdirSync(generator.directory);
    for (var i = 0; i < files.length; i++) {
      if (files[i] == directory_map[type]) {
        generator.directory = path.join(generator.directory, directory_map[type]);
        generator[type]();
        return true;
      }
    }
    return false;
  },
  'model': function() {
    console.log('creating model at ' + generator.directory);
  },
  'controller': function() {
    console.log('creating controller at ' + generator.directory);
  }
};



if (validate(args)) {
  if (!generator.generate(args._[0])) {
    var error = '\ncommand failed\n'
      + 'this command needs to be executed inside the "protected" directory of your yii project';

    console.log(error);
  }
} else {
  console.log(help);
}

function validate(args) {
  if (args._.length < 2) {
    return false;
  }
  for (var i = 0; i < supported_types.length; i++) {
    if (args._[0] == supported_types[i]) {
      return true;
    }
  }
  return false;
}