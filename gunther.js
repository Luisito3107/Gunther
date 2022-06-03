const chalk = require('chalk');
require('dotenv').config()
require('./src/modules/console');

let nodeVersionError = false;
let consoleIntro = "\n"+chalk.cyan('----------------------------------------------------------------------------------------------\n');
consoleIntro += chalk.blue(
    ` ____ ____ ____ ____ ____ ____ ____ _________ ____ ____ ____ \n`+
    `||G |||U |||N |||T |||H |||E |||R |||       |||B |||O |||T ||\n`+
    `||__|||__|||__|||__|||__|||__|||__|||_______|||__|||__|||__||\n`+
    `|/__\\|/__\\|/__\\|/__\\|/__\\|/__\\|/__\\|/_______\\|/__\\|/__\\|/__\\|\n\n`
);
consoleIntro += chalk.blue(`Version: ${require('./package.json').version}\n`);
consoleIntro += chalk.cyan('----------------------------------------------------------------------------------------------\n');

if (process.versions.node.split(".")[0] < 16) nodeVersionError = true;
if (process.versions.node.split(".")[0] >= 16 && process.versions.node.split(".")[1] < 9) nodeVersionError = true;

if (nodeVersionError) {
    consoleIntro += chalk.red(`Outdated Node.js version. v16.9.0 or newer is required, you have ${process.version}\n`);
} else {
    consoleIntro += chalk.gray('Found a bug? Feel free to create a new issue at https://github.com/Luisito3107/Gunther/issues/new\n');
    consoleIntro += chalk.gray('⚠️ Make sure you have Node version 16.9.0 or newer, or you will get Object.hasOwn is not a function\n');
}

consoleIntro += chalk.cyan('----------------------------------------------------------------------------------------------\n');
console.log(consoleIntro);
delete consoleIntro;

if (!nodeVersionError) {
    const Gunther = require('./src/Gunther');

    new Gunther().login()
        .catch(err => console.error(err))
}