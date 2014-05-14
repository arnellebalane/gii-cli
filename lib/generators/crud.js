var fs = require('fs');
var path = require('path');

var controller = require('./controller');
var model = require('./model');
var migration = require('./migration');

var flags = {};





exports.status = {};

exports.generate = function(args) {
  args = normalize(args.slice(2));
  if (validate(args)) {
    var controller_args = process.argv.slice(0, 2);
    controller_args.push('controller');
    controller_args.push(args._[1] + 's');
    controller_args.push('index');
    controller_args.push('show');
    controller_args.push('create');
    controller_args.push('update');
    controller_args.push('delete');

    var model_args = process.argv.slice(0, 2);
    model_args.push('model');
    model_args.push('-a');
    model_args.push(args._[1]);

    var migration_args = process.argv.slice(0, 2);
    migration_args.push('migration');
    migration_args.push('-std');
    migration_args.push(args._[1].toLowerCase());
    migration_args.push('create_' + args._[1].toLowerCase() + '_table');
    migration_args.concat(args._.slice(2));
    var attributes = args._.slice(2);
    for (var i = 0; i < attributes.length; i++) {
      migration_args.push(attributes[i]);
    }

    controller.generate(controller_args);
    model.generate(model_args);
    migration.generate(migration_args);

    exports.status.message = controller.status.message;
    exports.status.message += model.status.message;
    exports.status.message += model.status.message;
    
    return true;
  }
  return false;
}





var normalize = function(args) {
  var optimist = require('optimist')(args);
  optimist = optimist.boolean(flags.booleans || []);
  optimist = optimist.string(flags.strings || []);
  return optimist.argv;
}

var validate = function(args) {
  for (var flag in args) {
    if (flag != '_' && flag != '$0') {
      exports.status.message = 'command failed: unknown flag -- ' + flag;
      return false;
    }
  }

  if (args._.length < 2) {
    exports.status.message = 'command failed: crud resource name not provided';
    return false;
  }
  return true;
}