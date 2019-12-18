module.exports = function(sequelize, DataTypes) {
  var games = sequelize.define("games", {
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    URL: DataTypes.TEXT,
    imageURL: DataTypes.TEXT,
    avgRating: DataTypes.TEXT
  });
  return games;
};
