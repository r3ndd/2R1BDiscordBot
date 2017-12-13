const global = require("../../global.js");
const commando = require("discord.js-commando");
const utils = require("../../utils.js");

const bot = global.bot;
const games = global.games;

class EndCommand extends commando.Command {
	constructor (client) {
		super(client, {
			name: "end",
			group: "game",
			memberName: "end",
			description: "Ends the game"
		});
	}
	
	async run (message, args) {
		try {
			var player = message.author.id;
			for (let g in games) {
				if (games[g]) {
					if (player in games[g].players) {
						games[g].clearGame();
					}
				}
			}
		}
		catch (e) {
			console.log(e);
		}
	}
}

module.exports = EndCommand;