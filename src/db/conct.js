const mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/userRegData", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connection succesful");
  })
  .catch((err) => {
    console.error("no connection", `"error" : ${err}`);
  });
