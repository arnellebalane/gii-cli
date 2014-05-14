var fs = require('fs');
var path = require('path');

var directory_name = 'controllers';
var template_name = 'controller';
var directory_path = path.join(process.cwd(), directory_name);
var template_path = path.join(__dirname, '..', '..', 'templates', template_name);

var flags = {
  'strings': ['parent', 'p']
};





exports.status = {};

exports.generate = function(args) {
  args = normalize(args.slice(2));
  if (validate(args)) {
    var options = {
      'class': args._[1],
      'parent': 'CController',
      'actions': args._.slice(2),
      'views': []
    };
    var template = fs.readFileSync(template_path, 'utf8');

    template = template.replace(/\{\{class\-name\}\}/g, options.class);
    if (args.parent || args.p) {
      options.parent = args.parent || args.p;
    }
    template = template.replace(/\{\{parent\-class\}\}/g, options.parent);

    if (options.actions.length) {
      var controller_views = path.join(process.cwd(), 'views', options.class.toLowerCase());
      fs.mkdirSync(controller_views);
      for (var i = 0; i < options.actions.length; i++) {
        options.views[i] = options.actions[i];
        var identifier = 'action' + options.actions[i].charAt(0).toUpperCase() + options.actions[i].substring(1);
        options.actions[i] = 'public function ' + identifier + '() {\r\n';
        options.actions[i] += '      $this->render(\'' + options.views[i] + '\');\r\n';
        options.actions[i] += '    }';
      }
      template = template.replace(/\[actions\]\[\/actions\]/g, options.actions.join('\r\n\r\n    '));
    } else {
      template = template.replace(/\r?\n\s{4}\[actions\].*\[\/actions\]\r?\n/g, '');
    }

    var file_path = path.join(directory_path, options.class + 'Controller.php');
    fs.writeFileSync(file_path, template, 'utf8');
    log('create  ' + path.relative(process.cwd(), file_path));

    if (options.views.length) {
      for (var i = 0; i < options.views.length; i++) {
        var view_path = path.join(process.cwd(), 'views', options.class.toLowerCase(), options.views[i] + '.php');
        fs.writeFileSync(view_path, '', 'utf8');
        log('create  ' + path.relative(process.cwd(), view_path));
      }
    }

    return true
  }
  return false;
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





var normalize = function(args) {
  var optimist = require('optimist')(args);
  optimist = optimist.boolean(flags.booleans || []);
  optimist = optimist.string(flags.strings || []);
  return optimist.argv;
}

var validate = function(args) {
  for (var flag in args) {
    if (flag != '_' && flag != '$0') {
      var valid = false;
      for (var key in flags) {
        if (flags[key].indexOf(flag) >= 0) {
          valid = true;
          break;
        }
      }
      if (!valid) {
        exports.status.message = 'command failed: unknown flag -- ' + flag;
        return false;
      }

      if (typeof args[flag] == 'string' && !args[flag].length) {
        exports.status.message = 'command failed: no value provided for flag -- ' + flag;
        return false;
      }
    }
  }

  var ls = fs.readdirSync(process.cwd());
  if (ls.indexOf(directory_name) == -1) {
    exports.status.message = 'command failed: controllers directory not found'
    return false;
  }

  if (args._.length < 2) {
    exports.status.message = 'command failed: controller name not provided';
    return false;
  }
  return true;
}

var log = function(message) {
  exports.status.message = exports.status.message || '';
  exports.status.message += '\r\n  ' + message;
}