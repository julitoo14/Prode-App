const request = require('supertest');
const jwt = require('jwt-simple');
const moment = require('moment');
const app = require('../../app'); // tu app con la ruta protegida
const { secret } = require('../../helpers/jwt');

describe('Auth middleware', () => {

  it('should return 403 if no Authorization header', async () => {
    const res = await request(app).get('/auth/user/me');
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('La peticion no tiene la cabecera de autenticacion');
  });

  it('should return 403 if token is invalid', async () => {
    const res = await request(app)
      .get('/auth/user/me')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Token invalido');
  });

  it('should return 401 if token is expired', async () => {
    const payload = {
      userId: '123',
      exp: moment().subtract(40 , "minutes").unix(),
    };
    const token = jwt.encode(payload, secret);

    const res = await request(app)
      .get('/auth/user/me')
      .set('Authorization', token);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token expired');
  });


});
