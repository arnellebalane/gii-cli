var fs = require('fs');
var path = require('path');

exports.status = {};
exports.flags = {
  'strings': ['parent', 'p']
};

exports.generate = function(args) {
  var directory = 'controllers';
  var directory_path = path.join(process.cwd(), directory);
  var template_path = path.join(__dirname, '..', '..', 'templates', 'controller');

  args = exports.normalize(args.slice(2));
  if (exports.validate(args)) {
    var options = {
      'class': args._[1],
      'parent': 'CController',
      'actions': args._.slice(2)
    };
    var template = fs.readFileSync(template_path, 'utf8');

    template = template.replace(/\{\{class\-name\}\}/g, options.class);
    if (args.parent || args.p) {
      options.parent = args.parent || args.p;
    }
    template = template.replace(/\{\{parent\-class\}\}/g, options.parent);

    if (options.actions.length) {
      for (var i = 0; i < options.actions.length; i++) {
        var identifier = 'action' + options.actions[i].charAt(0).toUpperCase() + options.actions[i].substring(1);
        options.actions[i] = 'public function ' + identifier + '() {\r\n\r\n    }';
      }
      template = template.replace(/\[actions\]\[\/actions\]/g, options.actions.join('\r\n\r\n    '));
    } else {
      template = template.replace(/\r?\n\s{4}\[actions\].*\[\/actions\]\r?\n/g, '');
    }

    var file_path = path.join(directory_path, options.class + 'Controller.php');
    fs.writeFileSync(file_path, template, 'utf8');

    exports.status.success = true;
    exports.status.file_path = file_path;
    exports.status.message = 'controller created: ' + path.relative(process.cwd(), file_path);
    return true
  }
  return false;
}

exports.normalize = function(args) {
  var optimist = require('optimist')(args);
  optimist = optimist.boolean(exports.flags.booleans || []);
  optimist = optimist.string(exports.flags.strings || []);
  return optimist.argv;
}

exports.validate = function(args) {
  for (var flag in args) {
    if (flag != '_' && flag != '$0') {
      var valid = false;
      for (var key in exports.flags) {
        if (exports.flags[key].indexOf(flag) >= 0) {
          valid = true;
          break;
        }
      }
      if (!valid) {
        exports.status.success = false;
        exports.status.message = 'command failed: unknown flag -- ' + flag;
        return false;
      }

      if (typeof args[flag] == 'string' && !args[flag].length) {
        exports.status.success = false;
        exports.status.message = 'command failed: no value provided for flag -- ' + flag;
        return false;
      }
    }
  }

  if (args._.length < 2) {
    exports.status.success = false;
    exports.status.message = 'command failed: controller name not provided';
    return false;
  }
  return true;
}

exports.help = function() {
  var help = '\n  Description: Generates a Yii controller\n\n'
    + '  Usage:\n\n'
    + '      gii controller [<options>] <name> [<actions>]\n\n'
    + '          <options>\n'
    + '            -p, --parent <parent>    sets the parent class of the controller to <parent>\n'
    + '                                       default: CController\n\n'
    + '          <name>                     the name of the controller class\n\n'
    + '          <actions>                  list of controller actions that will also be generated'

  console.log(help);
}