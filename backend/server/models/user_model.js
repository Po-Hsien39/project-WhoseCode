const pool = require('../../util/mysqlcon');
const bcrypt = require('bcrypt');
const jwt = require('../../util/jwt');
const { SALT, TOKEN_EXPIRE, TOKEN_SECRET } = process.env;

const nativeSignIn = async (email, password) => {
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');

    const [users] = await conn.query('SELECT * FROM user WHERE email = ?', [
      email,
    ]);
    const user = users[0];
    if (!user) {
      return { error: 'Login failed, Please signup' };
    }
    if (!bcrypt.compareSync(password, user.password)) {
      await conn.query('COMMIT');
      return { error: 'Password is wrong' };
    }

    const accessToken = await jwt.asyncSign(
      {
        provider: user.provider,
        name: user.name,
        email: user.email,
        picture: user.picture,
        id: user.id,
        role: user.role_id,
      },
      TOKEN_SECRET
    );

    await conn.query('COMMIT');
    user.access_token = accessToken;
    user.access_expired = TOKEN_EXPIRE;

    return { user };
  } catch (error) {
    await conn.query('ROLLBACK');
    return { error };
  } finally {
    await conn.release();
  }
};

const signUp = async (name, email, password) => {
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');

    const emails = await conn.query(
      'SELECT email FROM user WHERE email = ? FOR UPDATE',
      [email]
    );
    if (emails[0].length > 0) {
      await conn.query('COMMIT');
      return { error: 'Email Already Exists' };
    }

    // const loginAt = new Date();
    const hashedPwd = await bcrypt.hash(password, parseInt(SALT));
    const user = {
      provider: 'native',
      email: email,
      password: hashedPwd,
      name: name,
    };

    const queryStr = 'INSERT INTO user SET ?';
    const [result] = await conn.query(queryStr, user);

    const accessToken = await jwt.asyncSign(
      {
        provider: user.provider,
        name: user.name,
        email: user.email,
        id: result.insertId,
        access_expired: TOKEN_EXPIRE,
      },
      TOKEN_SECRET
    );
    user.id = result.insertId;
    user.access_token = accessToken;
    await conn.query('COMMIT');
    return { user };
  } catch (error) {
    console.log(error);
    await conn.query('ROLLBACK');
    return { error };
  } finally {
    await conn.release();
  }
};

module.exports = { nativeSignIn, signUp };
