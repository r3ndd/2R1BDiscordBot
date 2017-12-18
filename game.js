const global = require("./global.js");
const commando = require("discord.js-commando");
const utils = require("./utils.js");
const asy = require("async");

const bot = global.bot;
const games = global.games;

class Game {
	constructor (players, gameRoom, setup) {
		this.gameRoom = gameRoom;
		this.round = 0;
		this.leader = null;
		this.roundStart = null;
		this.players = {};
		this.numPlayers = players.length;
		this.room1 = [];
		this.room2 = [];
		this.canVote = false;
		this.hostages = {
			1: [],
			2: []
		};
		this.channels = {
			1: null,
			2: null
		};
		this.timeouts = [];
		this.gamblerWait = false;
		this.gamblerTeam = null;
		
		//Create each player object
		players.forEach(p => {
			this.players[p.id] = {
				name: p,
				votes: 0,
				vote: null,
				leader: false
			};
		});
		
		//Get the roles for the setup
		switch (setup) {
			case "someSetup":
				break;
			case "large":
				this.roles = {
					red: {
						bomber: 1
					},
					blue: {
						president: 1
					},
					grey: {}
				}
				
				this.rounds = 5;
				this.roundTimes = {
					1: 3,
					2: 3,
					3: 3,
					4: 2,
					5: 1
				};
				this.numHostages = 1;
				break;
			case "test":
				this.roles = {
					red: {
						bomber: 1
					},
					blue: {
						president: 1
					},
					grey: {}
				}
				
				this.rounds = 1;
				this.roundTimes = {
					1: 1
				};
				this.numHostages = 1;
				break;
			default:
				this.roles = {
					red: {
						bomber: 1
					},
					blue: {
						president: 1
					},
					grey: {}
				}
				
				this.rounds = 3;
				this.roundTimes = {
					1: 3,
					2: 2,
					3: 1
				};
				this.numHostages = 1;
		}
		
		//Include gambler if odd # of players
		if (players.length % 2 != 0)
			this.roles.grey = {gambler: 1};
	}
	
	init () {
		console.log("Initializing game in game room " + this.gameRoom);
		
		var guild = bot.guilds.first();
		
		//If odd, assign gambler
		var gambler;
		if (this.roles.grey.gambler) {
			let player = utils.randArrVal(Object.keys(this.players));
			this.players[player].role = "gambler";
			this.players[player].color = "grey";
			gambler = player;
		}
		
		var teamSize = Math.floor(this.numPlayers / 2);
		var tempList = Object.keys(this.players).slice();
		var redTeam = [];
		var blueTeam = [];
		
		//Remove gambler from tempList since they already have a role/color
		//and assign the gambler to a room
		if (tempList.indexOf(gambler) != -1) {
			let gambRoom = utils.random(1, 2);
			tempList.splice(tempList.indexOf(gambler), 1);
			this["room" + gambRoom].push(gambler);
			this.players[gambler].room = gambRoom;
		}
		
		//Copy the tempList that excludes the gambler
		let tempList2 = tempList.slice();
		
		//Assign the rest of the players to their colors/roles
		for (let i = 0; i < teamSize; i++) {
			let player = utils.randArrVal(tempList);
			this.players[player].color = "red";
			this.players[player].role = "vanilla";
			redTeam.push(player);
			tempList.splice(tempList.indexOf(player), 1);
			
			player = utils.randArrVal(tempList);
			this.players[player].color = "blue";
			this.players[player].role = "vanilla";
			blueTeam.push(player);
			tempList.splice(tempList.indexOf(player), 1);
		}
		
		this.players[utils.randArrVal(redTeam)].role = "bomber";
		this.players[utils.randArrVal(blueTeam)].role = "president";
		
		//Assign the rest of the players to their rooms
		for (let i = 0; i < teamSize; i++) {
			let player = utils.randArrVal(tempList2);
			this.players[player].room = 1;
			this.room1.push(player);
			tempList2.splice(tempList2.indexOf(player), 1);
			
			player = utils.randArrVal(tempList2);
			this.players[player].room = 2;
			this.room2.push(player);
			tempList2.splice(tempList2.indexOf(player), 1);
		}
		
		//Save reference to channels
		var category = guild.channels.find("name", "Game " + this.gameRoom);
		this.channels[1] = category.children.find("name", "room-1");
		this.channels[2] = category.children.find("name", "room-2");
		
		//Set Discord roles for rooms
		var rolesAdded = 0;
		for (let p in this.players) {
			let role = guild.roles.find(
				"name",
				"Game-" + this.gameRoom + " Room-" + this.players[p].room
			);
			guild.members.find("id", p).addRole(role).then(() => {
				rolesAdded++;
				
				if (rolesAdded == this.numPlayers) {
					this.nextRound();
				}
			});
		}
	}
	
	nextRound () {
		try {
			var guild = bot.guilds.first();

			this.round++;
			console.log("Starting Round " + this.round);

			this.sendAll("!clear 500", () => {

				if (this.round == 1) {
					bot.setTimeout(() => {
						this.sendAll("@here Welcome to the game!");
						
						//Send everyone their roles over dm
						let tasks = [];
						
						for (let p in this.players) {
							(function (p, g) {
								tasks.push(cb => {
									guild.members.find("id", p).sendMessage(
										"You are on the **" + g.players[p].color + "** team " +
										"and your role is **" + g.players[p].role + "**"
									).then(() => {
										console.log("Sent role to " + g.players[p].name.tag);
										cb();
									});
								});
							})(p, this);
						};
						
						asy.series(tasks, (err, res) => {
							if (err)
								console.log(err);
							
							console.log("Roles sent to players");
							this.setTimers();
						});
					}, 1000);
				}
				else { 	//Swap hostages
					let role1 = guild.roles.find(
						"name",
						"Game-" + this.gameRoom + " Room-1"
					);
					let role2 = guild.roles.find(
						"name",
						"Game-" + this.gameRoom + " Room-2"
					);

					//Swap rooms for hostages
					let tasks = [];

					this.hostages[1].forEach(h => {
						(function (h, g) {
							tasks.push(cb => {
								console.log("Adding role2 to " + g.players[h].name.tag);
								guild.members.find("id", h).addRole(role2).then(() => {
									console.log("completed");
									cb();
								});
							});
							tasks.push(cb => {
								console.log("Removing role1 from " + g.players[h].name.tag);
								guild.members.find("id", h).removeRole(role1).then(() => {
									console.log("completed");
									cb();
								});
							});
							tasks.push(cb => {
								g.players[h].room = 2;
								g.room1.splice(g.room1.indexOf(h), 1);
								g.room2.push(h);
								cb();
							});
						})(h, this);
					});

					this.hostages[2].forEach(h => {
						(function (h, g) {
							tasks.push(cb => {
								console.log("Adding role1 to " + g.players[h].name.tag);
								guild.members.find("id", h).addRole(role1).then(() => {
									console.log("completed");
									cb();
								});
							});
							tasks.push(cb => {
								console.log("Removing role2 from " + g.players[h].name.tag);
								guild.members.find("id", h).removeRole(role2).then(() => {
									console.log("completed");
									cb();
								});
							});
							tasks.push(cb => {
								g.players[h].room = 1;
								g.room2.splice(g.room2.indexOf(h), 1);
								g.room1.push(h);
								cb();
							});
						})(h, this);
					});

					asy.series(tasks, (err, res) => {
						if (err)
							console.log(err);
						
						console.log(this.room1);
						console.log(this.room2);
						
						this.hostages[1] = [];
						this.hostages[2] = [];

						if (this.round > this.rounds) { //Last round
							if ("gambler" in this.roles.grey)
								this.gamblerChoice();
							else
								this.endGame();
						}
						else {
							console.log("Managed roles, starting timers");
							this.setTimers();
						}
					});
				}
			});
		}
		catch (e) {
			console.log(e);
		}
		
	}
	
	setTimers () {
		try {
			var roundAnnounce = "";

			if (this.round != this.rounds) {
				roundAnnounce = "This is **Round " + this.round + " of " + this.rounds + "**, it will last for " + this.roundTimes[this.round] + " minutes.\n";
			}
			else {
				roundAnnounce = "This is the Final Round, it will last for " + this.roundTimes[this.round] + " minutes.\n";
			}

			this.canVote = true;

			this.sendAll(
				roundAnnounce + 
				"Use `!vote @name` to vote for a leader. Choose wisely."
				, () => {
				bot.setTimeout(() => {
					this.sendAll("30 seconds left!");
				}, this.roundTimes[this.round] * 60 * 1000 - 30 * 1000);

				bot.setTimeout(() => {
					this.canVote = false;
					this.sendAll("Time is up, voting is over!\n");

					for (let room = 1; room <= 2; room++) {
						let roomMems = this["room" + room];
						let leader = roomMems[0];
						let max = this.players[leader].votes;
						
						//Reset votes for next round
						this.players[leader].votes = 0;
						this.players[leader].vote = null;
						
						//Find player in room with most votes
						for (let i = 1; i < roomMems.length; i++) {
							if (this.players[roomMems[i]].votes > max) {
								leader = roomMems[i];
								max = this.players[leader].votes;
							}
							
							//Reset the votes for next round
							this.players[roomMems[i]].votes = 0;
							this.players[roomMems[i]].vote = null;
						}

						let leaderName = this.players[leader].name;
						this.players[leader].leader = true;
						
						console.log("Leader for room " + room + ": " + leaderName.showName());

						this.send(room, 
							"The leader is " + leaderName.showName() + " \n " +
							"<@" + leaderName.id + "> use `!hg @name` to choose " + this.numHostages + " hostages"
						);
					}
				}, this.roundTimes[this.round] * 60 * 1000);
			});
		}
		catch (e) {
			console.log(e);
		}
	}
	
	gamblerChoice () {
		this.sendAll(
			"Waiting for the **Gambler** to choose a team.\n" +
			"Use `!gam red/blue`"
		);
		this.gamblerWait = true;
	}
	
	endGame () {
		try {
			var guild = bot.guilds.first();
			
			var president, bomber, gambler, sameRoom, winMsg = "", gamblerMsg = "", pList = "";

			for (let p in this.players) {
				if (this.players[p].role == "president") {
					president = this.players[p].name;
				}
				else if (this.players[p].role == "bomber") {
					bomber = this.players[p].name;
				}
				else if (this.players[p].role == "gambler") {
					gambler = this.players[p].name;
				}
			}

			if (this.players[president.id].room == this.players[bomber.id].room) {
				sameRoom = true;
				//winMsg = "They are in the same room, **Red** team wins!";
				winMsg = "The **Red** team wins!";
			}
			else {
				sameRoom = false;
				//winMsg = "They are in different rooms, **Blue** team wins!";
				winMsg = "The **Blue** team wins!";
			}
			
			if (gambler) {
				//gamblerMsg = "**" + gambler.showName() + "**, the **Gambler**, sided with the **" + this.gamblerTeam + "** team\n";
				gamblerMsg = "The **Gambler** sided with the **" + this.gamblerTeam + "** team\n";
			}
			
			utils.openDb(db => {
				for (let p in this.players) {
					p = this.players[p];
					pList += ("**" + p.name.showName() + "** was **" + p.color + " " + p.role + "**");
					
					if (
						p.color == "red" && sameRoom ||
						p.color == "blue" && !sameRoom ||
						p.role == "gambler" && this.gamblerTeam == "red" && sameRoom ||
						p.role == "gambler" && this.gamblerTeam == "blue" && !sameRoom
					) {
						utils.addWin(db, p.name.id, p.color);
					}
					else {
						utils.addLoss(db, p.name.id, p.color);
					}
				};
			});
			
			guild.channels.find("name", "wins").send(
				"@here\n" + 
				"**========== Game Finished ==========**\n" + 
				winMsg +
				/* "The **President** was **" + president.showName() + "**\n" +
				"The **Bomber** was **" + bomber.showName() + "**\n" + */
				pList + 
				gamblerMsg
			);
			
			this.clearGame();
		}
		catch (e) {
			console.log(e);
		}
	}
	
	send (room, msg, cb) {
		try {
			if (cb)
				this.channels[room].send(msg).then(cb);
			else
				this.channels[room].send(msg);
		}
		catch (e) {
			console.log(e);
		}
	}
	
	sendAll (msg, cb) {
		try {
			if (cb) {
				this.channels[1].send(msg).then(() => {
					this.channels[2].send(msg).then(cb);
				});
			}
			else {
				this.channels[1].send(msg);
				this.channels[2].send(msg);
			}
		}
		catch (e) {
			console.log(e);
		}
	}
	
	clearGame () {
		try {
			var guild = bot.guilds.first();
			
			let role1 = guild.roles.find(
				"name",
				"Game-" + this.gameRoom + " Room-1"
			);
			let role2 = guild.roles.find(
				"name",
				"Game-" + this.gameRoom + " Room-2"
			);
			
			for (let p in this.players) {
				guild.members.find("id", p).removeRole(role1);
				guild.members.find("id", p).removeRole(role2);
			}

			games[this.gameRoom] = null;
		}
		catch (e) {
			console.log(e);
		}
	}
}

module.exports = Game;