require("dotenv").config();
const mongoose = require("mongoose");
const validator = require("validator");
const bycryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userDataSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3 },
  email: {
    type: String,
    required: true,
    unique: [true, "email_id taken"],
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("invalid email");
      }
    },
  },
  phoneno: {
    maxlength: 10,
    minlength: 10,
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  webToken: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

userDataSchema.methods.generateAuthToken = async function () {
  try {
    const token = await jwt.sign(
      { _id: this._id.toString() },
      process.env.SECRET_KEY
    );

    this.webToken = this.webToken.concat({ token: token });
    await this.save();
    return token;
  } catch (error) {
    res.send(error);
    console.log(error);
  }
};

userDataSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bycryptjs.hash(this.password, 10);
  }
  next();
});

const usersData = new mongoose.model("userData", userDataSchema);
module.exports = usersData;
