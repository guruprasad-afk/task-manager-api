const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      default: 16,
      validate(val) {
        if (val < 16) {
          throw new Error("Age is Invalid");
        }
      }
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(val) {
        if (!validator.isEmail(val)) {
          throw new Error("Email is Invalid");
        }
      }
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      validate(val) {
        if (val.toLowerCase().includes("password")) {
          throw new Error("Create a stronger password");
        }
      }
    },
    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ],
    avatar: {
      type: Buffer
    }
  },
  {
    timestamps: true
  }
);

userSchema.virtual("tasks", {
  ref: "Tasks",
  localField: "_id",
  foreignField: "author"
});

userSchema.methods.toJSON = function() {
  const user = this.toObject();

  delete user.password;
  delete user.tokens;
  delete user.avatar;

  return user;
};

userSchema.methods.generateAuthToken = async function() {
  const user = this;

  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  const isMatching = await bcrypt.compare(password, user.password);

  if (!isMatching) {
    throw new Error("Unable to Login");
  }

  return user;
};

userSchema.pre("save", async function(next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
    user.tokens = [];
  }

  next();
});

userSchema.pre("remove", async function(next) {
  const user = this;

  await Task.deleteMany({
    author: user._id
  });

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
