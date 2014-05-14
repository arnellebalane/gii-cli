gii-cli
=======

yii framework code generation command-line tool

###Installation

Make sure that you already have `node` installed, then run the following command:

    npm install -g gii-cli

###Usage

`gii` commands must be executed in your Yii application's __protected__ directory

####Generating models

Command-line help:

    gii model --help

To generate a model called `User`, simply run:

    gii model User

And the generated model will look like:

    <?php

      class User extends CModel {
      
      }

    // end of file User.php

There are also some options which you can set to modify some properties of the model to be generated:

    -a, --activerecord       create an ActiveRecord model
    -f, --form               create a FormModel model
    -p, --parent <parent>    sets the parent class of the mode to <parent>
    -t, --table <table>      sets the ActiveRecord model's corresponding table to <table>

You can also pass in a list of attributes that you want the model to have. Just add the space-separated list after the name of the model.

Example:

    gii model -at users_table User email username password

will generate the following model:

    <?php

      class User extends CActiveRecord {

        public $email;
        public $username;
        public $password;

        public static function model($class = __CLASS__) {
          return parent::model($class);
        }

        public function tableName() {
          return 'users_table';
        }

      }

    // end of file User.php

####Generating controllers

Command-line help:

    gii controller --help

To generate a controller called `UsersController`, simply run:

    gii controller Users

The "Controller" suffix of the class name will be automatically appended. The command above will generate the following controller:

    <?php 

      class UsersController extends CController {

      }

    // end of file UsersController.php

There are also some options which you can set to modify some properties of the controller to be generated:

    -p, --parent <parent>    sets the parent class of the mode to <parent>

You can also pass in a list of actions that you want the controller to have. Just add the space-separated list after the name of the controller. A view file will also be automatically generated for each action, and the render code-snippet will be added inside each action.

Example:

    gii controller -p MainController Users index create update delete

will generate the following controller:

    <?php

      class UsersController extends MainController {

        public function actionIndex() {
          $this->render('index');
        }

        public function actionCreate() {
          $this->render('create');
        }

        public function actionUpdate() {
          $this->render('update');
        }

        public function actionDelete() {
          $this->render('delete');
        }

      }

    // end of file UsersController.php

and the following view files:

    views/users/index.php
    views/users/create.php
    views/users/update.php
    views/users/delete.php

As you can see, you don't have to include the "action" prefix to the action names as it will be automatically added by the generator.

####Generating migrations

Command-line help

    gii migration --help

To generate a migration called `create_user_table` for creating a database table called `user`, simply run:

    gii migration create_user_table

And the generated migration will look like:

    <?php

      class m{migration-timestamp}_create_user_table extends CDbMigration {

        public function up() {

        }

        public function down() {

        }

      }

    // end of migration "create_user_table"

There are also some options which you can set to modify some properties of the migration to be generated:

    -s, --safe               use the safe migration methods which uses transactions
    -d, --dbtable <table>    the name of the database table to be created
    -t, --timestamps         add timestamps to the migration
    -p, --parent <parent>    sets the parent class of the migration to <parent>

If you want to generate a migration which will create a database table, you can pass a space-separated list of table columns after the name of the migration. Each element in the list should be in the form `name:type` where `name` is the name of the column and type is its data type (e.g. pk, string, int, timestamp, etc.).

Example:

    gii migration -std user create_user_table id:pk username:string password:string

will generate the following migration:

    <?php

      class m{migration-timestamp}_create_user_table extends CDbMigration {

        public function safeUp() {
          $this->createTable('user', array(
            'id' => 'pk',
            'username' => 'string',
            'password' => 'string',
            'update_time' => 'timestamp',
            'create_time' => 'timestamp default current timestamp'
          ));
        }

        public function safeDown() {
          $this->dropTable('user');
        }

      }

    // end of migration "create_user_table"

You may now run `yiic migrate` to apply the migrations, or make modifications to the generated migration before you do that.

####Generating CRUD (scaffolding)

Command-line help:

    gii crud --help

To generate a CRUD for a `User` resource, simply run the following:

    gii crud User

and it will generate the basic files (controller, model, migration) needed to manage the `User` resource. The command above is similar to running the following three commands separately:

    gii controller Users index show create update delete
    gii model -a user User
    gii migration -std user create_user_table

You can also pass a list of attributes for the resource. These will be used in the migration for creating the database table. To do this, just append the space-separated list of attributes to the end of the command. Each attribute must be of the form `name:type` where `name` is the name of the attribute (table column) and `type` is its data type (e.g. pk, int, string, timestamp, etc.).

Example:

  gii crud User id:pk username:string password:string

is just the same as running the following commands separately:
  
  gii controller Users index show create update delete
  gii model -a user User
  gii migration -std user create_user_table id:pk username:string password:string