import request from 'sync-request';
import config from '../ts/config.json';

const OK = 200;
const INPUT_ERROR = 400;
const forbidden = 403;
const port: string = config.port;
const url: string = config.url;
let authUser: any;

function setAuthUser(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
) {
  const res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: email,
      password: password,
      nameFirst: nameFirst,
      nameLast: nameLast,
    },
  });
  return JSON.parse(res.body as string);
}

describe('HTTP test for /channels/create/v2', () => {
  beforeEach(() => {
    request('DELETE', `${url}:${port}/clear/v1`);
    authUser = setAuthUser('example0@gmail.com', '111111', 'YIJIN', 'CHEN');
  });
  test('test successful /channels/create/v2', () => {
    const res = request('POST', `${url}:${port}/channels/create/v3`, {
      json: {
        name: 'channel01',
        isPublic: true,
      },
      headers: {
        token: authUser.token,
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ channelId: expect.any(Number) });
  });
  test('test of invalid token', () => {
    const res = request('POST', `${url}:${port}/channels/create/v3`, {
      json: {
        name: 'channel01',
        isPublic: true,
      },
      headers: {
        token: authUser.token + 1,
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(forbidden);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('test of invalid name too short', () => {
    const res = request('POST', `${url}:${port}/channels/create/v3`, {
      json: {
        name: '',
        isPublic: true,
      },
      headers: {
        token: authUser.token,
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('test of invalid name too long', () => {
    const res = request('POST', `${url}:${port}/channels/create/v3`, {
      json: {
        name: '12345678901234567890100000',
        isPublic: true,
      },
      headers: {
        token: authUser.token,
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
