const global = require("../../global.js");
const commando = require("discord.js-commando");
const utils = require("../../utils.js");
const User = require("../../user.js");

const bot = global.bot;
const games = global.games;
const lobby = global.lobby;

class JoinCommand extends commando.Command {
	constructor (client) {
		super(client, {
			name: "join",
			group: "host",
			memberName: "join",
			description: "Joins the created game"
		});
	}
	
	async run (message, args) {
		if (message.channel.name == "lobby") {
			if (lobby.starter) {
				var user = new User(message.author);
				var inThisGame = false;
				var inAnyGame = false;

				lobby.players.forEach(p => {
					if (p.id == user.id)
						inThisGame = true;
				});

				for (let g in games) {
					if (games[g]) {
						if (user.id in games[g].players) {
							inAnyGame = true;
						}
					}
				}

				if (!inThisGame && !inAnyGame) {
					lobby.players.push(user);
					message.channel.send(
						user.showName() + " joined the game!\n" +
						lobby.players.length + " players total"
					);
				}
				else if (inAnyGame) {
					message.channel.send("You are already in a game! You must finish that one before you join another.");
				}
				else {
					message.channel.send("You are already in this game!");
				}
			}
			else {
				message.channel.send("There is no game to join! Create one with `!create`");
			}
		}
	}
}

module.exports = JoinCommand;