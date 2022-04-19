const User = require('../models/user_model');
const validator = require('validator');

const getUserProfile = async (req, res, next) => {
  try {
    const user = req.user;
    console.log(user);
    res.json({
      data: {
        provider: user.provider,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    });
  } catch (err) {
    next(err);
  }
};

const userSignUp = async (req, res) => {
  let { name } = req.body;
  const { email, password } = req.body;
  console.log(name, email, password);
  if (!name || !email || !password) {
    res.status(400).send({
      error: 'Request Error: name, email, password and role are required.',
    });
    return;
  }

  if (!validator.isEmail(email)) {
    res.status(400).send({ error: 'Request Error: Invalid email format' });
    return;
  }

  name = validator.escape(name);

  const result = await User.signUp(name, email, password);
  if (result.error) {
    res.status(403).send({ error: result.error });
    return;
  }

  const user = result.user;
  if (!user) {
    res.status(500).send({ error: 'Database Query Error' });
    return;
  }

  res.status(200).send({
    data: {
      access_token: user.access_token,
      access_expired: user.access_expired,
      user: {
        id: user.id,
        provider: user.provider,
        name: user.name,
        email: user.email,
      },
    },
  });
};

const userSignIn = async (req, res) => {
  const data = req.body;

  let result;
  switch (data.provider) {
    case 'native':
      result = await nativeSignIn(data.email, data.password);
      break;
    case 'facebook':
      result = await facebookSignIn(data.access_token);
      break;
    case 'google':
      result = await googleSignIn(data.name, data.email, data.picture);
      break;
    default:
      result = { error: 'Wrong Request' };
  }
  if (result.error) {
    const status_code = result.status ? result.status : 403;
    res.status(status_code).send({ error: result.error });
    return;
  }

  const user = result.user;
  if (!user) {
    res.status(500).send({ error: 'Database Query Error' });
    return;
  }

  res.status(200).send({
    data: {
      access_token: user.access_token,
      access_expired: user.access_expired,
      user: {
        id: user.id,
        provider: user.provider,
        name: user.name,
        email: user.email,
      },
    },
  });
};

const nativeSignIn = async (email, password) => {
  console.log('?');
  if (!email || !password) {
    return {
      error: 'Request Error: email and password are required.',
      status: 400,
    };
  }

  try {
    return await User.nativeSignIn(email, password);
  } catch (error) {
    return { error };
  }
};

module.exports = { userSignUp, userSignIn, getUserProfile };
