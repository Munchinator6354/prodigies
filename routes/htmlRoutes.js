var db = require("../models");

module.exports = function(app) {
  // Load index page
  app.get("/", function(req, res) {
    db.games.findAll({}).then(function(games) {
      res.render("add_game", {
        msg: "Welcome to adding games",
        games: games
      });
    });
  });

  // Load example page and pass in an example by id
  app.get("/example/:id", function(req, res) {
    db.Example.findOne({ where: { id: req.params.id } }).then(function(
      dbExample
    ) {
      res.render("example", {
        example: dbExample
      });
    });
  });
  // Load games
  app.get("/add_game", function(req, res) {
    db.games.findAll({}).then(function(games) {
      res.render("add_game", {
        msg: "Welcome to adding games",
        games: games
      });
    });
  });
  // Register page route
  app.get("/register", function(req, res) {
    res.render("register");
  });
  // Login page route
  app.get("/login", function(req, res) {
    res.render("login");
  });
  // Render 404 page for any unmatched routes
  app.get("*", function(req, res) {
    res.render("404");
  });
};