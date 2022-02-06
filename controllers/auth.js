const express = require("express");
const bcrypt = require("bcryptjs");
const nodeMailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");

const User = require("../models/user");

const transport = nodeMailer.createTransport(
  sendGridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);
/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 */
module.exports.getLogin = (req, res, next) => {
  let msg = req.flash("error");
  if (msg.length > 0) {
    msg = msg[0];
  } else {
    msg = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: msg,
  });
};

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 */
module.exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let fetchedUser;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid credentials");
        return res.redirect("/login");
      }
      fetchedUser = user;
      return bcrypt.compare(password, user.password).then((doMatch) => {
        if (doMatch) {
          req.session.isLoggedIn = true;
          req.session.user = fetchedUser;
          return req.session.save((err) => {
            if (err) {
              console.log("ERROR IN SAVING SESSION");
            }
            res.redirect("/");
          });
        }
        req.flash("error", "Invalid credentials");
        res.redirect("/login");
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 */
module.exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error in logout -> " + err);
    }
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  let msg = req.flash("error");
  if (msg.length > 0) {
    msg = msg[0];
  } else {
    msg = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: msg,
  });
};

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 */
exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        req.flash("error", "EMAIL ALREADY EXISTS PLEASE USE DIFFERENT ONE");
        return res.redirect("/signup");
      }

      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const newUser = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] },
          });

          return newUser.save();
        })
        .then((result) => {
          res.redirect("/login");
          return transport.sendMail({
            to: email,
            from: "shouvik0013@gmail.com",
            subject: "Signup completed",
            html: "<h1>You successfully signed up!</h1>",
          });
        })
        .catch((err) => {
          console.log("FROM SENDGRID -> " + err);
        });
    })

    .catch((err) => {
      console.log("ERROR IN auth.postSignup");
    });
};

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 */
module.exports.getReset = (req, res, next) => {
  let msg = req.flash("error");
  if (msg.length > 0) {
    msg = msg[0];
  } else {
    msg = null;
  }
  return res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: msg,
  });
};
