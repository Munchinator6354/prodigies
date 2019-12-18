var db = require("../models");

module.exports = function (app) {

  // Get all examples
  app.get("/api/examples", function (req, res) {
    db.Example.findAll({}).then(function (dbExamples) {
      res.json(dbExamples);
    });
  });
  // Get all leaderboard
  app.get("/api/leaderboard", function (req, res) {
    db.leaderBoard.findAll({}).then(function (leaderBoard) {
      res.json(leaderBoard);
    });
  });
  // Get all games
  app.get("/api/add_game", function (req, res) {
    db.games.findAll({}).then(function (games) {
      res.json(games);
    });
  });
  // Get average ratings
  app.get("/api/get_average_rating:id", function (req, res) {
    db.games.findAll({
      gameid: req.params.id,
    }).then(function (games) {
      res.json(games);
    });
  });
  // Get all games
  app.get("/api/index", function (req, res) {
    db.games.findAll({}).then(function (games) {
      res.json(games);
    });
  });

  // POST route for leaderboard
  app.post("/api/leaderboard", function (req, res) {
    console.log(req.body);
    db.leaderBoard
      .create({
        username: req.body.username,
        shape: req.body.shape,
        duration: req.body.duration
      })
      .then(function (leaderBoard) {
        res.json(leaderBoard);
      });
  });
  // POST route for saving a new todo
  app.post("/api/add_game", function (req, res) {
    console.log(req.body);
    db.games
      .create({
        title: req.body.title,
        description: req.body.description,
        URL: req.body.URL,
        imageURL: req.body.imageURL
      })
      .then(function (addGame) {
        res.json(addGame);
      });
  });
  // POST new rating, then average, then UPDATE game table with average
  app.post("/api/add_ratings/:id", function (req, res) {
    console.log(req.body);
    db.Rating
      .create({
        user: req.body.user,
        gameid: req.params.id,
        rating: req.body.rating,
      })
      .then(function () {
        db.Rating.findAll({
          where: { gameid: req.params.id }
        }).then(function (ratings) {
          let count = 0;
          let sum = 0;
          let average = 0;
          for (i = 0; i < ratings.length; i++) {
            count++;
            sum += ratings[i].rating;
          }
          average = Math.round(sum / count);
          db.games.update({
            avgRating: average
          }, {
            where: {
              id: req.params.id
            }
          }
          )
        })
      });
  })
  // Create a new example
  app.post("/api/examples", function (req, res) {
    db.Example.create(req.body).then(function (dbExample) {
      res.json(dbExample);
    });
  });
  // Get all ratings
  app.get("/api/add_ratings/:id", function (req, res) {
    db.games.findAll({
      where: { id: req.params.id }
    }).then(function (games) {
      res.json(games);
    });
  });
  // Delete an example by id
  app.delete("/api/examples/:id", function (req, res) {
    db.Example.destroy({ where: { id: req.params.id } }).then(function (
      dbExample
    ) {
      res.json(dbExample);
    });
  });
};
