if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}
var db = require("../models");
var users = [];
var bcryptjs = require("bcryptjs");
var passport = require('passport')
var flash = require("express-flash")
var session = require("express-session")
var initializePassport = require("../public/js/passport-config")
module.exports = function(app) {

  // Get all examples
  app.get("/api/examples", function(req, res) {
    db.Example.findAll({}).then(function(dbExamples) {
      res.json(dbExamples);
    });
  });
  // Get all leaderboard
  app.get("/api/leaderboard", function(req, res) {
    db.leaderBoard.findAll({}).then(function(leaderBoard) {
      res.json(leaderBoard);
    });
  });
  // Get all games
  app.get("/api/add_game", function(req, res) {
    db.games.findAll({}).then(function(games) {
      res.json(games);
    });
  });

  // POST route for saving a new todo
  app.post("/api/leaderboard", function(req, res) {
    console.log(req.body);
    // create takes an argument of an object describing the item we want to
    // insert into our table. In this case we just we pass in an object with a text
    // and complete property (req.body)
    db.leaderBoard
      .create({
        username: req.body.username,
        shape: req.body.shape,
        duration: req.body.duration
      })
      .then(function(leaderBoard) {
        // We have access to the new todo as an argument inside of the callback function
        res.json(leaderBoard);
      });
  });
  // POST route for saving a new todo
  app.post("/api/add_game", function(req, res) {
    console.log(req.body);
    // create takes an argument of an object describing the item we want to
    // insert into our table. In this case we just we pass in an object with a text
    // and complete property (req.body)
    db.games
      .create({
        title: req.body.title,
        description: req.body.description,
        URL: req.body.URL,
        imageURL: req.body.imageURL
      })
      .then(function(addGame) {
        // We have access to the new todo as an argument inside of the callback function
        res.json(addGame);
      });
  });

  // Create a new example
  app.post("/api/examples", function(req, res) {
    db.Example.create(req.body).then(function(dbExample) {
      res.json(dbExample);
    });
  });
  //initializePassport
  initializePassport(
    passport, 
    email => users.find(user => user.email === email)
  )

  // Register User
  app.post("/register", async(req, res)=>{
    try{
      var hashedPassword = await bcryptjs.hash(req.body.password, 1)
      users.push({
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
      })
      res.redirect("/login")
    } catch {
      res.redirect("/register")
    }

    console.log(users)
    
  });
  app.post("/login", passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true

  }))
  app.use(flash())
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }))
  app.use(passport.initialize())
  app.use(passport.session())
  // });
  // Delete an example by id
  app.delete("/api/examples/:id", function(req, res) {
    db.Example.destroy({ where: { id: req.params.id } }).then(function(
      dbExample
    ) {
      res.json(dbExample);
    });
  });
};
