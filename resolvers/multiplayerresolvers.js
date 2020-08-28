const { PubSub, withFilter, ApolloError } = require("apollo-server");

const GameRoomModell = require("../models/GameRoomModel");

const pubsub = new PubSub();

/*Storing game data locally instead of the DB, so when 2 even occures at the same time (timer our and players got points) 
it does count both of them in and not adding the values at the same time to the same object in the db*/
let gameRoomsLocal = {};

module.exports = {
  Query: {
    gameRooms: async () => {
      try {
        const data = await GameRoomModell.find({});
        return data;
      } catch (err) {
        new ApolloError("Unable to retrieve rooms", "GETROOMERROR");
      }
    },
    gameRoomById: async (parent, { gameId }) => {
      try {
        const data = await GameRoomModell.findOne({ gameId: gameId });
        return data;
      } catch (err) {
        new ApolloError("Unable to retrieve room", "GETROOMERROR");
      }
    },
  },
  Mutation: {
    addGameRoom: async (parent, { input }) => {
      function checkGameId(id) {
        if (gameRoomsLocal[id] === undefined) return true;
        return false;
      }
      let gameId = Math.random().toString(36).substr(4, 5).toUpperCase();
      while (checkGameId(gameId) !== true) {
        gameId = Math.random().toString(36).substr(4, 5).toUpperCase();
      }

      gameRoomsLocal[gameId] = {};
      gameRoomsLocal[gameId].gameId = gameId;
      gameRoomsLocal[gameId].answers = 0;
      gameRoomsLocal[gameId].players = [{ nick: input.creator, points: 0 }];
      gameRoomsLocal[gameId].state = -1;
      gameRoomsLocal[gameId].gameDeck = {
        name: input.gameDeck.name,
        description: input.gameDeck.description,
        dateString: input.gameDeck.dateString,
        geo: input.gameDeck.geo,
        timer: input.gameDeck.timer,
        pairs: input.gameDeck.pairs,
      };
      return gameId;
    },

    joinGameRoom: (parent, { nick, gameId }) => {
      if (gameRoomsLocal[gameId] !== undefined) {
        gameRoomsLocal[gameId].players.push({ nick, points: 0 });
        pubsub.publish("roomupdate", { GameRoom: gameRoomsLocal[gameId] });
        return gameRoomsLocal[gameId];
      }
    },

    exitGameRoom: (parent, { nick, gameId }) => {
      if (gameRoomsLocal[gameId] !== undefined) {
        console.log("somebody quit");
        gameRoomsLocal[gameId].players = gameRoomsLocal[gameId].players.filter(
          (p) => p.nick !== nick
        );
        pubsub.publish("roomupdate", { GameRoom: gameRoomsLocal[gameId] });
        return true;
      }
      return false;
    },

    /*When answer = player number, client shows results. All client MUST submit answers */
    addPlayerAnswer: (parent, { gameId, nick, winner }) => {
      if (winner) {
        gameRoomsLocal[gameId].players = gameRoomsLocal[gameId].players.map(
          (p) => {
            if (p.nick === nick) p.points++;
            return p;
          }
        );
      }
      gameRoomsLocal[gameId].answers++;

      pubsub.publish("roomupdate", { GameRoom: gameRoomsLocal[gameId] });

      return true;
    },

    /*When the room updates, answer reset. state drive the game for everybody. 
    State checks in client. Creator client changes the state*/
    changeGameRoomState: async (parent, { gameId, state }) => {
      gameRoomsLocal[gameId].answers = 0;
      gameRoomsLocal[gameId].state = state;
      pubsub.publish("roomupdate", { GameRoom: gameRoomsLocal[gameId] });
      if (
        gameRoomsLocal[gameId].state ===
        gameRoomsLocal[gameId].gameDeck.pairs.length
      ) {
        delete gameRoomsLocal[gameId];
      }
      return true;
    },
  },

  Subscription: {
    GameRoom: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(["roomupdate"]),
        (payload, variables) => {
          return variables.gameId === payload.GameRoom.gameId;
        }
      ),
    },
  },
};
