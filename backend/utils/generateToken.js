const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'mess_management_super_secret_jwt_key_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '30d';

  return jwt.sign({ id: userId, role }, secret, {
    expiresIn
  });
};

module.exports = generateToken;
