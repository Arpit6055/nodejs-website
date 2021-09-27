require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const hbs = require("hbs");
const bycryptjs = require("bcryptjs");
const cookieParser = require("cookie-parser");

//importing auth function from auth.js
const auth = require("./middleware/auth");
//connecting to datbase..
require("./db/conct");
const usersData = require("./models/login");

const app = express();
app.use(cookieParser());
//get data from the html form..
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 5000;

//all the paths required for static files, setting up the view engine and registering the partials
const viewPath = path.join(__dirname, "templates", "views");
const partialPath = path.join(__dirname, "templates", "partials");
hbs.registerPartials(partialPath);
app.use(express.static("./public/css"));
app.use(express.static("./public/js"));
app.use(express.static("./public/img"));
app.set("view engine", "hbs");
app.set("views", viewPath);

app.get("/", (req, res) => {
  res.render("login");
});

app.post("/register", async (req, res) => {
  try {
    var pswrd = req.body.pswrd;
    var confirmPswrd = req.body.confirmPswrd;
    //checking password and setting user data to be saved
    if (pswrd == confirmPswrd) {
      const regNewUser = new usersData({
        name: req.body.Rname,
        email: req.body.Remail,
        phoneno: req.body.Rphone,
        password: req.body.Rpswrd,
      });
      //generating token
      const token = await regNewUser.generateAuthToken();
      //saving user data
      const saveData = await regNewUser.save();

      var Ralert = "Login using the registred email";
      res.status(201).render("login", { RSalert: Ralert });
    } else if (pswrd != confirmPswrd) {
      var Ralert = `Confirm password failed`;
      res.status(500).render("login", { REalert: Ralert });
    }
  } catch (error) {
    console.log(error);
    var Ralert = "Some Error Occured or Account already exists";
    res.status(400).render("login", { REalert: Ralert });
  }
});

app.post("/login", async (req, res) => {
  try {
    const userEmail = req.body.Lemail;
    const Lpswrd = req.body.Lpswrd;
    //finding user with with email
    const loginUser = await usersData.find({
      email: userEmail,
    });
    //checking the password
    const matchPswrd = await bycryptjs.compare(Lpswrd, loginUser[0].password);

    //genrating token
    if (matchPswrd) {
      const token = await loginUser[0].generateAuthToken();
      res.cookie("jwt", token, {
        // expiry time of cookie 24hr
        maxAge: 24 * 60 * 60 * 1000 ,
        httpOnly: true,
      });
      res.redirect("/home");
    } else {
      console.log("incorrect pswrd");
      var Lalert = "User not found, SIGNUP";
      res.render("login", { Lalert: Lalert });
    }
  } catch (error) {
    console.log(error);
    var Lalert = "User not found, SIGNUP";
    res.render("login", { Lalert: Lalert });
  }
});

app.get("/home", auth, async (req, res) => {
  res.render("home");
});

app.get("/logout", auth, async (req, res) => {
  try {
    req.user.webToken = req.user.webToken.filter((elem) => {
      return elem.token != req.token;
    });
    res.clearCookie("jwt");
    await req.user.save();
    res.redirect("/");
  } catch (error) {
    res.status(500).send(error);
  }
});
app.get("/logoutall", auth, async (req, res) => {
  try {
    req.user.webToken = [];
    res.clearCookie("jwt");
    await req.user.save();
    res.redirect("/");
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/myblog", auth, (req, res) => {
  res.render("myblog");
});

//page not fount 404
app.get("*", (req, res) => {
  res.render("error");
});

app.listen(port, () =>
  console.log(
    "> Server is up and running on port : " + "http://127.0.0.1:" + port
  )
);
