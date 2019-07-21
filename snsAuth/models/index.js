'use strict';

const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = new Object();

const sequelize = new Sequelize(
    config.database, config.username, config.password,  config,
);

var user = require('./user')(sequelize, Sequelize);

console.log('models/index.js :: sequelize >>> ', JSON.stringify(new user(sequelize, Sequelize)));

db.sequelize = sequelize;
db.Sequelize = Sequelize;

console.log(
    'models/index.js :: user >>> ',
    JSON.stringify(require('./user')(sequelize, Sequelize))
);

// db.User = new user(sequelize, Sequelize);
db.User = user;
console.log('models/index.js :: db.User >>> ', db.User);

db.Post = require('./post')(sequelize, Sequelize);
db.Hashtag = require('./hashtag')(sequelize, Sequelize);

db.User.hasMany(db.Post);
db.Post.belongsTo(db.User);

db.Post.belongsToMany(db.Hashtag, {through: 'PostHashtag'});
db.Hashtag.belongsToMany(db.Post, {through: 'PostHashtag'});

db.User.belongsToMany(
    db.User,
    {
        foreignKey: 'followingId',
        as: 'Followers',
        through: 'Follow',
    }
);

db.User.belongsToMany(
    db.User,
    {
        foreignKey: 'followerId',
        as: 'Followings',
        through: 'Follow',
    }
);

// console.log('db >>> ', db);
console.log('db.User >>> ', JSON.stringify(db.User));

module.exports = db;