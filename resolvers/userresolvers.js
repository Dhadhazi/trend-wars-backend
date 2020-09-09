const { ApolloError } = require("apollo-server");
const bcrypt = require("bcrypt");

const UserModel = require("../models/UserModell");
const jwt = require("../controllers/jwt");

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
    loginUser: async (parent, { input }) => {
      const data = await UserModel.findOne({ email: input.email });
      if (data === null) {
        return;
      }
      const match = await bcrypt.compare(input.password, data.password);
      if (match) {
        data.token = jwt.toJWT({
          email: input.email,
          permission: data.permission,
        });
        return data;
      }
    },
    isAdmin: (parent, { token }) => {
      const decoded = jwt.toData(token);
      if (decoded.permission === "Admin") return true;
      return false;
    },
  },
};
