import * as fs from 'fs';

export interface user {
  email: string,
  password: string,
  authUserId: number,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  tokens: string[],
  resetCode: string,
  profileImgUrl: string,
  userStats: {
    channelsJoined: []
    dmsJoined: []
    messagesSent: []
    involvementRate: number
  }
}

export interface member {
  uId: number,
}

export interface react {
  uId: number,
  reactId: number,
}

export interface message {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
  reacts: react[],
  timeScheduled: number,
}
export interface standup {
  isActive: boolean,
  startTime: number,
  finishTime: number,
  length: number
  messages: message[],
  starter: number,
}
export interface channel {
  channelId: number,
  name: string,
  isPublic: boolean,
  ownerMembers: member[],
  allMembers: member[],
  messages: message[],
  pinned: message[],
  standup: standup,
}

export interface dm {
  dmId: number,
  name: string,
  ownerMembers: member[],
  allMembers: member[],
  messages: message[],
  pinned: message[],
}

export interface notification {
  uId: number,
  channelId: number,
  dmId: number,
  notificationMessage: string
}

export interface channelStatData {
  numChannelsExist: number,
  timeStamp: number,
}

export interface dmStatData {
  numDmsExist: number,
  timeStamp: number,
}
export interface msgStatData {
  numMessagesExist: number,
  timeStamp: number,
}

export interface workSpaceStat {
  channelsExist: channelStatData[],
  dmsExist: dmStatData[],
  messagesExist: msgStatData[],
  utilizationRate: number,
}
export interface data {
  dms: dm[],
  users: user[],
  channels: channel[],
  reacts: number[],
  notifications: notification[],
  workSpaceStat: workSpaceStat,
}

function initializeDataFile() {
  const initialData: data = {
    dms: [],
    users: [],
    channels: [],
    reacts: [1],
    notifications: [],
    workSpaceStat: {
      channelsExist: [],
      dmsExist: [],
      messagesExist: [],
      utilizationRate: 0,
    },
  };
  initialData.workSpaceStat.channelsExist.push({
    numChannelsExist: 0,
    timeStamp: Math.floor(Date.now() / 1000),
  });
  initialData.workSpaceStat.dmsExist.push({
    numDmsExist: 0,
    timeStamp: Math.floor(Date.now() / 1000),
  });
  initialData.workSpaceStat.messagesExist.push({
    numMessagesExist: 0,
    timeStamp: Math.floor(Date.now() / 1000),
  });

  if (!fs.existsSync('data.json')) {
    fs.writeFileSync('data.json', JSON.stringify(initialData), 'utf8');
  }
}

function getData() {
  const dbStr = fs.readFileSync('data.json');
  return JSON.parse(String(dbStr));
}

// Use set(newData) to pass in the entire data object, with modifications made
// - Only needs to be used if you replace the data store entirely
// - Javascript uses pass-by-reference for objects... read more here: https://stackoverflow.com/questions/13104494/does-javascript-pass-by-reference
// Hint: this function might be useful to edit in iteration 2

function setData(newData: data) {
  const jsonStr = JSON.stringify(newData);
  fs.writeFileSync('data.json', jsonStr, { flag: 'w' });
}

export { getData, setData, initializeDataFile };
