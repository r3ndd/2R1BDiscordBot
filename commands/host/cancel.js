const global = require("../../global.js");
const commando = require("discord.js-commando");
const utils = require("../../utils.js");

const lobby = global.lobby;

class CancelCommand extends commando.Command {
	constructor (client) {
		super(client, {
			name: "cancel",
			group: "host",
			memberName: "cancel",
			description: "Cancels the game lobby"
		});
	}
	
	async run (message, args) {
		try {
		
			//Checks if in lobby
			if (message.channel.name == "lobby") {
				lobby.starter = null;
				lobby.players = [];
				lobby.game = 0;

				message.channel.send("Canceled game. Type `!create` to start a new one.");
			}
		}
		catch (e) {
			console.log(e);
		}
	}
}

module.exports = CancelCommand;