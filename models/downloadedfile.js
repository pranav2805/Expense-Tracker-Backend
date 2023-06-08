const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const DownloadedFile = sequelize.define('downloadedFile', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  URL: Sequelize.STRING
});

module.exports = DownloadedFile;