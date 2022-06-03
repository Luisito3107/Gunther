const chalk = require('chalk');
require('dotenv').config()
require('./src/modules/console');

const Gunther = require('./src/Gunther');

new Gunther().login()
    .catch(err => console.error(err))