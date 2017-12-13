const utils = require("./utils.js");

class User {
	constructor (userObj) {
		this.id = userObj.id;
		this.tag = userObj.tag;
		this.username = userObj.username;
		this.nick = utils.getMember(userObj.id).nickname;
	}
	
	showName () {
		return this.nick || this.username;
	}
}

module.exports = User;