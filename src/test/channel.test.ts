import request from 'sync-request';
import config from '../ts/config.json';

const OK = 200;
const INPUT_ERROR = 400;
const forbidden = 403;
const port: string = config.port;
const url: string = config.url;
let authUser: any;
let authUser1: any;
let channel: any;

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

function startStandup(token: string, channelId: number, length: number) {
  request('POST', `${url}:${port}/standup/start/v1`, {
    json: {
      channelId: channelId,
      length: length,
    },
    headers: {
      token: token
    },
  });
}
describe('HTTP test for /channel/invite/v3', () => {
  beforeEach(() => {
    clearV1Req();
    authUser = setAuthUser('example0@gmail.com', '111111', 'YIJIN', 'CHEN');
    authUser1 = setAuthUser('example1@gmail.com', '111111', 'aaa', 'bbb');
    channel = setChannel(authUser.token, 'channel01', true);
  });
  test('channelId does not refer to a valid channel', () => {
    const res = request('POST', `${url}:${port}/channel/invite/v3`, {
      json: {
        channelId: -1,
        uId: authUser1.authUserId,
      },
      headers: {
        token: authUser.token,
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('uId does not refer to a valid user', () => {
    const res = request('POST', `${url}:${port}/channel/invite/v3`, {
      json: {
        channelId: channel.channelId,
        uId: authUser1.authUserId + 1,
      },
      headers: {
        token: authUser.token,
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('uId refers to a user who is already a member of the channel', () => {
    request('POST', `${url}:${port}/channel/invite/v3`, {
      json: {
        token: authUser.token,
        channelId: channel.channelId,
        uId: authUser1.authUserId,
      },
    });
    const res = request('POST', `${url}:${port}/channel/invite/v3`, {
      json: {
        token: authUser.token,
        channelId: channel.channelId,
        uId: authUser1.authUserId,
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(forbidden);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const authUser2 = setAuthUser('example2@gmail.com', '111111', 'ccc', 'ddd');
    const res = request('POST', `${url}:${port}/channel/invite/v3`, {
      json: {
        channelId: channel.channelId,
        uId: authUser2.authUserId,
      },
      headers: {
        token: authUser1.token,
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(forbidden);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('authUserId is invalid', () => {
    const res = request('POST', `${url}:${port}/channel/invite/v3`, {
      json: {
        channelId: channel.channelId,
        uId: authUser1.authUserId,
      },
      headers: {
        token: authUser.token + 1,
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(forbidden);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('successful return', () => {
    const res = request('POST', `${url}:${port}/channel/invite/v3`, {
      json: {
        channelId: channel.channelId,
        uId: authUser1.authUserId,
      },
      headers: {
        token: authUser.token,
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });
});

describe('HTTP test for /channel/leave/V1', () => {
  beforeEach(() => {
    clearV1Req();
    authUser = setAuthUser('example0@gmail.com', '111111', 'YIJIN', 'CHEN');
    authUser1 = setAuthUser('example1@gmail.com', '111111', 'aaa', 'bbb');
    channel = setChannel(authUser.token, 'channel01', true);
  });

  test('Valid channel leave', () => {
    const res = request('POST', `${url}:${port}/channel/leave/v1`, {
      json: {
        channelId: channel.channelId,
      },
      headers: {
        token: authUser.token,
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });

  test('Invalid token', () => {
    const res = request('POST', `${url}:${port}/channel/leave/v1`, {
      json: {
        channelId: channel.channelId,
      },
      headers: {
        token: '-1',
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(forbidden);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Invalid channelId', () => {
    const res = request('POST', `${url}:${port}/channel/leave/v1`, {
      json: {
        channelId: -1,
      },
      headers: {
        token: authUser.token,
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('User not a member of the channel', () => {
    const res = request('POST', `${url}:${port}/channel/leave/v1`, {
      json: {
        channelId: channel.channelId,
      },
      headers: {
        token: authUser1.token,
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(forbidden);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('User is the starter of standup', () => {
    startStandup(authUser.token, channel.channelId, 1);
    const res = request('POST', `${url}:${port}/channel/leave/v1`, {
      json: {
        channelId: channel.channelId,
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
