const global = require("../../global.js");
const commando = require("discord.js-commando");
const utils = require("../../utils.js");

const bot = global.bot;
const games = global.games;

class ShowAllCommand extends commando.Command {
	constructor (client) {
		super(client, {
			name: "showall",
			group: "game",
			memberName: "showall",
			description: "Shows a player's role/color to everyone in the room",
			args: [
				{
					key: "type",
					prompt: "Choose 'color' or 'role'",
					type: "string"
				}
			],
			argsPromptLimit: 0
		});
	}
	
	async run (message, args) {
		try {
			var player = message.author.id;
			var type = args.type.toLowerCase();
			
			if (message.channel.name.indexOf("room") == 0) {
				for (let g in games) {
					g = games[g];
					
					if (g) {
						if (player in g.players) {
							if (g.players[player].role != "shyguy") {
								if (type == "color") {
									message.channel.send(
										"The color of **" + g.players[player].name.showName() + "** is **" + g.players[player].color + "**"
									);
								}
								else if (type == "role") {
									message.channel.send(
										"The role of **" + g.players[player].name.showName() + "** is **" + g.players[player].color + " " + g.players[player].role + "**"
									);
								}
								else {
									message.channel.send(
										"You must choose either `!showall color` or `!showall role`"
									);
								}
							}
						}
					}
				}
			}
		}
		catch (e) {
			console.log(e);
		}
	}
}

module.exports = ShowAllCommand;