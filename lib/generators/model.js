var fs = require('fs');
var path = require('path');

module.exports = function(args) {
  var directory = 'models';
  var directory_path = path.join(process.cwd(), directory);
  var template_path = path.join(__dirname, '..', '..', 'templates', 'model');

  var ls = fs.readdirSync(process.cwd());
  for (var i = 0; i < ls.length; i++) {
    if (ls[i] == directory) {
      console.log('\n  creating model at ' + path.relative(process.cwd(), directory_path) + ' directory');

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

      var file_path = path.join(directory, options.class + '.php');
      fs.writeFileSync(file_path, template, 'utf8');

      console.log('\n    new file: ' + path.relative(process.cwd(), file_path));

      return true;
    }
  }
  return false;
}