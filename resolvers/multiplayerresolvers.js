const { PubSub, withFilter } = require("apollo-server");

const GameRoomModell = require("../models/GameRoomModel");

const pubsub = new PubSub();

/*Storing game data locally instead of the DB, so when 2 even occures at the same time (timer our and players got points) 
it does count both of them in and not adding the values at the same time to the same object in the db*/
let gameRoomsLocal = {};

module.exports = {
  Mutation: {
    //Creates a game locally as an object in the gameRoomsLocal
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
      gameRoomsLocal[gameId].creator = input.creator;
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

    /*checks if the nick already exists int he game room or the room is full. 
    Sends back 0 if room doesn't exist,  1 if nick exists, 2 if game is full, 3 if all ok*/
    nickExistsOrFullCheck: (parent, { nick, gameId }) => {
      if (gameRoomsLocal[gameId] !== undefined) {
        const nickCheck = gameRoomsLocal[gameId].players.filter(
          (p) => p.nick === nick
        );

        if (nickCheck.length > 0) return 1;
        if (gameRoomsLocal[gameId].players.length >= 5) return 2;
        return 3;
      } else {
        return 0;
      }
    },

    //The mutation to join the game if it exists
    joinGameRoom: (parent, { nick, gameId }) => {
      if (gameRoomsLocal[gameId] !== undefined) {
        gameRoomsLocal[gameId].players.push({ nick, points: 0 });
        pubsub.publish("roomupdate", { GameRoom: gameRoomsLocal[gameId] });
        return gameRoomsLocal[gameId];
      }
    },

    //When a player quits it kicks him out of the game
    exitGameRoom: (parent, { nick, gameId }) => {
      if (gameRoomsLocal[gameId] !== undefined) {
        if (nick === gameRoomsLocal[gameId].creator) {
          gameRoomsLocal[gameId].state = -2;

          setTimeout(() => {
            delete gameRoomsLocal[gameId];
          }, 5000);
        }
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
    State checks in client. Creator's client initiates the state change*/
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
