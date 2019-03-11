const request = require('supertest');

const { WEB_API_V1_PREFIX } = require('../../config');

const route = `${WEB_API_V1_PREFIX}/requests`;

const server = require('../index.js');

afterAll(async () => {
  await server.close();
});

describe('/reqests route test', () => {
  test(`should response with status 404 on GET ${route}`, async () => {
    const response = await request(server).get(route);
    expect(response.status).toEqual(404);
  });
  test(`should response with status 404 on GET ${route}/aaa`, async () => {
    const response = await request(server).get(`${route}/aaa`);
    expect(response.status).toEqual(404);
  });
  test(`should response with JSON that contains error message`, async () => {
    const response = await request(server).get(route);
    expect(response.headers['content-type']).toContain('application/json');

    const json = JSON.parse(response.text);
    expect(json).toHaveProperty('error');
    expect(json.error).toBeTruthy();
  });
});

describe('/requests/list route test', () => {
  describe('JSON test', () => {
    test(`should response with status 200 on GET ${route}/list?r=10&d=10&lon=1&lat=2`, async () => {
      const response = await request(server).get(`${route}/list?r=10&d=10&lon=1&lat=2`);
      expect(response.status).toEqual(200);
    });
    test(`should response with proper JSON`, async () => {
      const response = await request(server).get(`${route}/list?r=1000&d=30&lon=1&lat=2`);
      expect(response.headers['content-type']).toContain('application/json');

      const json = JSON.parse(response.text);
      expect(json).toHaveProperty('error');
      expect(json).toHaveProperty('requests');
      expect(json.error).not.toBeTruthy();
      expect(Array.isArray(json.requests)).toBeTruthy();
    });
  });

  describe('Error test', () => {
    const routeList = `${route}/list`;

    test(`should response with status 400 on invalid query`, async () => {
      let response = await request(server).get(`${routeList}?a=1&b=2`);
      expect(response.status).toEqual(400);
      response = await request(server).get(`${routeList}?a`);
      expect(response.status).toEqual(400);
      response = await request(server).get(`${routeList}?`);
      expect(response.status).toEqual(400);
    });
    test(`should response with JSON that contains error message`, async () => {
      const response = await request(server).get(`${routeList}?a`);
      expect(response.headers['content-type']).toContain('application/json');

      const json = JSON.parse(response.text);
      expect(json).toHaveProperty('error');
      expect(json.error).toBeTruthy();
    });
  });
});