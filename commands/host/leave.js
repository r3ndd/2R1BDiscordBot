const global = require("../../global.js");
const commando = require("discord.js-commando");
const utils = require("../../utils.js");

const lobby = global.lobby;

class LeaveCommand extends commando.Command {
	constructor (client) {
		super(client, {
			name: "leave",
			group: "host",
			memberName: "leave",
			description: "Leaves the game lobby"
		});
	}
	
	async run (message, args) {
		try {
		
			//Checks if in lobby
			if (message.channel.name == "lobby") {
				//Checks if in lobby players
				lobby.players.forEach(p => {
					if (p.id == message.author.id) {
						lobby.players.splice(lobby.players.indexOf(p), 1);
						message.channel.send(
							p.showName() + " left the game.\n" + 
							lobby.players.length + " players total"
						);
					}
				});
			}
		}
		catch (e) {
			console.log(e);
		}
	}
}

module.exports = LeaveCommand;