const global = require("../../global.js");
const commando = require("discord.js-commando");
const utils = require("../../utils.js");

const bot = global.bot;
const games = global.games;

class GamCommand extends commando.Command {
	constructor (client) {
		super(client, {
			name: "gam",
			group: "game",
			memberName: "gam",
			description: "Chooses a team as Gambler"
		});
	}
	
	async run (message, args) {
		try {
			var player = message.author.id;
			var team = args.split(" ")[0];
			var validChoice = false;
			var room;

			if (message.channel.name.indexOf("room") == 0) {
				for (let g in games) {
					g = games[g];
					
					if (g) {
						if (player in g.players) {
							
							if (g.players[player].role == "gambler" && g.gamblerWait) {
								if (team == "red" || team == "blue") {
									g.gamblerTeam = team;
									g.gamblerWait = false;
									g.endGame();
								}
								else {
									message.channel.send(
										"You must do `!gam red` or `!gam blue`"
									);
								}
							}
							
							break;
						}
					}
				}
			}
		}
		catch (e) {
			
		}
	}
}

module.exports = GamCommand;