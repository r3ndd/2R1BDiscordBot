const global = require("../../global.js");
const commando = require("discord.js-commando");
const utils = require("../../utils.js");
const User = require("../../user.js");

const bot = global.bot;
const games = global.games;
const lobby = global.lobby;

class CreateCommand extends commando.Command {
	constructor (client) {
		super(client, {
			name: "create",
			group: "host",
			memberName: "create"/*,
			description: "Creates a game",
			args: [
				{
					key: "target",
					prompt: "Show a player's stats with `!stats @name`",
					type: "user"
				}
			]*/
		});
	}
	
	async run (message, args) {
		try {
		
			//Checks if in lobby
			if (message.channel.name == "lobby") {

				//Checks if unstarted game already created
				if (!lobby.starter) {
					var openGame = null;
					var inAnyGame = false;
					var author = message.author;

					//Finds the first open game channel category
					for (var i in games) {
						if (!games[i]) {
							openGame = i;
							break;
						}
					}

					//Checks if user is in any game
					for (let g in games) {
						if (games[g]) {
							if (author.id in games[g].players) {
								inAnyGame = true;
							}
						}
					}

					//If there is an open game channel category
					if (openGame && !inAnyGame) {
						var starter = new User(message.author);

						message.channel.send("Creating a game!\n" +
							"If you want to join, type `!join`\n" +
							starter.nick + " should type `!start` when all players have joined.");

						lobby.starter = starter;
						lobby.players.push(starter);
						lobby.game = openGame;
						lobby.setup = args.split(" ")[0] || "basic";
						console.log("Creating with setup " + lobby.setup);
					}
					else if (!openGame) {
						message.channel.send("There are no open game slots!");
					}
					else {
						message.channel.send("You are already in a game! You must finish that one before you create another.");
					}
				}
				else {
					message.channel.send("Cannot create a game, " + lobby.starter.showName() + " is already making a new one!");
				}
			}
			else {
				message.channel.send("You can only create a game from the lobby!")
			}
		}
		catch (e) {
			console.log(e);
		}
	}
}

module.exports = CreateCommand;