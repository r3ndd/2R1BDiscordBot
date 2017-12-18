const global = require("../../global.js");
const commando = require("discord.js-commando");
const utils = require("../../utils.js");
const User = require("../../user.js");

class StatsCommand extends commando.Command {
	constructor (client) {
		super(client, {
			name: "stats",
			group: "other",
			memberName: "stats",
			description: "Gets the stats of the given player",
			args: [
				{
					key: "target",
					prompt: "Show a player's stats with `!stats @name`",
					type: "user"
				}
			],
			argsPromptLimit: 0
		});
	}
	
	async run (message, args) {
		try {
			var target = new User(args.target);
			utils.openDb(db => {
				db.db("2r1b").collection("playerStats").find({id: target.id}).toArray((err, res) => {
					if (res.length) {
						var player = res[0];
						var wins = res[0].wins;
						var losses = res[0].losses;
						
						message.channel.send(
							"**========== Stats of " + target.showName() + " ==========**" + 
							"\nWins: " + player.wins +
							"\nLosses: " + player.losses +
							"\nTotal Win Ratio: " + (player.wins / player.losses || 0).toFixed(2) +
							"\n-----" +
							"\nBlue Wins: " + player.colors.blue.wins +
							"\nBlue Losses: " + player.colors.blue.losses +
							"\nBlue Win Ratio: " + (player.colors.blue.wins / player.colors.blue.losses || 0).toFixed(2) +
							"\n-----" +
							"\nRed Wins: " + player.colors.red.wins +
							"\nRed Losses: " + player.colors.red.losses +
							"\nRed Win Ratio: " + (player.colors.red.wins / player.colors.red.losses || 0).toFixed(2) +
							"\n-----" +
							"\nGrey Wins: " + player.colors.grey.wins +
							"\nGrey Losses: " + player.colors.grey.losses +
							"\nGrey Win Ratio: " + (player.colors.grey.wins / player.colors.grey.losses || 0).toFixed(2)
						);
					}
					else {
						message.channel.send(target.showName() + " has not played any games yet!");
					}
					
					db.close();
				});
			});
		}
		catch (e) {
			console.log(e);
		}
	}
}

module.exports = StatsCommand;