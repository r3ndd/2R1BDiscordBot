const global = require("../../global.js");
const commando = require("discord.js-commando");
const utils = require("../../utils.js");

const bot = global.bot;
const games = global.games;

class VoteCommand extends commando.Command {
	constructor (client) {
		super(client, {
			name: "vote",
			group: "game",
			memberName: "vote",
			description: "Votes for a player for leader",
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
			var validVote = false;
			var room, oldVote;

			if (message.channel.name.indexOf("room") == 0) {
				for (let g in games) {
					g = games[g];
					
					if (g) {
						if (player in g.players) {
							
							if (g.canVote) {
								room = g.players[player].room;

								g["room" + room].forEach(p => {
									if (p == target.id) {
										
										validVote = true;
										oldVote = g.players[player].vote;
										
										if (oldVote != p) {
											if (oldVote) {
												g.players[oldVote].votes --;

												message.channel.send(
													g.players[oldVote].name.showName() + 
													" now has " + g.players[oldVote].votes + " votes"
												);
											}

											g.players[p].votes ++;
											g.players[player].vote = p;

											message.channel.send(g.players[p].name.showName() + " now has " + g.players[p].votes + " votes");
										}
									}
								});
							}
							
							break;
						}
					}
				}

				if (!validVote) {
					message.channel.send(target.tag + " is not a valid vote!");
				}
			}
		}
		catch (e) {
			console.log(e);
		}
	}
}

module.exports = VoteCommand;