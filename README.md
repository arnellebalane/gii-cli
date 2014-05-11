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

There are also some options which you can set to modify some properties of the generated model:

    --activerecord, -a                create an ActiveRecord model
    --form, -f                        create a FormModel model
    --parent <parent>, -p <parent>    sets the parent class of the mode to <parent>
    --table <table>, -t <table>       sets the ActiveRecord model's corresponding table to <table>

You can also pass in a list of attributes that you want the model to have. Just add the space-separated list after the name of the model.

Example:

    gii model -a -t users_table User email username password

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

There are also some options which you can set to modify some properties of the generated controller:

    --parent <parent>, -p <parent>    sets the parent class of the mode to <parent>

You can also pass in a list of actions that you want the controller to have. Just add the space-separated list after the name of the controller.

Example:

    gii controller -p MainController Users index create update delete

will generate the following controller:

    <?php

      class UsersController extends MainController {

        public function actionIndex() {

        }

        public function actionCreate() {

        }

        public function actionUpdate() {

        }

        public function actionDelete() {

        }

      }

    // end of file UsersController.php

As you can see, you don't have to include the "action" prefix as it will be automatically added by the generator.

###Coming Up
- migration generator
- CRUD generator
- more flags/options, if possible