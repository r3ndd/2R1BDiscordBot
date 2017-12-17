const global = require("../../global.js");
const commando = require("discord.js-commando");
const utils = require("../../utils.js");
const Game = require("../../game.js");
const User = require("../../user.js");

const bot = global.bot;
const games = global.games;
const lobby = global.lobby;

class StartCommand extends commando.Command {
	constructor (client) {
		super(client, {
			name: "start",
			group: "host",
			memberName: "start",
			description: "Starts the created game"
		});
	}
	
	async run (message, args) {
		if (message.channel.name == "lobby") {
			if (lobby.starter) {
				var user = new User(message.author);

				if (user.id == lobby.starter.id) {

					if (lobby.players.length >= 6) {
						try {
							message.channel.send("Starting game...\n" +
								"Everyone go join your room on the left!").then(() => {

								let gameRoom = lobby.game;
								games[gameRoom] = new Game(lobby.players, gameRoom, lobby.setup);

								lobby.starter = null;
								lobby.players = [];
								lobby.game = 0;

								games[gameRoom].init();

							});
						}
						catch (e) {
							console.log(e);
						}
					}
					else {
						message.channel.send("You need at least 6 players to start the game!")
					}
				}
				else {
					message.channel.send("Only " + lobby.starter.showName() + " can start the game!");
				}
			}
			else {
				message.channel.send("There is no game to start! Create one with `!create`");
			}
		}
	}
}

module.exports = StartCommand;