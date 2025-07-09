const request = require('supertest');
const app = require('../app');

async function registerAndLogin() {
  const reg = await request(app).post('/auth/register').send({
    userName: 'TestUser',
    email:    'test@test.com',
    password: '12345678',
  });
  const { token, user } = (await request(app)
    .post('/auth/login')
    .send({ email: 'test@test.com', password: '12345678' }))
    .body;
  return { token, userId: user._id };
}

module.exports = { request, registerAndLogin };
