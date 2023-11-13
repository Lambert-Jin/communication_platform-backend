// stats.ts
import { user, channel, dm, message, member, setData } from './dataStore';
import { getData } from './dataStore';
import crypto from 'crypto';
import HTTPError from 'http-errors';

export function updateUserStats(authUserId: number):{} {
  const data = getData();
  const authUser = data.users.find((user: user) => user.authUserId === authUserId);
  if (!authUser) {
    throw HTTPError(403, 'invalid token');
  }

  const channelsWithUser = data.channels.filter((channel: channel) => channel.allMembers.some((member: member) => member.uId === authUser.authUserId));
  const numChannelsJoined = channelsWithUser.length;
  const dmsWithUser = data.dms.filter((dm: dm) => dm.allMembers.some(member => member.uId === authUser.authUserId));
  const numDmsJoined = dmsWithUser.length;
  const channelMessagesByUser = data.channels.flatMap((channel: channel) => channel.messages).filter((message: message) => message.uId === authUser.authUserId);
  const dmMessagesByUser = data.dms.flatMap((dm: dm) => dm.messages).filter((message: message) => message.uId === authUser.authUserId);
  const numMsgsSent = channelMessagesByUser.length + dmMessagesByUser.length;
  const totalChannels = data.channels.length;
  const totalDms = data.dms.length;
  const totalMsgs = data.channels.flatMap((channel: channel) => channel.messages).length + data.dms.flatMap((dm: dm) => dm.messages).length;
  let involvement = (numChannelsJoined + numDmsJoined + numMsgsSent) / (totalChannels + totalDms + totalMsgs);
  involvement = isNaN(involvement) ? 0 : Math.min(involvement, 1);
  authUser.userStats.channelsJoined.push({
    numChannelsJoined: numChannelsJoined,
    timeStamp: Math.floor(Date.now() / 1000)
  });
  authUser.userStats.dmsJoined.push({
    numDmsJoined: numDmsJoined,
    timeStamp: Math.floor(Date.now() / 1000)
  });
  authUser.userStats.messagesSent.push({
    numMessagesSent: numMsgsSent,
    timeStamp: Math.floor(Date.now() / 1000)
  });
  authUser.userStats.involvementRate = involvement;
  setData(data);
  return {};
}

export function getUserStats(token: string) {
  const data = getData();
  token = crypto
    .createHash('sha256')
    .update(token + 'secret')
    .digest('hex');
  const authUser = data.users.find((user: any) => user.tokens.includes(token));
  if (!authUser) {
    throw HTTPError(403, 'invalid token');
  }
  return { userStats: authUser.userStats };
}

export function updateWorkspaceStats(): {} {
  const data = getData();
  const numChannels = data.channels.length;
  const numDms = data.dms.length;

  const allChannelMessages = data.channels.flatMap((channel: channel) => channel.messages);
  const allDmMessages = data.dms.flatMap((dm: dm) => dm.messages);
  const numMsgs = allChannelMessages.length + allDmMessages.length;
  const numUsers = data.users.length;
  const usersInChannels = data.users.filter((user: user) => data.channels.some((channel: channel) => channel.allMembers.some((member: member) => member.uId === user.authUserId)));
  const usersInDms = data.users.filter((user: user) => data.dms.some((dm: dm) => dm.allMembers.some((member: member) => member.uId === user.authUserId)));
  const activeUser = new Set([...usersInChannels, ...usersInDms]).size;
  const utilization: number = activeUser / numUsers;
  data.workSpaceStat.channelsExist.push({
    numChannelsExist: numChannels,
    timeStamp: Math.floor(Date.now() / 1000)
  });
  data.workSpaceStat.dmsExist.push({
    numDmsExist: numDms,
    timeStamp: Math.floor(Date.now() / 1000)
  });
  data.workSpaceStat.messagesExist.push({
    numMessagesExist: numMsgs,
    timeStamp: Math.floor(Date.now() / 1000)
  });
  data.workSpaceStat.utilizationRate = utilization;
  setData(data);
  return {};
}

export function getWorkspaceStats(token: string) {
  const data = getData();
  token = crypto
    .createHash('sha256')
    .update(token + 'secret')
    .digest('hex');
  const authUser = data.users.find((user: any) => user.tokens.includes(token));
  if (!authUser) {
    throw HTTPError(403, 'invalid token');
  }
  return { workspaceStats: data.workSpaceStat };
}

export function updateUtilization() {
  const data = getData();
  const numUsers = data.users.length;
  const usersInChannels = data.users.filter((user: user) => data.channels.some((channel: channel) => channel.allMembers.some((member: member) => member.uId === user.authUserId)));
  const usersInDms = data.users.filter((user: user) => data.dms.some((dm: dm) => dm.allMembers.some((member: member) => member.uId === user.authUserId)));
  const activeUser = new Set([...usersInChannels, ...usersInDms]).size;
  data.workSpaceStat.utilizationRate = activeUser / numUsers;
  setData(data);
  return {};
}
