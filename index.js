const global = require("./global.js");
const utils = require("./utils.js");
const bot = global.bot;
const games = global.games;

bot.registry.registerGroup("host", "Host");
bot.registry.registerGroup("game", "Game");
bot.registry.registerDefaults();
bot.registry.registerCommandsIn(__dirname + "/commands");

bot.login("Mzg5NTg0MTE3MTg1OTA0NjYw.DQ9sJQ.voTMDf0QdYlLmOpqusK4-JIw6zg");

bot.on("ready", () => {
	console.log("Bot ready");
});

bot.on("message", (message) => {
	if (message.content == "mem") {
		console.log(utils.getMember(message.author.id));
	}
});