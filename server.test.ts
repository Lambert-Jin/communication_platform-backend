import request from 'sync-request';
import config from './config.json';
import { clearV1 } from './other';
import { getData } from './dataStore';

const OK = 200;
const port: string = config.port;
const url: string = config.url;
let authUser: any;
let authUser1: any;
let channel: any;
let message: any;

function setChannel(token: string, name: string, isPublic: boolean) {
  const res = request('POST', `${url}:${port}/channels/create/v3`, {
    json: {
      name: name,
      isPublic: isPublic,
    },
    headers: {
      token: token,
    }
  });
  return JSON.parse(res.body as string);
}

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

describe('HTTP tests for Message feature', () => {
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
    channel = setChannel(authUser.token, 'channel01', true);
    const res1 = request('POST', `${url}:${port}/message/send/v2`, {
      json: {
        token: authUser.token,
        channelId: channel.channelId,
        message: 'Hello',
      },
    });
    message = JSON.parse(res1.body as string);
  });
  test('test successful /message/remove/v1', () => {
    const res = request('DELETE', `${url}:${port}/message/remove/v1`, {
      qs: {
        token: authUser.token,
        messageId: message.messageId,
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(bodyObj).toStrictEqual({});
  });
  test('test failure /message/remove/v2 1', () => {
    const res = request('DELETE', `${url}:${port}/message/remove/v2`, {
      qs: {
        token: authUser.token,
        messageId: 'not a messageId',
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });
  test('test failure /message/remove/v2 2', () => {
    const res = request('DELETE', `${url}:${port}/message/remove/v2`, {
      qs: {
        token: 'invalid token',
        messageId: message.messageId,
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });
  test('test failure /message/remove/v2 3', () => {
    const res1 = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'real@gmail.com',
        password: 'password12345',
        nameFirst: 'First',
        nameLast: 'Last',
      },
    });
    authUser1 = JSON.parse(res1.body as string);
    const res = request('DELETE', `${url}:${port}/message/remove/v2`, {
      qs: {
        token: authUser1.token,
        messageId: message.messageId,
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
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
