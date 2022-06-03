const chalk = require('chalk');
require('./src/modules/console');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

let nodeVersionError = false;
let consoleIntro = "\n"+chalk.yellow('----------------------------------------------------------------------------------------------\n');
consoleIntro += chalk.cyan(
    ` ____ ____ ____ ____ ____ ____ ____ _________ ____ ____ ____ \n`+
    `||G |||U |||N |||T |||H |||E |||R |||       |||B |||O |||T ||\n`+
    `||__|||__|||__|||__|||__|||__|||__|||_______|||__|||__|||__||\n`+
    `|/__\\|/__\\|/__\\|/__\\|/__\\|/__\\|/__\\|/_______\\|/__\\|/__\\|/__\\|\n\n`
);
consoleIntro += chalk.bold.cyan(`Version: ${require('./package.json').version}\n`);
consoleIntro += chalk.yellow('----------------------------------------------------------------------------------------------\n');

if (process.versions.node.split(".")[0] < 16) nodeVersionError = true;
if (process.versions.node.split(".")[0] >= 16 && process.versions.node.split(".")[1] < 9) nodeVersionError = true;

if (nodeVersionError) {
    consoleIntro += chalk.red(`Outdated Node.js version. v16.9.0 or newer is required, you have ${process.version}\n`);
} else {
    consoleIntro += chalk.dim('Found a bug? Feel free to create a new issue at https://github.com/Luisito3107/Gunther/issues/new\n');
    consoleIntro += chalk.dim('⚠️ Make sure you have Node version 16.9.0 or newer, or you will get Object.hasOwn is not a function\n');
}

consoleIntro += chalk.cyan('----------------------------------------------------------------------------------------------\n');
console.log(consoleIntro);
delete consoleIntro;

if (!nodeVersionError) {
    delete nodeVersionError;

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
    async function startGunther() {
        console.log(chalk.cyan("Starting Lavalink server..."))
        await exec('pm2 start lavalink.js');
        await delay(6000); // Time for the Lavalink server to start

        console.log(chalk.cyan("Starting Gunther server..."))
        let { stdout, stderr } = await exec('pm2 start gunther.js');
        //console.log(stdout, stderr);
        console.log(chalk.bold.green("Done!"))
    }
    startGunther();
}