const jwt = require('../../util/jwt');
const { TOKEN_SECRET } = process.env;

const authentication = () => {
  return async function (req, res, next) {
    console.log(req.headers);
    let accessToken = req.get('Authorization');
    console.log(accessToken);
    if (!accessToken) return res.status(401).send({ error: 'Unauthorized' });

    accessToken = accessToken.replace('Bearer ', '');
    if (!accessToken) return res.status(401).send({ error: 'Unauthorized' });

    try {
      const user = await jwt.asyncVerify(accessToken, TOKEN_SECRET);
      if (!user) return res.status(403).send({ error: 'Forbidden' });
      req.user = user;
      next();
      return;
    } catch (err) {
      console.log(err);
      res.status(403).send({ error: 'Forbidden' });
    }
  };
};

module.exports = authentication;
