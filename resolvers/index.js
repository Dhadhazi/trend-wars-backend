const { merge } = require("lodash");

const Decks = require("./deckresolvers");
const Multiplayer = require("./multiplayerresolvers");
const User = require("./userresolvers");
const Heads = require("./headresolver");

module.exports = merge(Decks, Multiplayer, User, Heads);
