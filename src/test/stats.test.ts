import request from 'sync-request';
import config from '../ts/config.json';

const OK = 200;
const forbidden = 403;
const port: string = config.port;
const url: string = config.url;
let authUser: any;
let authUser1: any;
let channel: any;
let channel1: any;
let dm: any;
let message: any;
let dmMessage: any;

function clearV1Req() {
  const res = request('DELETE', `${url}:${port}/clear/v1`, {
    qs: {},
  });
  return JSON.parse(res.body as string);
}
function setAuthUser(email: string, password: string, nameFirst: string, nameLast: string) {
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
  const res = request('POST', `${url}:${port}/message/senddm/v1`, {
    json: {
      dmId: dmId,
      message: message,
    },
    headers: {
      token: token,
    }
  });
  return JSON.parse(res.body as string);
}

describe('http test of user/stats', () => {
  beforeEach(() => {
    clearV1Req();
    authUser = setAuthUser('example0@gmail.com', '111111', 'YIJIN', 'CHEN');
    authUser1 = setAuthUser('example1@gmail.com', '111111', 'aaa', 'bbb');
    channel = setChannel(authUser.token, 'channel01', true);
    channel1 = setChannel(authUser1.token, 'channel02', true);
    dm = setdm(authUser.token, [authUser1.authUserId]);
    message = send(authUser.token, channel.channelId, 'text1');
    message = send(authUser.token, channel.channelId, 'text2');
    dmMessage = dmsend(authUser.token, dm.dmId, 'text1');
    dmMessage = dmsend(authUser.token, dm.dmId, 'text2');
  });
  test('invalid token', () => {
    const res = request('GET', `${url}:${port}/user/stats/v1`, {
      headers: {
        token: '-1'
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(forbidden);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('successful return', () => {
    const res = request('GET', `${url}:${port}/user/stats/v1`, {
      headers: {
        token: authUser.token
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({
      userStats: {
        channelsJoined: [
          {
            numChannelsJoined: 0,
            timeStamp: expect.any(Number)
          },
          {
            numChannelsJoined: 1,
            timeStamp: expect.any(Number)
          },
          {
            numChannelsJoined: 1,
            timeStamp: expect.any(Number)
          },
          {
            numChannelsJoined: 1,
            timeStamp: expect.any(Number)
          },
          {
            numChannelsJoined: 1,
            timeStamp: expect.any(Number)
          },
          {
            numChannelsJoined: 1,
            timeStamp: expect.any(Number)
          },
          {
            numChannelsJoined: 1,
            timeStamp: expect.any(Number)
          }
        ],
        dmsJoined: [
          {
            numDmsJoined: 0,
            timeStamp: expect.any(Number)
          },
          {
            numDmsJoined: 0,
            timeStamp: expect.any(Number)
          },
          {
            numDmsJoined: 1,
            timeStamp: expect.any(Number)
          },
          {
            numDmsJoined: 1,
            timeStamp: expect.any(Number)
          },
          {
            numDmsJoined: 1,
            timeStamp: expect.any(Number)
          },
          {
            numDmsJoined: 1,
            timeStamp: expect.any(Number)
          },
          {
            numDmsJoined: 1,
            timeStamp: expect.any(Number)
          }
        ],
        involvementRate: 0.8571428571428571,
        messagesSent: [
          {
            numMessagesSent: 0,
            timeStamp: expect.any(Number)
          },
          {
            numMessagesSent: 0,
            timeStamp: expect.any(Number)
          },
          {
            numMessagesSent: 0,
            timeStamp: expect.any(Number)
          },
          {
            numMessagesSent: 1,
            timeStamp: expect.any(Number)
          },
          {
            numMessagesSent: 2,
            timeStamp: expect.any(Number)
          },
          {
            numMessagesSent: 3,
            timeStamp: expect.any(Number)
          },
          {
            numMessagesSent: 4,
            timeStamp: expect.any(Number)
          }
        ]
      }
    });
  });
});

describe('http test of users/stats', () => {
  beforeEach(() => {
    clearV1Req();
    authUser = setAuthUser('example0@gmail.com', '111111', 'YIJIN', 'CHEN');
    authUser1 = setAuthUser('example1@gmail.com', '111111', 'aaa', 'bbb');
    channel = setChannel(authUser.token, 'channel01', true);
    channel1 = setChannel(authUser1.token, 'channel02', true);
    dm = setdm(authUser.token, [authUser1.authUserId]);
    message = send(authUser.token, channel.channelId, 'text1');
    message = send(authUser.token, channel.channelId, 'text2');
    dmMessage = dmsend(authUser.token, dm.dmId, 'text1');
    dmMessage = dmsend(authUser.token, dm.dmId, 'text2');
    setAuthUser('example2@gmail.com', '111111', 'ccc', 'ddd');
    setAuthUser('example3@gmail.com', '111111', 'eee', 'fff');
  });
  test('invalid token', () => {
    const res = request('GET', `${url}:${port}/users/stats/v1`, {
      headers: {
        token: '-1'
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(forbidden);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('successful return', () => {
    const res = request('GET', `${url}:${port}/users/stats/v1`, {
      headers: {
        token: authUser.token
      },
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({
      workspaceStats: {
        channelsExist: [
          {
            numChannelsExist: 0,
            timeStamp: expect.any(Number)
          },
          {
            numChannelsExist: 1,
            timeStamp: expect.any(Number)
          },
          {
            numChannelsExist: 2,
            timeStamp: expect.any(Number)
          },
          {
            numChannelsExist: 2,
            timeStamp: expect.any(Number)
          },
          {
            numChannelsExist: 2,
            timeStamp: expect.any(Number)
          },
          {
            numChannelsExist: 2,
            timeStamp: expect.any(Number)
          },
          {
            numChannelsExist: 2,
            timeStamp: expect.any(Number)
          },
          {
            numChannelsExist: 2,
            timeStamp: expect.any(Number)
          }
        ],
        dmsExist: [
          {
            numDmsExist: 0,
            timeStamp: expect.any(Number)
          },
          {
            numDmsExist: 0,
            timeStamp: expect.any(Number)
          },
          {
            numDmsExist: 0,
            timeStamp: expect.any(Number)
          },
          {
            numDmsExist: 1,
            timeStamp: expect.any(Number)
          },
          {
            numDmsExist: 1,
            timeStamp: expect.any(Number)
          },
          {
            numDmsExist: 1,
            timeStamp: expect.any(Number)
          },
          {
            numDmsExist: 1,
            timeStamp: expect.any(Number)
          },
          {
            numDmsExist: 1,
            timeStamp: expect.any(Number)
          }
        ],
        utilizationRate: 0.5,
        messagesExist: [
          {
            numMessagesExist: 0,
            timeStamp: expect.any(Number)
          },
          {
            numMessagesExist: 0,
            timeStamp: expect.any(Number)
          },
          {
            numMessagesExist: 0,
            timeStamp: expect.any(Number)
          },
          {
            numMessagesExist: 0,
            timeStamp: expect.any(Number)
          },
          {
            numMessagesExist: 1,
            timeStamp: expect.any(Number)
          },
          {
            numMessagesExist: 2,
            timeStamp: expect.any(Number)
          },
          {
            numMessagesExist: 3,
            timeStamp: expect.any(Number)
          },
          {
            numMessagesExist: 4,
            timeStamp: expect.any(Number)
          }
        ]
      }
    });
  });
});
