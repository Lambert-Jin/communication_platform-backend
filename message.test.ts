import request from 'sync-request';
import config from './config.json';

const OK = 200;
const INPUT_ERROR = 400;
const forbidden = 403;
const port: string = config.port;
const url: string = config.url;
let authUser: any;
let authUser1: any;
let channel: any;
let dm: any;
let message: any;
let dmMessage: any;

function clearV1Req() {
  const res = request('DELETE', `${url}:${port}/clear/v1`, {
    qs: {},
  });
  return JSON.parse(res.body as string);
}

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

function setdm(token: string, uIds: number[]) {
  const res = request('POST', `${url}:${port}/dm/create/v2`, {
    json: {
      uIds: uIds,
    },
    headers: {
      token: token,
    }
  });
  return JSON.parse(res.body as string);
}

function edit(token: string, messageId: number, message: string) {
  return request('PUT', `${url}:${port}/message/edit/v1`, {
    json: {
      messageId: messageId,
      message: message,
    },
    headers: {
      token: token,
    }
  });
}

function send(token: string, channelId: number, message: string) {
  const res = request('POST', `${url}:${port}/message/send/v2`, {
    json: {
      channelId: channelId,
      message: message,
    },
    headers: {
      token: token,
    }
  });
  return JSON.parse(res.body as string);
}

function dmsend(token: string, dmId: number, message: string) {
  return request('POST', `${url}:${port}/message/senddm/v1`, {
    json: {
      dmId: dmId,
      message: message,
    },
    headers: {
      token: token,
    }
  });
}

describe('HTTP test for /message/edit/V1', () => {
  beforeEach(() => {
    clearV1Req();
    authUser = setAuthUser('example0@gmail.com', '111111', 'YIJIN', 'CHEN');
    authUser1 = setAuthUser('example1@gmail.com', '111111', 'aaa', 'bbb');
    channel = setChannel(authUser.token, 'channel01', true);
    dm = setdm(authUser.token, [authUser1.authUserId]);
    message = send(authUser.token, channel.channelId, 'text');
    dmMessage = dmsend(authUser.token, dm.dmId, 'text');
    dmMessage = JSON.parse(dmMessage.body as string);
  });
  test('Edit a message with a valid token and messageId', () => {
    const res = edit(authUser.token, message.messageId, 'Updated message');
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });
  test('Edit a message with an invalid token', () => {
    const res = edit(authUser.token + 2, message.messageId, 'Updated message');
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(forbidden);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('Edit a message with an invalid messageId', () => {
    const res = edit(authUser.token, message.messageId + 1, 'Updated message');
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('no permission to edit the message', () => {
    const res = edit(authUser1.token, message.messageId, 'Updated message');
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(forbidden);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('Attempt to edit a message with more than 1000 characters', () => {
    const longMessage = 'a'.repeat(1001);
    const res = edit(authUser.token, message.messageId, longMessage);
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('dm/Edit a message with a valid token and messageId', () => {
    const res = edit(authUser.token, dmMessage.messageId, 'Updated message');
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });
  test('dm/Edit a message with an invalid token', () => {
    const res = edit(
      authUser.token + 2,
      dmMessage.messageId,
      'Updated message'
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(forbidden);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('dm/Edit a message with an invalid messageId', () => {
    const res = edit(
      authUser.token,
      dmMessage.messageId + 1,
      'Updated message'
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('dm/no permission to edit the message', () => {
    const res = edit(authUser1.token, dmMessage.messageId, 'Updated message');
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(forbidden);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('dm/Attempt to edit a message with more than 1000 characters', () => {
    const longMessage = 'a'.repeat(1001);
    const res = edit(authUser.token, dmMessage.messageId, longMessage);
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
