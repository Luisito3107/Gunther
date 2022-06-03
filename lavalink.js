const { execSync } = require("child_process");
execSync("java -jar ./lavalinkserver/Lavalink.jar", { stdio: "inherit" });