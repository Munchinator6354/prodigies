DROP DATABASE IF EXISTS leaderboarddb;
CREATE DATABASE leaderboarddb;

USE leaderboarddb
CREATE TABLE leaderboard
(
	id int NOT NULL AUTO_INCREMENT,
	username varchar(255) NOT NULL,
    shape varchar(255) NOT NULL,
	duration int NOT NULL,
	PRIMARY KEY (id)
);