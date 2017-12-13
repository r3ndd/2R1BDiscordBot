const commando = require("discord.js-commando");

const bot = new commando.Client({
	commandPrefix: "!",
	unknownCommandResponse: false
});

const games = {
	1: null,
	2: null,
	3: null
};

const lobby = {
	starter: null,
	players: [],
	game: 0
};

module.exports = {
	bot: bot,
	games: games,
	lobby: lobby
};