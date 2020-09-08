const { PubSub, withFilter } = require("apollo-server");

const pubsub = new PubSub();

let headspace = {};

module.exports = {
  Mutation: {
    sendHead: (parent, { gameId, head }) => {
      if (headspace[gameId] === undefined) {
        headspace[gameId] = {};
        headspace[gameId].heads = [];
        headspace[gameId].gameId = gameId;
      }
      headspace[gameId].heads.push(head);

      pubsub.publish("headupdate", { HeadSpace: headspace[gameId] });

      return true;
    },

    deleteSpace: (parent, { gameId }) => {
      delete headspace[gameId];
      return true;
    },
  },

  Subscription: {
    HeadSpace: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(["headupdate"]),
        (payload, variables) => {
          return variables.gameId === payload.HeadSpace.gameId;
        }
      ),
    },
  },
};
