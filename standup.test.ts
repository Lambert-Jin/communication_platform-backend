import request from 'sync-request';
import config from './config.json';

const OK = 200;
const INPUT_ERROR = 400;
const forbidden = 403;
const port: string = config.port;
const url: string = config.url;
let authUser: any;
let authUser1: any;
let authUser2: any;
let channel: any;

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

describe('standup/start', () => {
  beforeEach(() => {
    request('DELETE', `${url}:${port}/clear/v1`);
    authUser = setAuthUser('example0@gmail.com', '111111', 'YIJIN', 'CHEN');
    authUser1 = setAuthUser('example1@gmail.com', '111111', 'aaa', 'bbb');
    authUser2 = setAuthUser('example1@gmail.com', '111111', 'ccc', 'ddd');
    channel = setChannel(authUser.token, 'channel01', true);
    request('POST', `${url}:${port}/channel/invite/v3`, {
      json: {
        channelId: channel.channelId,
        uId: authUser1.authUserId,
      },
      headers: {
        token: authUser.token,
      }
    });
  });
  afterEach(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
  });
  test('invalid channelId', () => {
    const res = request('POST', `${url}:${port}/standup/start/v1`, {
      json: {
        channelId: -1,
        length: 10,
      },
      headers: {
        token: authUser.token
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('invalid length', () => {
    const res = request('POST', `${url}:${port}/standup/start/v1`, {
      json: {
        channelId: channel.channelId,
        length: -1,
      },
      headers: {
        token: authUser.token
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('invalid token', () => {
    const res = request('POST', `${url}:${port}/standup/start/v1`, {
      json: {
        channelId: channel.channelId,
        length: 10,
      },
      headers: {
        token: '-1'
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(forbidden);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('no permission', () => {
    const res = request('POST', `${url}:${port}/standup/start/v1`, {
      json: {
        channelId: channel.channelId,
        length: 10,
      },
      headers: {
        token: authUser2.token
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(forbidden);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('valid input', async () => {
    const res = await request('POST', `${url}:${port}/standup/start/v1`, {
      json: {
        channelId: channel.channelId,
        length: 1,
      },
      headers: {
        token: authUser.token
      },
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ timeFinish: expect.any(Number) });
  });
});

describe('standup/send', () => {
  beforeEach(() => {
    request('DELETE', `${url}:${port}/clear/v1`);
    authUser = setAuthUser('example0@gmail.com', '111111', 'YIJIN', 'CHEN');
    authUser1 = setAuthUser('example1@gmail.com', '111111', 'aaa', 'bbb');
    authUser2 = setAuthUser('example1@gmail.com', '111111', 'ccc', 'ddd');
    channel = setChannel(authUser.token, 'channel01', true);
    request('POST', `${url}:${port}/channel/invite/v3`, {
      json: {
        channelId: channel.channelId,
        uId: authUser1.authUserId,
      },
      headers: {
        token: authUser.token,
      }
    });
  });
  test('invalid token', () => {
    startStandup(authUser.token, channel.channelId, 1);
    const res = request('POST', `${url}:${port}/standup/send/v1`, {
      json: {
        channelId: channel.channelId,
        message: 'text'
      },
      headers: {
        token: '-1'
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(forbidden);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('invalid channelId', () => {
    startStandup(authUser.token, channel.channelId, 1);
    const res = request('POST', `${url}:${port}/standup/send/v1`, {
      json: {
        channelId: -1,
        message: 'text'
      },
      headers: {
        token: authUser.token
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('to long message', () => {
    startStandup(authUser.token, channel.channelId, 1);
    const longMessage = 'a'.repeat(1001);
    const res = request('POST', `${url}:${port}/standup/send/v1`, {
      json: {
        channelId: -1,
        message: longMessage
      },
      headers: {
        token: authUser.token
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('standup is not active', () => {
    const res = request('POST', `${url}:${port}/standup/send/v1`, {
      json: {
        channelId: channel.channelId,
        message: 'text'
      },
      headers: {
        token: authUser.token
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('no permission', () => {
    startStandup(authUser.token, channel.channelId, 1);
    const res = request('POST', `${url}:${port}/standup/send/v1`, {
      json: {
        channelId: channel.channelId,
        message: 'text'
      },
      headers: {
        token: authUser2.token
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(forbidden);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('valid send', async() => {
    startStandup(authUser.token, channel.channelId, 100);
    const res = request('POST', `${url}:${port}/standup/send/v1`, {
      json: {
        channelId: channel.channelId,
        message: 'text'
      },
      headers: {
        token: authUser.token
      },
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });
});

describe('standup/active', () => {
  beforeEach(() => {
    request('DELETE', `${url}:${port}/clear/v1`);
    authUser = setAuthUser('example0@gmail.com', '111111', 'YIJIN', 'CHEN');
    authUser1 = setAuthUser('example1@gmail.com', '111111', 'aaa', 'bbb');
    authUser2 = setAuthUser('example1@gmail.com', '111111', 'ccc', 'ddd');
    channel = setChannel(authUser.token, 'channel01', true);
    request('POST', `${url}:${port}/channel/invite/v3`, {
      json: {
        channelId: channel.channelId,
        uId: authUser1.authUserId,
      },
      headers: {
        token: authUser.token,
      }
    });
  });
  afterEach(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  });
  test('invalid token', () => {
    startStandup(authUser.token, channel.channelId, 1);
    const res = request('GET', `${url}:${port}/standup/active/v1`, {
      qs: {
        channelId: channel.channelId,
      },
      headers: {
        token: '-1'
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(forbidden);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('invalid channelId', () => {
    startStandup(authUser.token, channel.channelId, 1);
    const res = request('GET', `${url}:${port}/standup/active/v1`, {
      qs: {
        channelId: -1,
      },
      headers: {
        token: authUser.token
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('no permission', () => {
    startStandup(authUser.token, channel.channelId, 1);
    const res = request('GET', `${url}:${port}/standup/active/v1`, {
      qs: {
        channelId: channel.channelId,
      },
      headers: {
        token: authUser2.token
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(forbidden);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('get active', () => {
    startStandup(authUser.token, channel.channelId, 1);
    const res = request('GET', `${url}:${port}/standup/active/v1`, {
      qs: {
        channelId: channel.channelId,
      },
      headers: {
        token: authUser.token
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ isActive: true, timeFinish: expect.any(Number) });
  });
});
