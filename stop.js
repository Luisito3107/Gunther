const chalk = require('chalk');
require('./src/modules/console');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
async function stopGunther() {
    console.log(chalk.cyan("Stopping Discord and Lavalink server..."))
    let { stdout, stderr } = await exec('pm2 stop gunther lavalink');
    console.log(chalk.bold.green("Done!"));
}
stopGunther();