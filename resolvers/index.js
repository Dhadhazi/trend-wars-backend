const { merge } = require("lodash");

const Decks = require("./deckresolvers");
const Multiplayer = require("./multiplayerresolvers");

module.exports = merge(Decks, Multiplayer);
