const { DataTypes } = require('sequelize');

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});



const Conversation = sequelize.define('Conversation', {
  sessionId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});

sequelize.sync();

module.exports = {
  sequelize,
  Conversation
};