const request = require('supertest');

const { WEB_API_V1_PREFIX, WEB_API_PATH_SIGNUP, WEB_USER_TOKEN_LENGTH } = require('../../config');

const route = `${WEB_API_V1_PREFIX}${WEB_API_PATH_SIGNUP}`;

const server = require('../index.js');

jest.mock('../utils/web-token');
const { getUserCredentials } = require('../utils/web-token');

afterAll(async () => {
  await server.close();
});

describe('/reqests route test', () => {
  describe('JSON test', () => {
    const validFakeToken = '0'.repeat(WEB_USER_TOKEN_LENGTH);
    const validFakeRequest = `${route}?r=1&&lon=2&lat=3&token=${validFakeToken}`;
    test(`should response with status 200 and proper JSON on valid request`, async () => {
      getUserCredentials.mockReturnValue({ userName: 'user', userId: '123' });
      const response = await request(server).get(validFakeRequest);
      expect(response.status).toEqual(200);
      expect(response.headers['content-type']).toContain('application/json');

      const json = JSON.parse(response.text);
      expect(json).toHaveProperty('token');
      expect(json).toHaveProperty('registered');
      expect(json.token).toHaveLength(WEB_USER_TOKEN_LENGTH);
      expect(json.registered).toBeTruthy();
    });
  });

  describe('Error test', () => {
    test(`should response with status 400 on empty query GET ${route}`, async () => {
      const response = await request(server).get(route);
      expect(response.status).toEqual(400);
    });
    test(`should response with JSON that contains error message`, async () => {
      const response = await request(server).get(route);
      expect(response.headers['content-type']).toContain('application/json');

      const json = JSON.parse(response.text);
      expect(json).toHaveProperty('error');
      expect(json.error).toBeTruthy();
    });
    test(`should response with status 400 on invalid query`, async () => {
      let response = await request(server).get(`${route}?a=1&b=2`);
      expect(response.status).toEqual(400);
      response = await request(server).get(`${route}?a`);
      expect(response.status).toEqual(400);
      response = await request(server).get(`${route}?`);
      expect(response.status).toEqual(400);
    });
    test(`should response with status 401 on invalid token`, async () => {
      const response = await request(server).get(`${route}?r=1000&token=123456789&lon=10&lat=10`);
      expect(response.status).toEqual(401);
    });
    test(`should response with status 404 on GET ${route}/aaa`, async () => {
      const response = await request(server).get(`${route}/aaa`);
      expect(response.status).toEqual(404);
    });
  });
});