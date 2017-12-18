const global = require("./global.js");
const MongoClient = require("mongodb").MongoClient;
const bot = global.bot;
const games = global.games;

var random = (min, max) => {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

var randArrVal = arr => {
	return arr[random(0, arr.length - 1)];
}

var getMember = id => {
	return bot.guilds.first().members.find("id", id);
};

var openDb = cb => {
	MongoClient.connect(global.dbUrl, (err, db) => {
		if (err) {
			console.log(err);
			db.close();
		}
		else
			cb(db);
	});
};

var addWin = (db, pId, color) => {
	let colorKey = "colors." + color + ".wins";
	db.collection("playerStats").find({id: target.id}).toArray((err, res) => {
		if (err)
			db.close();
		else {
			if (res.length) {
				db.collection("playerStats").updateOne(
					{id: pId},
					{$inc: {wins: 1, [colorKey]: 1}},
					err => {
						db.close();
					}
				);
			}
			else {
				db.collection("playerStats").insertOne(
					{
						id: pId,
						wins: 1,
						losses: 0,
						colors: {
							red: {
								wins: color == "red" ? 1 : 0,
								losses: 0
							},
							blue: {
								wins: color == "blue" ? 1 : 0,
								losses: 0
							},
							grey: {
								wins: color == "grey" ? 1 : 0,
								losses: 0
							},
						}
					},
					err => {
						db.close();
					}
				);
			}
		}
	});
};

var addLoss = (db, pId, color) => {
	let colorKey = "colors." + color + ".losses";
	db.collection("playerStats").find({id: target.id}).toArray((err, res) => {
		if (err)
			db.close();
		else {
			if (res.length) {
				db.collection("playerStats").updateOne(
					{id: pId},
					{$inc: {losses: 1, [colorKey]: 1}},
					err => {
						db.close();
					}
				);
			}
			else {
				db.collection("playerStats").insertOne(
					{
						id: pId,
						wins: 0,
						losses: 1,
						colors: {
							red: {
								wins: 0,
								losses: color == "red" ? 1 : 0
							},
							blue: {
								wins: 0,
								losses: color == "blue" ? 1 : 0
							},
							grey: {
								wins: 0,
								losses: color == "grey" ? 1 : 0
							},
						}
					},
					err => {
						db.close();
					}
				);
			}
		}
	});
};

module.exports = {
	random: random,
	randArrVal: randArrVal,
	getMember: getMember,
	openDb: openDb
};