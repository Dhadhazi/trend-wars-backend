const { ApolloError } = require("apollo-server");

const Deck = require("../models/DeckModel");
const trendgetter = require("../controllers/trendgetter");

module.exports = {
  Query: {
    decks: async () => {
      try {
        const data = await Deck.find({ approved: true });
        return data;
      } catch (err) {
        new ApolloError("Unable to retrieve decks", "GETDECKERROR");
      }
    },
    decksUnapproved: async () => {
      try {
        const data = await Deck.find({ approved: false });
        return data;
      } catch (err) {
        new ApolloError("Unable to retrieve decks", "GETDECKERROR");
      }
    },
    deckById: async (parent, { _id }) => {
      try {
        const data = await Deck.findById(_id);
        return data;
      } catch (err) {
        new ApolloError("Unable to retrieve deck", "GETDECKERROR");
      }
    },
    decksByCategory: async (parent, { category }) => {
      try {
        const data = await Deck.find({ category: category });
        return data;
      } catch (err) {
        new ApolloError("Unable to retrieve deck", "GETDECKERROR");
      }
    },
  },

  Mutation: {
    userAddDeck: async (parent, { deck }) => {
      const newDeck = new Deck({
        name: deck.name,
        description: deck.description,
        keywords: deck.keywords,
        start_date: deck.start_date,
        end_date: deck.end_date,
        category: deck.category,
        geo: deck.geo,
      });
      try {
        await newDeck.save();
        return "Deck Saved";
      } catch (err) {
        new ApolloError("Unable to save the deck", "SAVEDECKERROR");
      }
    },
    approveDeck: async (parent, { deck }) => {
      try {
        const data = await Deck.findById(_id);
        const pairs = await trendgetter(
          deck.start_date,
          deck.end_date,
          deck.category,
          deck.geo,
          deck.keywords
        );
        data.name = deck.name;
        data.description = deck.description;
        data.keywords = deck.keywords;
        data.start_date = deck.start_date;
        data.end_date = deck.end_date;
        data.category = deck.category;
        data.geo = deck.geo;
        data.approved = true;
        data.pairs = pairs;
        console.log(data);
        // await data.save();
        return data;
      } catch (err) {
        new ApolloError("Unable to approve deck", "APPROVEDECKERROR");
      }
    },
    addDeck: async (parent, { deck }) => {
      const pairs = await trendgetter(
        deck.start_date,
        deck.end_date,
        deck.category,
        deck.geo,
        deck.keywords
      );
      const newDeck = new Deck({
        name: deck.name,
        description: deck.description,
        keywords: deck.keywords,
        start_date: deck.start_date,
        end_date: deck.end_date,
        category: deck.category,
        geo: deck.geo,
        pairs,
      });
      try {
        await newDeck.save();
        return "Deck Saved";
      } catch (err) {
        new ApolloError("Unable to save the deck", "SAVEDECKERROR");
      }
    },
    deleteDeck: async (parent, { _id }) => {
      try {
        Deck.findByIdAndDelete(_id, (err) => {
          if (err) {
            console.log(err);
          }
        });
        return _id;
      } catch (err) {
        new ApolloError("Unable to delete the deck", "DELETEDECKERROR");
      }
    },
  },
};
