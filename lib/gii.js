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

var help = '\n  command-line version of yii framework\'s gii tool\n\n'
  + '  note : this command needs to be executed inside the "protected"\n'
  + '         directory of your yii project\n\n'
  + '  usage: gii <type> [<options>] <name> [<arguments>]\n\n'
  + '  where:\n\n'
  + '    type                       [' + supported_types.join(', ') + ']\n\n'
  + '    options\n'
  + '      [type = model]\n'
  + '        --activerecord, -a     create an ActiveRecord model\n'
  + '        --form, -f             create a FormModel model\n'
  + '        --parent, -p           set the parent class for the model\n'
  + '        --table, -t            set the corresponding database table\n'
  + '                                 for the model\n'
  + '      [type = controller]\n'
  + '        --parent, -p           set the parent class for the controller\n\n'
  + '    name                       the name of the class to be generated\n\n'
  + '    arguments\n'
  + '      [type = model]           list of model attributes to be added\n'
  + '      [type = controller]      list of controller actions to be added';

var helper = {
  'validate': function(args) {
    if (args._.length < 2) {
      return false;
    }
    for (var i = 0; i < supported_types.length; i++) {
      if (args._[0] == supported_types[i]) {
        return true;
      }
    }
    return false;
  },
  'template': function(name) {
    return path.join(__dirname, '..', 'templates', name);
  }
};



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
    console.log('\n  creating model at ' + path.relative(process.cwd(), generator.directory) + ' directory');

    var options = {
      'class': args._[1],
      'parent': 'CModel',
      'table': args._[1].toLowerCase(),
      'attributes': args._.slice(2)
    }
    var template = fs.readFileSync(helper.template('model'), 'utf8');

    template = template.replace(/\{\{class\-name\}\}/g, options.class);
    if (args.table || args.t) {
      options.table = args.table || args.t;
      template = template.replace(/\s{4}\[\/?table\]\r?\n/g, '');
      template = template.replace(/\{\{table\-name\}\}/g, options.table);
    }

    if (args.parent || args.p) {
      options.parent = args.parent || args.p;
    } else if (args.activerecord || args.a) {
      options.parent = 'CActiveRecord';
    } else if (args.form || args.f) {
      options.parent = 'CFormModel';
    }
    template = template.replace(/\{\{parent\-class\}\}/g, options.parent);

    if (args.activerecord || args.a) {
      template = template.replace(/\s{4}\[\/?model\]\r?\n/g, '');
      template = template.replace(/\s{4}\[\/?table\]\r?\n/g, '');
      template = template.replace(/\{\{table\-name\}\}/g, options.table);
    } else {
      template = template.replace(/\r?\n\s{4}\[model\](.|\r?\n)*\[\/model\]\r?\n/g, '');
      template = template.replace(/\r?\n\s{4}\[table\](.|\r?\n)*\[\/table\]\r?\n/g, '');
    }

    if (options.attributes.length) {
      for (var i = 0; i < options.attributes.length; i++) {
        options.attributes[i] = 'public $' + options.attributes[i] + ';';
      }
      template = template.replace(/\[attributes\].*\[\/attributes\]/g, options.attributes.join('\r\n    '));
    } else {
      template = template.replace(/\r?\n\s{4}\[attributes\].*\[\/attributes\]\r?\n/g, '');
    }

    var file_path = path.join(generator.directory, options.class + '.php');
    fs.writeFileSync(file_path, template, 'utf8');

    console.log('\n    new file: ' + path.relative(process.cwd(), file_path));
  },
  'controller': function() {
    console.log('creating controller at ' + generator.directory);
  }
};



if (helper.validate(args)) {
  if (!generator.generate(args._[0])) {
    var error = '\ncommand failed\n'
      + 'this command needs to be executed inside the "protected" directory of your yii project';

    console.log(error);
  }
} else {
  console.log(help);
}