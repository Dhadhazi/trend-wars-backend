const mongoose = require("mongoose");

exports.connect = () => {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  mongoose.connection.on("connected", function () {
    console.log("Mongoose default connection is open");
  });
  mongoose.connection.on("error", function (err) {
    console.log("Mongoose default connection has occured " + err + " error");
  });
};
exports.disconnect = () => {
  mongoose.connection.close();
};
