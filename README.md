# Gunther
**An awesome and easy-to-setup Lavalink-Discord music bot based on [Laffey](https://github.com/Weeb-Devs/Laffey), plus extra functions and design.**

This bot was created in memory of [James Michael Tyler](https://en.wikipedia.org/wiki/James_Michael_Tyler), who played the role of [Gunther](https://friends.fandom.com/wiki/Gunther) on the sitcom [Friends](https://en.wikipedia.org/wiki/Friends) (my favorite show) and passed away from cancer in October 2021. However, for versatility this bot uses images of Gunter, the penguin that always accompanies the Ice King in Adventure Time ☺️

![Gunter](https://c.tenor.com/4aKNk-BWBFgAAAAC/adventure-time-penguin.gif)

This bot was created in October, 2021. Then updated to Laffey 2.0 in May-June 2022.
This is my first Github repository, so if I did something wrong or I can improve in something, please tell me!
Thanks to [Weeb-Devs](https://github.com/Weeb-Devs) for their hard work creating Laffey.

## Features

 - Play audio from multiple sources (depending on the Lavalink server configuration)
	 - *YouTube*
	 - *Bandcamp*
	 - *SoundCloud*
	 - *Twitch*
	 - *Vimeo*
	 - *Spotify (with metadata fetch)*
	 - *Deezer*
	 - *Apple Music*
	 - *HTTP URLs*
	 - *Local file (Discord attachment, metadata tags supported)*
 - Support for all Discord Activities (some may require the server to have Nitro)
	 - *YouTube Together*
	 - *Poker night*
	 - *Chess in the Park*
	 - *Checkers in the Park*
	 - *Betrayal.io*
	 - *Fishington.io*
	 - *Letter Title*
	 - *Word Snacks*
	 - *Doodle Crew*
	 - *Spellcast*
	 - *Awkword*
	 - *Putt Party*
	 - *Sketch Heads*
	 - *Ocho*
 - Fetch lyrics from Genius or KSoft
 - Auto resume play queue
 - Support for multiple filters and effects
	 - *Speed*
	 - *Pitch*
	 - *Bass boost*
	 - *Karaoke*
	 - *8D*
	 - *Nightcore*
	 - *Vaporwave*
	 - *Pop*
	 - *Soft*
	 - *Treblebass*
	 - *Vibrato*
	 - *Tremolo*
 - Nice, colorful and easy to use interface
 - Many more! See Commands section.

## Screenshots
![Play and search](https://i.ibb.co/rfJkGSp/gunther1.png)
![Lyrics](https://i.ibb.co/Dz5NBs7/gunther2.png)
![Filters](https://i.ibb.co/TrXCCQ2/gunther3.png)
![Detailed help and queue finished](https://i.ibb.co/GsLF2HV/gunther4.png)

## Commands
 - **Tools and information**
	 - `/about` - See a description about this project
	 - `/eval < code >` - Evaluate a code snippet
	 - `/help [ command ]` - Get information of all the available commands
	 - `/invite` - Gives you a link to invite this bot to other servers
	 - `/ping` - Check bot's server latency in ms
	 - `/restart [ type ]` - Restarts the core of Gunther
	 - `/sendembed < guildid > < title > < description > [ color ] [ authorname ] [ authorurl ] [ authorimageurl ] [ thumbnailurl ] [ imageurl ] [ footertext ] [ footerimageurl ] [ settimestamp ] [ preview ]` - Sends a embed (message) to one or all the servers Gunther is in
	 - `/stats [ type ]` - Get bot statitics and metrics
	 - `/youtube` - Starts a YouTube Together session
	
 - **Player commands**
	 - `/clear` - Clear the queue
	 - `/filters [ set ] [ reset ] [ all ]` - Get all filters status, set or reset them
	 - `/forceplay [ song ] [ file ]` - Force the playing of a song or a file
	 - `/grab` - Sends the current song to your direct messages
		 - `/save`
	 - `/join` - Make the bot join your voice channel
	 - /leave - Make the bot leave your voice channel
		 - `/stop`
	 - `/loop` - Loop the player
	 - `/lyrics [ title ]` - Get lyrics of a specific/current playing song
	 - `/move < from > [ to ]` - Move a song in the queue
	 - `/nowplaying` - Get details of the currently playing song
	 - `/pause` - Toggles player's pause
	 - `/play [ song ] [ file ]` - Add a song or a file to the queue
	 - `/previous` - Play previous song
	 - `/queue` - See the current track queue
	 - `/remove < position >` - Remove song from the queue
	 - `/resume` - Resume the player
	 - `/search < query >` - Search and play a specific song
	 - `/seek < time >` - Seek to a time position in the current song
	 - `/shuffle` - Shuffle the songs in the queue
	 - `/skip` - Skip the current song
		 - `/next`
	 - `/skipto < position >` - Skip to a specific song
	 - `/volume [ set ] [ reset ]` - Set/reset the volume of the player

# Installation and setup
This bot was made thinking of those who have little or no experience with these topics, I tried to make it as simple as possible.

## Requirements

 - Linux server with the following packages installed (refer to the Setup the server section)
	 - npm
	 - Node.JS, version 16.9.0 or higher
	 - pm2
	 - default-jdk
 - Credentials (refer to the Obtaining credentials section)
	 - Discord Application ID, Public Key and Bot Token.
	 - (Optional) Genius API Client Access Token/KSoft API Key
	 - Spotify Client ID and Client Secret
	 - (Optional) MongoDB URI

## Obtaning credentials

 1. Start creating a new Discord Application in their [Developers portal](https://discord.com/developers/applications).
	 - Set picture and description.
	 - Take note of the Application ID and the Public Key.
 2. From the application dashboard, create a bot.
	 - Set the icon and the username.
	 - Take of the Token.
	 - Enable Presence Intent and Message Content Intent.
 3. (Optional) Obtain a Genius API Client Access Token by creating an API Client in their [Developers portal](https://genius.com/developers).
	 - Login with your Genius account (or create one).
	 - Generate a Client Access Token and take note of it.
 4. Obtain Spotify API credentials by creating an app in their [Developers dashboard](https://developer.spotify.com/dashboard/login).
	 - Login with your Spotify account (or create one).
	 - Set the app name and description.
	 - Take note of the Client ID and the Client Secret.
 5. (Optional) Register at [MongoDB](https://www.mongodb.com/).
	 - Create a new Database User from the Database Access option in the menu. 
		 - Select Password as authentication method.
		 - Type a password or autogenerate one.
		 - Set the role to Read and write to any database.
	 - Create a new Database Deployment from the Database option in the menu.
		 - Select Shared option
		 - Select cloud provider and region, remember some choices are not free.
		 - I assume you can leave the other options as they are by default.
		 - From the database deployment panel, click "Connect".
		 - Select "Connect your application"
		 - Take note of the Mongo URI. Rember to replace `<password>` with the one you chose for the Database User.

## Setup the config.json file
Find the `config.json.example` file and fill it with all the required information, then rename it to `config.json`.

    {
      "TOKEN": "Your Discord Bot Token",
      "OWNERS": [
        "Your Discord user ID, can be more than 1"
      ],
      "MONGODB_URI": "Your MongoDB URI, can be empty",
	  "SPOTIFY_CLIENT_ID": "your Spotify Client ID",
	  "SPOTIFY_CLIENT_SECRET": "your Spotify Client Secret",
      "LYRICS_ENGINE": "There are 3 options: ksoft, genius or google. Google doesn't need any API key",
      "GENIUS_ACCESS_TOKEN": "your Genius API Access Token, can be empty depending on your engine choice.",
      "KSOFT_API_KEY": "your KSoft API key, can be empty depending on your engine choice.",
      "NODES": [
        {
          "HOST": "localhost",
          "PASSWORD": "Your node's password",
          "PORT": 443,
          "IDENTIFIER": "This is node's identifier, it's all up to you",
          "RETRY_AMOUNT": 6,
          "RETRY_DELAY": 3000,
          "SECURE": false
        }
      ],
	  "AUTO_RESUME_ENABLED": true,
      "AUTO_RESUME_DELAY": 1500,
      "DEBUG": true,
      "LOG_USAGE": false,
      "PUBLIC_IPADDR": "The server public IP address. If set to false, then use NETWORK_DEV and NETWORK_DEV_INDEX to find it.",
      "NETWORK_DEV": "If PUBLIC_IPADDR is false, the network device to get the public IP from. Check it with `ip addr` command.",
      "NETWORK_DEV_INDEX": A number, the IP index in the network device. Check it with `ip addr` command,
      "DEBUG_SERVER": "The string ID of the Discord server where the elevated commands (like /sendembed and /restart) will be available.",
      "VALID_SERVERS": [
	      "Array of Discord server IDs. If set, the bot will leave any other server but these."
      ]
    }

## Setup the server

 1. Clone this repository or download a release and extract it in the server.
 2. Open a terminal session in the repository folder.
 3. If is not installed, install JDK by running `apt install default-jdk`
 4. Install Node.JS by running `apt install nodejs`
 5. Install npm by running `apt install npm`
 6. Check the installed Node.JS version by running `node -v`
	 - If it is lower than v16.9.0, then install the n package from npm by running `npm install -g n`
	 - Run `n stable 16.9.0` to install that version of Node.JS.
	 - Close and reopen the terminal session in the same folder, then check version again with `node -v`
 7. Install lastest pm2 package by running `npm install pm2@latest -g`
 8. Run `npm install` to install all the project dependencies.
 9. Navigate to the `lavalinkserver` folder, then find the `application.yml` file. Edit it:
	 - You may want to leave everything as it is, and only change the `password` string.
	 - Only change the `port` and `address` value if neccessary. 
	 - If the address value is `0.0.0.0`, then the node host value will be `localhost`.
 10. At this point, everything should be ready to start.
	 - Test the Lavalink server with `node lavalink`. Wait to see if it starts correctly, then stop with CTRL+C.
	 - Test the Discord server with `node gunther`. Wait to see if it starts correctly, then stop with CTRL+C. You can safely ignore the node connection error, as the Lavalink server is not active.
 11. If everything is ready, start everything with `node start`. The should be fully functional now.
	 - To see your invite link, you can run `pm2 log` and look for `[INVITE]`. Once invited to a server, you can see the invite link by running the `/invite` slash command.
	 - To restart the bot (Lavalink or Discord bot server), refer to the `/restart` slash command.
	 - If you want to stop the bot:
		 - `pm2 stop lavalink` to stop only the Lavalink server
		 - `pm2 stop gunther` to stop only the Discord bot server
		 - `node stop` or `pm2 stop all` to stop both

# Disclaimer
I will not be responsible for the use that is given to the services provided by Discord, Spotify, Deezer, Apple Music, KSoft, Google, MongoDB, or any other. The use of these services is the responsibility of each user who decides to register with them.