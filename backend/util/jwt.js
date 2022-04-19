const jwt = require('jsonwebtoken');
// const util = require("util")
require('dotenv-defaults').config();

jwt.asyncSign = (data, secret) => {
  return new Promise((resolve, reject) => {
    jwt.sign(data, secret, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
};

jwt.asyncVerify = (...args) => {
  return new Promise((resolve, reject) => {
    jwt.verify(...args, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
};

module.exports = jwt;
// jwt.asyncSign = util.promisify(jwt.sign)
// jwt.asyncVerify = util.promisify(jwt.verify)
