var fs = require('fs');
var path = require('path');

exports.booleans = [];

exports.generate = function(args) {
  var directory = 'controllers';
  var directory_path = path.join(process.cwd(), directory);
  var template_path = path.join(__dirname, '..', '..', 'templates', 'controller');

  var ls = fs.readdirSync(process.cwd());
  for (var i = 0; i < ls.length; i++) {
    if (ls[i] == directory) {
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

      console.log('\n  controller created: ' + path.relative(process.cwd(), file_path));

      return true;
    }
  }
  return false;
}

exports.help = function() {
  var help = '\n  Description: Generates a Yii controller\n\n'
    + '  Usage:\n\n'
    + '      gii controller [<options>] <name> [<actions>]\n\n'
    + '          <options>\n'
    + '            --parent <parent>, -p <parent>    sets the parent class of the model to <parent>\n\n'
    + '          <name>                              the name of the controller class\n\n'
    + '          <actions>                           list of controller actions that will also be generated'

  console.log(help);
}