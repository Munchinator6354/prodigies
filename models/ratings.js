module.exports = function(sequelize, DataTypes) {
    var Rating = sequelize.define("Rating", {
        user: DataTypes.STRING,
        rating: DataTypes.INTEGER,
        gameid: DataTypes.STRING
    });
    return Rating;

};