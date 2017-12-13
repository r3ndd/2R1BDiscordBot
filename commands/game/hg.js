const global = require("../../global.js");
const commando = require("discord.js-commando");
const utils = require("../../utils.js");

const bot = global.bot;
const games = global.games;

class HgCommand extends commando.Command {
	constructor (client) {
		super(client, {
			name: "hg",
			group: "game",
			memberName: "hg",
			description: "Chooses a hostage",
			args: [
				{
					key: "user",
					prompt: "Please enter a user with @name",
					type: "user"
				}
			],
			argsPromptLimit: 0
		});
	}
	
	async run (message, args) {
		try {
			var player = message.author.id;
			var target = args.user;
			var validChoice = false;
			var room;

			if (message.channel.name.indexOf("room") == 0) {
				for (let g in games) {
					g = games[g];
					
					if (g) {
						if (player in g.players) {
							
							if (g.players[player].leader) {
								room = g.players[player].room;

								g["room" + room].forEach(p => {
									if (
										target.id == p && 
										target.id != player && 
										g.hostages[room].length < g.numHostages
									) {
										if (g.hostages[room].indexOf(target.id) == -1) {
											
											g.hostages[room].push(p);
											
											message.channel.send(g.players[p].name.showName() + " chosen as a hostage");
											
											if (g.hostages[room].length == g.numHostages) {
												g.players[player].leader = false;
												message.channel.send(
													"All hostages chosen, waiting for other room..."
												);
											}
											
											if (
												g.hostages[1].length == g.numHostages &&
												g.hostages[2].length == g.numHostages
											) {
												g.nextRound();
											}
										}
									}
									else if (target.id == p && target.id == player) {
										message.channel.send("You cannot choose yourself as a hostage!");
									}
								});
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

module.exports = HgCommand;