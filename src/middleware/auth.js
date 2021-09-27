const jwt = require("jsonwebtoken");
const usersData = require("../models/login");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    console.log(token, "cokie token");
    const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
    if (verifyUser) {
      const user = await usersData.findOne({ _id: verifyUser._id });
      var verifyCookie = user.webToken[0].token;
      req.user = user;
      req.token = token;
      console.log(req.user.webToken , "123");
      req.user.webToken = req.user.webToken.filter((elem) => {
        return elem.token = token;
      });
      if (req.user.webToken == [] || req.user.webToken == undefined) {
        req.redirect("/login");
        throw Error("login again, authentication failed");
      } else {
        next();
      }
    }
  } catch (error) {
    console.log(error);
    res.status(404).render("error");
  }
};

module.exports = auth;
