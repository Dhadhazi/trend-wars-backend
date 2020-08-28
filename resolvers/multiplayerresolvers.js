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
      async function checkGameId(id) {
        const data = await GameRoomModell.findOne({ gameId: id });
        if (data === null) return true;
        return false;
      }
      let gameId = Math.random().toString(36).substr(4, 5).toUpperCase();
      while ((await checkGameId(gameId)) !== true) {
        gameId = Math.random().toString(36).substr(4, 5).toUpperCase();
      }
      console.log("Add game room");
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

      const newRoom = new GameRoomModell({
        gameId,
        players: [{ nick: input.creator }],
        gameDeck: {
          name: input.gameDeck.name,
          description: input.gameDeck.description,
          dateString: input.gameDeck.dateString,
          geo: input.gameDeck.geo,
          timer: input.gameDeck.timer,
          pairs: input.gameDeck.pairs,
        },
      });
      try {
        await newRoom.save();
        return gameId;
      } catch (err) {
        new ApolloError("Unable to save the room", "CREATEROOMERROR");
      }
    },

    joinGameRoom: async (parent, { nick, gameId }) => {
      try {
        const data = await GameRoomModell.findOne({
          gameId: gameId,
        });
        data.players.push({ nick });
        gameRoomsLocal[gameId].players.push({ nick, points: 0 });
        pubsub.publish("roomupdate", { GameRoom: gameRoomsLocal[gameId] });
        data.save();
        return data;
      } catch (err) {
        new ApolloError("Unable to retrieve room", "GETROOMERROR");
      }
    },

    /*When answer = player number, client shows results. All client submits answers */
    addPlayerAnswer: async (parent, { gameId, nick, winner }) => {
      try {
        const data = await GameRoomModell.findOne({
          gameId: gameId,
        });
        if (winner) {
          gameRoomsLocal[gameId].players = gameRoomsLocal[gameId].players.map(
            (p) => {
              if (p.nick === nick) p.points++;
              return p;
            }
          );
          data.players = data.players.map((p) => {
            if (p.nick === nick) p.points++;
            return p;
          });
        }
        gameRoomsLocal[gameId].answers++;
        data.answers++;
        pubsub.publish("roomupdate", { GameRoom: gameRoomsLocal[gameId] });
        data.save();
        return true;
      } catch (err) {
        new ApolloError("Unable to retrieve room", "GETROOMERROR");
      }
    },

    /*When the room updates, answer reset. state drive the game for everybody. 
    State checks in client. Creator client changes the state*/
    changeGameRoomState: async (parent, { gameId, state }) => {
      console.log("Incoming state: ", state);
      try {
        const data = await GameRoomModell.findOne({
          gameId: gameId,
        });
        gameRoomsLocal[gameId].answers = 0;
        gameRoomsLocal[gameId].state = state;
        data.answers = 0;
        data.state = state;
        pubsub.publish("roomupdate", { GameRoom: gameRoomsLocal[gameId] });
        data.save();
        return true;
      } catch (err) {
        new ApolloError("Unable to retrieve room", "GETROOMERROR");
      }
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
