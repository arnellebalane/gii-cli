var fs = require('fs');
var path = require('path');

var directory_name = 'models';
var template_name = 'model';
var directory_path = path.join(process.cwd(), directory_name);
var template_path = path.join(__dirname, '..', '..', 'templates', template_name);

var flags = {
  'booleans': ['activerecord', 'a', 'form', 'f'],
  'strings': ['parent', 'p', 'table', 't']
};





exports.status = {};

exports.generate = function(args) {
  args = normalize(args.slice(2));
  if (validate(args)) {
    var options = {
      'class': args._[1],
      'parent': 'CModel',
      'table': args._[1].toLowerCase(),
      'attributes': args._.slice(2)
    }
    var template = fs.readFileSync(template_path, 'utf8');

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

    var file_path = path.join(directory_path, options.class + '.php');
    fs.writeFileSync(file_path, template, 'utf8');
    log('create  ' + path.relative(process.cwd(), file_path));

    return true;
  }
  return false;
}

exports.help = function() {
  var help = '\n  Description: Generates a Yii model\n\n'
    + '  Usage:\n\n'
    + '      gii model [<options>] <name> [<attributes>]\n\n'
    + '          <options>\n'
    + '            -a, --activerecord       create an ActiveRecord model\n'
    + '            -f, --form               create a FormModel model\n'
    + '            -p, --parent <parent>    sets the parent class of the model to <parent>\n'
    + '                                       default: CModel\n'
    + '            -t, --table <table>      sets an ActiveRecord model\'s corresponding table to <table>\n'
    + '                                       default: lowercase <name>\n\n'
    + '          <name>                     the name of the model class\n\n'
    + '          <attributes>               list of model attributes that will also be generated'

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
    exports.status.message = 'command failed: models directory not found';
    return false;
  }

  if (args._.length < 2) {
    exports.status.message = 'command failed: model name not provided';
    return false;
  }
  return true;
}

var log = function(message) {
  exports.status.message = exports.status.message || '';
  exports.status.message += '\r\n  ' + message;
}