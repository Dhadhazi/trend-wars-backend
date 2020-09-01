const { ApolloError } = require("apollo-server");

const UserModel = require("../models/UserModell");
const bcrypt = require("bcrypt");

module.exports = {
  Mutation: {
    registerUser: async (parent, { input }) => {
      var answer = true;
      await UserModel.findOne({ email: input.email }, function (err, res) {
        if (err) {
          new ApolloError("Unable to register user", "REGUSERERROR");
          console.log(err);
        } else {
          if (res === null) {
            bcrypt.hash(input.password, 12, async (err, password) => {
              if (err) {
                new ApolloError("Unable to register user", "REGUSERERROR");
                console.log(err);
              } else {
                const newUser = new UserModel({
                  email: input.email,
                  password,
                });
                try {
                  await newUser.save();
                } catch (e) {
                  console.log(e);
                }
              }
            });
          } else {
            answer = false;
          }
        }
      });
      return answer;
    },
  },
};
