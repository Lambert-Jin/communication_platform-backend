import request from 'sync-request';
import config from '../ts/config.json';
import { clearV1 } from '../ts/other';

const OK = 200;
const port: string = config.port;
const url: string = config.url;
let authUser: any;

describe('HTTP tests for userProfileSetNameV1 feature', () => {
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
  test('test failed /user/profile/setname/v2 1', () => {
    const res = request('PUT', `${url}:${port}/user/profile/setname/v2`, {
      json: {
        nameFirst: '',
        nameLast: 'Last',
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toStrictEqual({ error: expect.any(Object) });
  });
  test('test failed /user/profile/setname/v2 2', () => {
    const res = request('PUT', `${url}:${port}/user/profile/setname/v2`, {
      json: {
        nameFirst: 'First',
        nameLast: '',
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toStrictEqual({ error: expect.any(Object) });
  });
  test('test failed /user/profile/setname/v2 3', () => {
    const res = request('PUT', `${url}:${port}/user/profile/setname/v2`, {
      json: {
        nameFirst: 'First',
        nameLast: 'Last',
      },
      headers: { token: 'Chicken' },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj).toStrictEqual({ error: expect.any(Object) });
  });
  test('test failed /user/profile/setname/v2 4', () => {
    const res = request('PUT', `${url}:${port}/user/profile/setname/v2`, {
      json: {
        nameFirst:
            'Firstdfgfsdhefghjfgdhjdfghjghdjdghjdgjdgjsfgrgsrfthtrthrtshwrtgerthgrwthrthrst',
        nameLast: 'Last',
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toStrictEqual({ error: expect.any(Object) });
  });
  test('test failed /user/profile/setname/v2 5', () => {
    const res = request('PUT', `${url}:${port}/user/profile/setname/v2`, {
      json: {
        nameFirst: 'First',
        nameLast:
            'Firstdfgfsdhefghjfgdhjdfghjghdjdghjdgjdgjsfgrgsrfthtrthrtshwrtgerthgrwthrthrst',
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toStrictEqual({ error: expect.any(Object) });
  });
  test('test success /user/profile/setname/v2', () => {
    const res = request('PUT', `${url}:${port}/user/profile/setname/v2`, {
      json: {
        nameFirst: 'First',
        nameLast: 'Last',
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });
});

describe('HTTP tests for userProfileSetEmailV1 feature', () => {
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
  test('test failure /user/profile/setemail/v2 1', () => {
    const res = request('PUT', `${url}:${port}/user/profile/setemail/v2`, {
      json: {
        email: 'notanemail',
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toStrictEqual({ error: expect.any(Object) });
  });
  test('test failure /user/profile/setemail/v2 2', () => {
    request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'real@gmail.com',
        password: 'pass123',
        nameFirst: 'First',
        nameLast: 'Last',
      },
    });
    const res = request('PUT', `${url}:${port}/user/profile/setemail/v2`, {
      json: {
        email: 'real@gmail.com',
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toStrictEqual({ error: expect.any(Object) });
  });
  test('test failure /user/profile/setemail/v2 3', () => {
    const res = request('PUT', `${url}:${port}/user/profile/setemail/v2`, {
      json: {
        email: 'newemail@gmail.com',
      },
      headers: { token: 'not a token' },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj).toStrictEqual({ error: expect.any(Object) });
  });
  test('test success /user/profile/setemail/v2', () => {
    const res = request('PUT', `${url}:${port}/user/profile/setemail/v2`, {
      json: {
        email: 'newemail@gmail.com',
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });
});

describe('HTTP tests for userProfileSetHandleV1 feature', () => {
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
  test('test failure /user/profile/sethandle/v2 1', () => {
    const res = request('PUT', `${url}:${port}/user/profile/sethandle/v2`, {
      json: {
        handleStr: 'a',
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toStrictEqual({ error: expect.any(Object) });
  });
  test('test failure /user/profile/sethandle/v2 2', () => {
    const res = request('PUT', `${url}:${port}/user/profile/sethandle/v2`, {
      json: {
        handleStr: 'ahsfgdhfsghsd23522525g',
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toStrictEqual({ error: expect.any(Object) });
  });
  test('test failure /user/profile/sethandle/v2 3', () => {
    const res = request('PUT', `${url}:${port}/user/profile/sethandle/v2`, {
      json: {
        handleStr: 'han{@$()!le',
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toStrictEqual({ error: expect.any(Object) });
  });
  test('test failure /user/profile/sethandle/v2 3', () => {
    const res = request('PUT', `${url}:${port}/user/profile/sethandle/v2`, {
      json: {
        handleStr: 'jackrobson',
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toStrictEqual({ error: expect.any(Object) });
  });
  test('test failure /user/profile/sethandle/v2 4', () => {
    const res = request('PUT', `${url}:${port}/user/profile/sethandle/v2`, {
      json: {
        handleStr: 'YouPayDouble02',
      },
      headers: { token: 'Not a token' },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj).toStrictEqual({ error: expect.any(Object) });
  });
  test('test success /user/profile/sethandle/v2', () => {
    const res = request('PUT', `${url}:${port}/user/profile/sethandle/v2`, {
      json: {
        handleStr: 'YouPayDouble02',
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });
});

describe('HTTP tests for usersAllV1 feature', () => {
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
    request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'firstlast@gmail.com',
        password: 'password12345',
        nameFirst: 'First',
        nameLast: 'Last',
      },
    });
    request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'thisisanemail@gmail.com',
        password: 'password12345',
        nameFirst: 'Coby',
        nameLast: 'Sharp',
      },
    });
  });
  test('test error /users/all/v2', () => {
    const res = request('GET', `${url}:${port}/users/all/v2`, {
      headers: { token: 'not a token' },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj).toStrictEqual({ error: expect.any(Object) });
  });
  test('test success /users/all/v2', () => {
    const res = request('GET', `${url}:${port}/users/all/v2`, {
      headers: { token: authUser.token },
    });
    console.log(authUser.token);
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual({
      users: [
        {
          uId: 1,
          email: 'jackrobson@gmail.com',
          nameFirst: 'Jack',
          nameLast: 'Robson',
          handleStr: 'jackrobson',
          profileImgUrl: expect.any(String),
        },
        {
          uId: 2,
          email: 'firstlast@gmail.com',
          nameFirst: 'First',
          nameLast: 'Last',
          handleStr: 'firstlast',
          profileImgUrl: expect.any(String),
        },
        {
          uId: 3,
          email: 'thisisanemail@gmail.com',
          nameFirst: 'Coby',
          nameLast: 'Sharp',
          handleStr: 'cobysharp',
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });
});
describe('HTTP tests for userProfileV1 feature', () => {
  beforeEach(() => {
    clearV1();
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
  test('test error /user/profile/v3 1', () => {
    const res = request('GET', `${url}:${port}/user/profile/v3`, {
      qs: {
        uId: authUser.authUserId,
      },
      headers: { token: 'not a token' },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj).toStrictEqual({ error: expect.any(Object) });
  });
  test('test error /user/profile/v3 2', () => {
    const res = request('GET', `${url}:${port}/user/profile/v3`, {
      qs: {
        uId: '5',
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toStrictEqual({ error: expect.any(Object) });
  });
  test('test success /user/profile/v3', () => {
    const res = request('GET', `${url}:${port}/user/profile/v3`, {
      qs: {
        uId: 1,
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual({
      user: {
        uId: 1,
        email: 'jackrobson@gmail.com',
        nameFirst: 'Jack',
        nameLast: 'Robson',
        handleStr: 'jackrobson',
        profileImgUrl: expect.any(String),
      },
    });
  });
});

describe('HTTP tests for userProfileUploadPhotoV1 feature', () => {
  beforeEach(() => {
    clearV1();
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
  test('test success /user/profile/uploadphoto/v1', () => {
    const res = request('POST', `${url}:${port}/user/profile/uploadphoto/v1`, {
      json: {
        imgUrl:
            'http://thefluffingtonpost.com/wp-content/uploads/2014/03/tumblr_n2ao9xGgsE1qdedm3o1_640.jpg',
        xStart: 0,
        yStart: 0,
        xEnd: 600,
        yEnd: 600,
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual({});
  });
  test('test fail /user/profile/uploadphoto/v1 1', () => {
    const res = request('POST', `${url}:${port}/user/profile/uploadphoto/v1`, {
      json: {
        imgUrl:
            'http://thefluffingtonpost.com/wp-content/uploads/2014/03/tumblr_n2ao9xGgsE1qdedm3o1_640.jpg',
        xStart: -1000,
        yStart: 0,
        xEnd: 600,
        yEnd: 600,
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual({ error: expect.any(Object) });
  });
  test('test fail /user/profile/uploadphoto/v1 2', () => {
    const res = request('POST', `${url}:${port}/user/profile/uploadphoto/v1`, {
      json: {
        imgUrl:
            'http://thefluffingtonpost.com/wp-content/uploads/2014/03/tumblr_n2ao9xGgsE1qdedm3o1_640.jpg',
        xStart: 0,
        yStart: -10000000,
        xEnd: 600,
        yEnd: 600,
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual({ error: expect.any(Object) });
  });
  test('test fail /user/profile/uploadphoto/v1 3', () => {
    const res = request('POST', `${url}:${port}/user/profile/uploadphoto/v1`, {
      json: {
        imgUrl:
            'http://thefluffingtonpost.com/wp-content/uploads/2014/03/tumblr_n2ao9xGgsE1qdedm3o1_640.jpg',
        xStart: 0,
        yStart: 0,
        xEnd: 6000000000000000000000000000000000000000000,
        yEnd: 600,
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual({ error: expect.any(Object) });
  });
  test('test fail /user/profile/uploadphoto/v1 4', () => {
    const res = request('POST', `${url}:${port}/user/profile/uploadphoto/v1`, {
      json: {
        imgUrl:
            'http://thefluffingtonpost.com/wp-content/uploads/2014/03/tumblr_n2ao9xGgsE1qdedm3o1_640.jpg',
        xStart: 0,
        yStart: 0,
        xEnd: 600,
        yEnd: 60000000000000000000000000000000000000000000000,
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual({ error: expect.any(Object) });
  });
  test('test fail /user/profile/uploadphoto/v1 5', () => {
    const res = request('POST', `${url}:${port}/user/profile/uploadphoto/v1`, {
      json: {
        imgUrl: 'not an image lol',
        xStart: 0,
        yStart: 0,
        xEnd: 600,
        yEnd: 600,
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual({ error: expect.any(Object) });
  });
  test('test fail /user/profile/uploadphoto/v1 6', () => {
    const res = request('POST', `${url}:${port}/user/profile/uploadphoto/v1`, {
      json: {
        imgUrl:
            'http://thefluffingtonpost.com/wp-content/uploads/2014/03/tumblr_n2ao9xGgsE1qdedm3o1_640.jpg',
        xStart: 0,
        yStart: 0,
        xEnd: 600,
        yEnd: 600,
      },
      headers: { token: 'not a token' },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj).toEqual({ error: expect.any(Object) });
  });
  test('test fail /user/profile/uploadphoto/v1 7', () => {
    const res = request('POST', `${url}:${port}/user/profile/uploadphoto/v1`, {
      json: {
        imgUrl:
            'http://thefluffingtonpost.com/wp-content/uploads/2014/03/tumblr_n2ao9xGgsE1qdedm3o1_640.jpg',
        xStart: 10,
        yStart: 10,
        xEnd: 9,
        yEnd: 600,
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual({ error: expect.any(Object) });
  });
  test('test fail /user/profile/uploadphoto/v1 8', () => {
    const res = request('POST', `${url}:${port}/user/profile/uploadphoto/v1`, {
      json: {
        imgUrl:
            'http://thefluffingtonpost.com/wp-content/uploads/2014/03/tumblr_n2ao9xGgsE1qdedm3o1_640.jpg',
        xStart: 10,
        yStart: 10,
        xEnd: 600,
        yEnd: 9,
      },
      headers: { token: authUser.token },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual({ error: expect.any(Object) });
  });
});
