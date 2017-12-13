const global = require("../../global.js");
const commando = require("discord.js-commando");
const utils = require("../../utils.js");

const bot = global.bot;
const games = global.games;

class ShowCommand extends commando.Command {
	constructor (client) {
		super(client, {
			name: "show",
			group: "game",
			memberName: "show",
			description: "Shows a player's role/color to others",
			args: [
				{
					key: "type",
					prompt: "Choose 'color' or 'role'",
					type: "string"
				},
				{
					key: "target",
					prompt: "Please enter a user with `!show color/role @name`",
					type: "user"
				}
			],
			argsPromptLimit: 0
		});
	}
	
	async run (message, args) {
		try {
			var guild = bot.guilds.first();
			var player = message.author.id;
			var type = args.type.toLowerCase();
			var target = args.target;
			
			if (message.channel.name.indexOf("room") == 0) {
				for (let g in games) {
					g = games[g];
					
					if (g) {
						if (player in g.players) {
							if (type == "role" || type == "color") {
								if (target.id in g.players) {
									if (g.players[target.id].room == g.players[player].room) {
										if (type == "color") {
											guild.members.find("id", target.id).sendMessage(
												"The color of **" + g.players[player].name.showName() + "** is **" + g.players[player].color + "**"
											);
										}
										else if (type == "role") {
											guild.members.find("id", target.id).sendMessage(
												"The role of **" + g.players[player].name.showName() + "** is **" + g.players[player].color + " " + g.players[player].role + "**"
											);
										}
										message.channel.send(
											g.players[player].name.showName() + " showed " + g.players[target.id].name.showName() + " their " + type
										);
									}
									else {
										message.channel.send(
											g.players[target.id].name.showName() + 
											" is not in this room"
										);
									}
								}
								else {
									message.channel.send(target.tag + " is not in this game!");
								}
							}
							else {
								message.channel.send(
									"You must choose either `!show color @name` or `!show role @name`"
								);
							}
							
							break;
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

module.exports = ShowCommand;

//pm people their roles at gamestart