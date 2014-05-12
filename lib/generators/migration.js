var fs = require('fs');
var path = require('path');

exports.booleans = ['safe', 'timestamps'];
exports.status = {};

exports.generate = function(args) {
  var directory = 'migrations';
  var directory_path = path.join(process.cwd(), directory);
  var template_path = path.join(__dirname, '..', '..', 'templates', 'migration');

  var ls = fs.readdirSync(process.cwd());
  if (ls.indexOf(directory) >= 0) {
    var options = {
      'timestamp': '_',
      'name': args._[1],
      'parent': 'CDbMigration',
      'attributes': args._.slice(2)
    };
    var template = fs.readFileSync(template_path, 'utf8');

    template = template.replace(/\{\{migration\-name\}\}/g, options.name);
    if (args.parent) {
      options.parent = args.parent;
    }
    template = template.replace(/\{\{parent\-class\}\}/g, options.parent);

    var date = new Date();
    var year = date.getFullYear() + '';
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    options.timestamp = year.substring(2) + (month < 10 ? '0' : '') + month + (day < 10 ? '0' : '') + day + options.timestamp;
    options.timestamp += (hour < 10 ? '0' : '') + hour + (minutes < 10 ? '0' : '') + minutes + (seconds < 10 ? '0' : '') + seconds;
    template = template.replace(/\{\{migration\-timestamp\}\}/g, options.timestamp);

    if (args.safe) {
      template = template.replace(/\r?\n\s{4}\[unsafe\](.|\r?\n)*\[\/unsafe\]\r?\n/g, '');
      template = template.replace(/\s{4}\[\/?safe\]\r?\n/g, '');
    } else {
      template = template.replace(/\r?\n\s{4}\[safe\](.|\r?\n)*\[\/safe\]\r?\n/g, '');
      template = template.replace(/\s{4}\[\/?unsafe\]\r?\n/g, '');
    }

    if (args.dbtable) {
      options.table = args.dbtable;
      template = template.replace(/\{\{table\-name\}\}/g, options.table);
      template = template.replace(/\s{6}\[\/?(create|drop)\-table\]\r?\n/g, '');

      if (options.attributes.length) {
        for (var i = 0; i < options.attributes.length; i++) {
          var attribute = options.attributes[i].split(':');
          options.attributes[i] = '\'' + attribute[0] + '\' => \'' + attribute[1] + '\'';
        }
        var attributes = options.attributes.join(',\r\n        ') + (args.timestamps ? ',' : '');
        template = template.replace(/\[attributes\].*\[\/attributes\]/g, attributes);
      } else {
        template = template.replace(/\s{8}\[attributes\](.|\r?\n)*\[\/attributes\]\r?\n/g, '');
      }
    } else {
      template = template.replace(/\s{6}\[create\-table\](.|\r?\n)*\[\/create\-table\]/g, '');
      template = template.replace(/\s{6}\[drop\-table\](.|\r?\n)*\[\/drop\-table\]/g, '');
    }

    if (args.timestamps) {
      template = template.replace(/\s{8}\[\/?timestamps\]\r?\n/g, '');
    } else {
      template = template.replace(/\s{8}\[timestamps\](.|\r?\n)*\[\/timestamps\]\r?\n/g, '');
    }

    var file_name = 'm' + options.timestamp + '_' + options.name + '.php';
    var file_path = path.join(directory_path, file_name);
    fs.writeFileSync(file_path, template, 'utf8');

    exports.status = {
      success: true,
      message: 'migration created',
      file_path: file_path,
      full_message: 'migration created: ' + path.relative(process.cwd(), file_path)
    };

    return true;
  }

  exports.status = {
    success: false,
    message: 'command failed',
    full_message: 'command failed: migrations directory not found'
  };

  return false;
}

exports.help = function() {
  var message = '\n  Description: Generates a Yii migration\n\n'
    + '  Usage:\n\n'
    + '      gii migration [<options>] <name> [<columns>]\n\n'
    + '          <options>\n'
    + '            --safe               use the safe migration methods which uses transactions\n'
    + '            --dbtable <table>    the name of the database table to be created\n'
    + '            --timestamps         add timestamps to the migration\n'
    + '            --parent <parent>    sets the parent class of the migration to <parent>\n'
    + '                                     default: CDbMigration\n\n'
    + '          <name>                 the name of the migration\n\n'
    + '          <columns>              list of attributes which will become the columns of the database table,\n'
    + '                                 only if the --dbtable or -d flag is set\n'
    + '                                     format: <column-name>:<data-type>';

  console.log(message);
}