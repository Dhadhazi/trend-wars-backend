const { PubSub, withFilter, ApolloError } = require("apollo-server");

const GameRoomModell = require("../models/GameRoomModel");

const pubsub = new PubSub();

let gameRooms = [
  {
    gameId: "5XC72",

    players: [
      { nick: "John", points: 0 },
      { nick: "Lucy", points: 0 },
    ],
  },
];

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

        pubsub.publish("roomupdate", { GameRoom: data });
        data.save();
        return data;
      } catch (err) {
        new ApolloError("Unable to retrieve room", "GETROOMERROR");
      }
    },

    addOnePlayerScore: async (parent, { gameId, nick }) => {
      try {
        const data = await GameRoomModell.findOne({
          gameId: gameId,
        });

        data.players = data.players.map((p) => {
          if (p.nick === nick) p.points++;
          return p;
        });
        console.log(data);
        return 5;
      } catch (err) {
        new ApolloError("Unable to retrieve room", "GETROOMERROR");
      }
      // pubsub.publish("pointAdded", {
      //   gameId: gameRooms[0].gameId,
      //   multiGamePlayer: {
      //     nick: "John",
      //     points: gameRooms[0].players[0].points,
      //   },
      // });
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
