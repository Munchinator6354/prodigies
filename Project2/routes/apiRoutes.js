var db = require("../models");

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

  // Delete an example by id
  app.delete("/api/examples/:id", function(req, res) {
    db.Example.destroy({ where: { id: req.params.id } }).then(function(
      dbExample
    ) {
      res.json(dbExample);
    });
  });
};
