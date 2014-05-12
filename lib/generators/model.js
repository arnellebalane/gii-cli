var fs = require('fs');
var path = require('path');

exports.booleans = ['activerecord', 'form'];
exports.status = {};

exports.generate = function(args) {
  var directory = 'models';
  var directory_path = path.join(process.cwd(), directory);
  var template_path = path.join(__dirname, '..', '..', 'templates', 'model');

  var ls = fs.readdirSync(process.cwd());
  if (ls.indexOf(directory) >= 0) {
    var options = {
      'class': args._[1],
      'parent': 'CModel',
      'table': args._[1].toLowerCase(),
      'attributes': args._.slice(2)
    }
    var template = fs.readFileSync(template_path, 'utf8');

    template = template.replace(/\{\{class\-name\}\}/g, options.class);
    if (args.table) {
      options.table = args.table;
      template = template.replace(/\s{4}\[\/?table\]\r?\n/g, '');
      template = template.replace(/\{\{table\-name\}\}/g, options.table);
    }

    if (args.parent) {
      options.parent = args.parent;
    } else if (args.activerecord) {
      options.parent = 'CActiveRecord';
    } else if (args.form) {
      options.parent = 'CFormModel';
    }
    template = template.replace(/\{\{parent\-class\}\}/g, options.parent);

    if (args.activerecord) {
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

    var file_path = path.join(directory, options.class + '.php');
    fs.writeFileSync(file_path, template, 'utf8');

    exports.status = {
      success: true,
      message: 'model created',
      file_path: file_path,
      full_message: 'model created: ' + path.relative(process.cwd(), file_path)
    };

    return true;
  }
  
  exports.status = {
    success: false,
    message: 'command failed',
    full_message: 'command failed: models directory not found'
  };

  return false;
}

exports.help = function() {
  var help = '\n  Description: Generates a Yii model\n\n'
    + '  Usage:\n\n'
    + '      gii model [<options>] <name> [<attributes>]\n\n'
    + '          <options>\n'
    + '            --activerecord       create an ActiveRecord model\n'
    + '            --form               create a FormModel model\n'
    + '            --parent <parent>    sets the parent class of the model to <parent>\n'
    + '                                     default: CModel\n'
    + '            --table <table>      sets an ActiveRecord model\'s corresponding table to <table>\n'
    + '                                     default: lowercase <name>\n\n'
    + '          <name>                 the name of the model class\n\n'
    + '          <attributes>           list of model attributes that will also be generated'

  console.log(help);
}