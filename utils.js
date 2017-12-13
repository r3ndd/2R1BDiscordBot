const global = require("./global.js");
const bot = global.bot;
const games = global.games;

var random = (min, max) => {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

var randArrVal = arr => {
	return arr[random(0, arr.length - 1)];
}

var getMember = function (id) {
	return bot.guilds.first().members.find("id", id);
};

module.exports = {
	random: random,
	randArrVal: randArrVal,
	getMember: getMember
};