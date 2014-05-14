var fs = require('fs');
var path = require('path');

var directory_name = 'migrations';
var template_name = 'migration';
var directory_path = path.join(process.cwd(), directory_name);
var template_path = path.join(__dirname, '..', '..', 'templates', template_name);

var flags = {
  'booleans': ['safe', 's', 'timestamps', 't'],
  'strings': ['dbtable', 'd', 'parent', 'p']
};





exports.status = {};

exports.generate = function(args) {
  args = normalize(args.slice(2));
  if (validate(args)) {
    var options = {
      'timestamp': '_',
      'name': args._[1],
      'parent': 'CDbMigration',
      'attributes': args._.slice(2)
    };
    var template = fs.readFileSync(template_path, 'utf8');

    template = template.replace(/\{\{migration\-name\}\}/g, options.name);
    if (args.parent || args.p) {
      options.parent = args.parent || args.p;
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

    if (args.safe || args.s) {
      template = template.replace(/\r?\n\s{4}\[unsafe\](.|\r?\n)*\[\/unsafe\]\r?\n/g, '');
      template = template.replace(/\s{4}\[\/?safe\]\r?\n/g, '');
    } else {
      template = template.replace(/\r?\n\s{4}\[safe\](.|\r?\n)*\[\/safe\]\r?\n/g, '');
      template = template.replace(/\s{4}\[\/?unsafe\]\r?\n/g, '');
    }

    if (args.dbtable || args.d) {
      options.table = args.dbtable || args.d;
      template = template.replace(/\{\{table\-name\}\}/g, options.table);
      template = template.replace(/\s{6}\[\/?(create|drop)\-table\]\r?\n/g, '');

      if (options.attributes.length) {
        for (var i = 0; i < options.attributes.length; i++) {
          var attribute = options.attributes[i].split(':');
          options.attributes[i] = '\'' + attribute[0] + '\' => \'' + attribute[1] + '\'';
        }
        var attributes = options.attributes.join(',\r\n        ') + (args.timestamps || args.t ? ',' : '');
        template = template.replace(/\[attributes\].*\[\/attributes\]/g, attributes);
      } else {
        template = template.replace(/\s{8}\[attributes\](.|\r?\n)*\[\/attributes\]\r?\n/g, '');
      }
    } else {
      template = template.replace(/\s{6}\[create\-table\](.|\r?\n)*\[\/create\-table\]/g, '');
      template = template.replace(/\s{6}\[drop\-table\](.|\r?\n)*\[\/drop\-table\]/g, '');
    }

    if (args.timestamps || args.t) {
      template = template.replace(/\s{8}\[\/?timestamps\]\r?\n/g, '');
    } else {
      template = template.replace(/\s{8}\[timestamps\](.|\r?\n)*\[\/timestamps\]\r?\n/g, '');
    }

    var file_name = 'm' + options.timestamp + '_' + options.name + '.php';
    var file_path = path.join(directory_path, file_name);
    fs.writeFileSync(file_path, template, 'utf8');

    exports.status.success = true;
    exports.status.file_path = file_path;
    exports.status.message = 'migration created: ' + path.relative(process.cwd(), file_path);
    return true;
  }
  return false;
}

exports.help = function() {
  var message = '\n  Description: Generates a Yii migration\n\n'
    + '  Usage:\n\n'
    + '      gii migration [<options>] <name> [<columns>]\n\n'
    + '          <options>\n'
    + '            -s, --safe                        use the safe migration methods which uses transactions\n'
    + '            -t, --timestamps                  add timestamps to the migration\n'
    + '            -d, --dbtable <table>     the name of the database table to be created\n'
    + '            -p, --parent <parent>    sets the parent class of the migration to <parent>\n'
    + '                                                default: CDbMigration\n\n'
    + '          <name>                              the name of the migration\n\n'
    + '          <columns>                           list of attributes which will become the columns of the database table,\n'
    + '                                              only if the --dbtable or -d flag is set\n'
    + '                                                format: <column-name>:<data-type>';

  console.log(message);
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

  var ls = fs.readdirSync(process.cwd());
  if (ls.indexOf(directory_name) == -1) {
    exports.status.success = false;
    exports.status.message = 'command failed: migrations directory not found';
    return false;
  }

  if (args._.length < 2) {
    exports.status.success = false;
    exports.status.message = 'command failed: migration name not provided';
    return false;
  }
  return true;
}