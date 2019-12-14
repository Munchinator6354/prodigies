module.exports = function(sequelize, DataTypes) {
  var leaderBoard = sequelize.define("leaderBoard", {
    username: DataTypes.STRING,
    shape: DataTypes.TEXT,
    duration: DataTypes.TEXT
  });
  return leaderBoard;
};
