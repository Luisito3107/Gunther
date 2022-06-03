const { execSync } = require("child_process");
execSync("cd ./lavalinkserver && java -jar Lavalink.jar", { stdio: "inherit" });