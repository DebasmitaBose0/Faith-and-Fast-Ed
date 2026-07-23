import jwt from 'jsonwebtoken';

const generatedAccessToken = async (user) => {
  return jwt.sign({ id: user }, process.env.SECRET_KEY_ACCESS_TOKEN, {
    expiresIn: '5hr',
  });
};

export default generatedAccessToken;
