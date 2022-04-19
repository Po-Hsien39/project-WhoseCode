const jwt = require('../../util/jwt');
const { TOKEN_SECRET } = process.env;

const authentication = () => {
  return async function (req, res, next) {
    let accessToken = req.get('Authorization');
    if (!accessToken) {
      res.status(401).send({ error: 'Unauthorizedtest' });
      return;
    }

    accessToken = accessToken.replace('Bearer ', '');
    if (accessToken == 'null') {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }

    try {
      const user = await jwt.asyncVerify(accessToken, TOKEN_SECRET);
      req.user = user;

      if (!user) res.status(403).send({ error: 'Forbidden' });
      next();
      return;
    } catch (err) {
      console.log(err);
      res.status(403).send({ error: 'Forbidden' });
    }
  };
};

module.exports = authentication;
