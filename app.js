const { ApolloServer, ApolloError } = require("apollo-server");
const path = require("path");

const typeDefs = require("./typeDefs/");
const resolvers = require("./resolvers/");
const db = require("./controllers/dbcontroller");

require("dotenv").config({
  path: path.resolve(__dirname, "./.env"),
});

db.connect();

const server = new ApolloServer({
  cors: {
    origin: "*",
    credentials: true,
  },
  typeDefs,
  resolvers,
  formatError: (err) => {
    if (err.extensions.code == "INTERNAL_SERVER_ERROR") {
      return new ApolloError("We are having some trouble", "ERROR");
    }
    return err;
  },
});

server
  .listen({
    port: process.env.PORT || 4000,
  })
  .then(({ url }) => {
    console.log(`Server started at ${url}`);
  });
