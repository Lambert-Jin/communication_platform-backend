import request from 'sync-request';
import config from './config.json';
import { clearV1 } from './other';
import { getData } from './dataStore';

const OK = 200;
const port: string = config.port;
const url: string = config.url;
let authUser: any;
let authUser1: any;

describe('HTTP tests for Auth feature', () => {
  beforeEach(() => {
    request('DELETE', `${url}:${port}/clear/v2`);
    const res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'jackrobson@gmail.com',
        password: 'password12345',
        nameFirst: 'Jack',
        nameLast: 'Robson',
      },
    });
    authUser = JSON.parse(res.body as string);
  });
  test('test successful /auth/logout/v2: 1', () => {
    const res = request('POST', `${url}:${port}/auth/logout/v2`, {
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });
  test('test successful /auth/logout/v2: 2', () => {
    request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'realemail@gmail.com',
        password: 'password12345',
        nameFirst: 'First',
        nameLast: 'Last',
      },
    });
    const res = request('POST', `${url}:${port}/auth/logout/v2`, {
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });
  test('test successful /auth/logout/v2: 3', () => {
    const res1 = request('POST', `${url}:${port}/auth/login/v3`, {
      json: {
        email: 'jackrobson@gmail.com',
        password: 'password12345',
      },
    });
    authUser1 = JSON.parse(res1.body as string);
    const res = request('POST', `${url}:${port}/auth/logout/v2`, {
      headers: { token: authUser1.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });
  test('test fail /auth/logout/v2: 1', () => {
    const res = request('POST', `${url}:${port}/auth/logout/v2`, {
      headers: { token: 'Not a token' },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj).toStrictEqual({ error: expect.any(Object) });
  });
  test('test successful /auth/login/v3', () => {
    const res = request('POST', `${url}:${port}/auth/login/v3`, {
      json: {
        email: 'jackrobson@gmail.com',
        password: 'password12345',
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({
      token: expect.any(String),
      authUserId: 1,
    });
  });
  test('test failed /auth/login/v3', () => {
    const res = request('POST', `${url}:${port}/auth/login/v3`, {
      json: {
        email: 'jackrobson@gmail.com',
        password: 'wrongpassword',
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toStrictEqual({ error: expect.any(Object) });
  });
});

describe('HTTP tests for authPasswordResetRequestV1 feature', () => {
  beforeEach(() => {
    clearV1();
    const res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'jackdavidrobson@gmail.com',
        password: 'password12345',
        nameFirst: 'Jack',
        nameLast: 'Robson',
      },
    });
    authUser = JSON.parse(res.body as string);
  });
  test('test success /auth/passwordreset/request/v1', () => {
    const res = request(
      'POST',
      `${url}:${port}/auth/passwordreset/request/v1`,
      {
        json: {
          email: 'jackdavidrobson@gmail.com',
        },
        headers: { token: authUser.token },
      }
    );
    const data = getData();
    console.log(data);
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual({});
  });
  test('test fail /auth/passwordreset/request/v1', () => {
    const res = request(
      'POST',
      `${url}:${port}/auth/passwordreset/request/v1`,
      {
        json: {
          email: 'jackdavidrobson@gmail.com',
        },
        headers: { token: 'not a token' },
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj).toEqual({ error: expect.any(Object) });
  });
  test('test fail email /auth/passwordreset/request/v1 no error code', () => {
    const res = request(
      'POST',
      `${url}:${port}/auth/passwordreset/request/v1`,
      {
        json: {
          email: 'not an email',
        },
        headers: { token: authUser.token },
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(200);
    expect(bodyObj).toEqual({});
  });
});

describe('HTTP tests for authPasswordResetResetV1 feature', () => {
  beforeEach(() => {
    clearV1();
    const res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'jackdavidrobson@gmail.com',
        password: 'password12345',
        nameFirst: 'Jack',
        nameLast: 'Robson',
      },
    });
    authUser = JSON.parse(res.body as string);
    request('POST', `${url}:${port}/auth/passwordreset/request/v1`, {
      json: {
        email: 'jackdavidrobson@gmail.com',
      },
      headers: { token: authUser.token },
    });
  });
  test('test success /auth/passwordreset/reset/v1', () => {
    let data = getData();
    console.log(data.users[0]);
    const res = request('POST', `${url}:${port}/auth/passwordreset/reset/v1`, {
      json: {
        resetCode: data.users[0].resetCode,
        newPassword: 'validPassword',
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual({});
    data = getData();
    console.log(data);
  });
  test('test fail /auth/passwordreset/reset/v1 1', () => {
    const data = getData();
    const res = request('POST', `${url}:${port}/auth/passwordreset/reset/v1`, {
      json: {
        resetCode: data.users[0].resetCode,
        newPassword: 'validPassword',
      },
      headers: { token: 'not a token' },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj).toEqual({ error: expect.any(Object) });
  });
  test('test fail /auth/passwordreset/reset/v1 2', () => {
    const data = getData();
    const res = request('POST', `${url}:${port}/auth/passwordreset/reset/v1`, {
      json: {
        resetCode: data.users[0].resetCode,
        newPassword: '1',
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual({ error: expect.any(Object) });
  });
  test('test fail /auth/passwordreset/reset/v1 3', () => {
    const res = request('POST', `${url}:${port}/auth/passwordreset/reset/v1`, {
      json: {
        resetCode: 'not a code',
        newPassword: 'validPassword',
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual({ error: expect.any(Object) });
  });
});

describe('HTTP tests for authRegisterV3 failure ', () => {
  test('test fail /auth/register/v3', () => {
    request('DELETE', `${url}:${port}/clear/v2`);
    const res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'jackrobson@gmail.com',
        password: 'pa',
        nameFirst: 'Jack',
        nameLast: 'Robson',
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual({ error: expect.any(Object) });
  });
  test('test fail /auth/register/v3', () => {
    request('DELETE', `${url}:${port}/clear/v2`);
    const res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'jackrobson@gmail.com',
        password: 'password12345',
        nameFirst: '',
        nameLast: 'Robson',
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual({ error: expect.any(Object) });
  });
  test('test fail /auth/register/v3', () => {
    request('DELETE', `${url}:${port}/clear/v2`);
    const res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'jackrobson@gmail.com',
        password: 'password12345',
        nameFirst: 'Jack',
        nameLast: '',
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual({ error: expect.any(Object) });
  });
  test('test fail /auth/register/v3', () => {
    request('DELETE', `${url}:${port}/clear/v2`);
    const res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'not an email',
        password: 'password12345',
        nameFirst: 'Jack',
        nameLast: 'Robson',
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual({ error: expect.any(Object) });
  });
  test('test success /auth/register/v3', () => {
    request('DELETE', `${url}:${port}/clear/v2`);
    const res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'jackrobson@gmail.com',
        password: 'password12345',
        nameFirst: 'Jack',
        nameLast: 'Robson',
      },
    });
    request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'different@gmail.com',
        password: 'password123',
        nameFirst: 'Jack',
        nameLast: 'Robson',
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(200);
    expect(bodyObj).toEqual({
      token: expect.any(String),
      authUserId: expect.any(Number),
    });
  });
});
