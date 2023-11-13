import { channel, getData, member, message, setData, user } from './dataStore';
import crypto from 'crypto';
import HTTPError from 'http-errors';

export function getStandupActive(channelId: number, token: string) {
  // Find the channel
  const data = getData();
  let time = -1;
  token = crypto
    .createHash('sha256')
    .update(token + 'secret')
    .digest('hex');

  const authUser = data.users.find((user: any) => user.tokens.includes(token));
  if (!authUser) {
    throw HTTPError(403, 'invalid token');
  }
  const channel = data.channels.find((channel: channel) => channel.channelId === channelId);
  // Check if the channel is valid
  if (!channel) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  // Check if the authorized user is a member of the channel
  const isMember = channel.allMembers.some((member: member) => member.uId === authUser.authUserId);
  if (!isMember) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }
  if (channel.standup.isActive) {
    time = channel.standup.finishTime;
  } else {
    time = null;
  }
  // Return the standup active status and timeFinish
  return {
    isActive: channel.standup.isActive,
    timeFinish: time
  };
}

export function startStandup(channelId: number, length: number, token: string) {
  const data = getData();
  token = crypto
    .createHash('sha256')
    .update(token + 'secret')
    .digest('hex');
  const authUser = data.users.find((user: any) => user.tokens.includes(token));
  if (!authUser) {
    throw HTTPError(403, 'invalid token');
  }
  const channel = data.channels.find((channel: channel) => channel.channelId === channelId);
  if (!channel) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }
  if (length < 0) {
    throw HTTPError(400, 'length is a negative integer');
  }
  if (channel.standup.isActive) {
    throw HTTPError(400, 'an active standup is currently running in the channel');
  }
  // Start the standup
  channel.standup = {
    isActive: true,
    startTime: Math.floor((new Date()).getTime() / 1000),
    finishTime: Math.floor((new Date()).getTime() / 1000) + length * 1000,
    length: length,
    messages: [],
    starter: authUser.authUserId,
  };
  setData(data);
  const timeFinish: number = Math.floor((new Date()).getTime() / 1000) + length * 1000;
  const authorizedUser = channel.allMembers.find((member: member) => member.uId === authUser.authUserId);

  if (!authorizedUser) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }

  setTimeout(() => {
    if (channel.standup.messages.length > 0) {
      // Package and send the standup messages
      const standupMessage: any = {
        messageId: Math.floor(Math.random() * Date.now()), // Assign a unique messageId
        uId: authUser.authUserId,
        message: channel.standup.messages.map((msg: message) => {
          const sender = data.users.find((user: user) => user.authUserId === msg.uId);
          const senderHandle = sender.handleStr;
          return `[${senderHandle}]: [${msg.message}]`;
        }).join('\n'),
        timeSent: Math.floor(Date.now() / 1000),
      };

      channel.messages.push(standupMessage);
    }
    channel.standup = {
      isActive: false,
      startTime: -1,
      length: -1,
      messages: [],
    };
    setData(data);
  }, length * 1000);
  return { timeFinish: timeFinish };
}

export function sendStandupMessage(channelId: number, message: string, token: string) {
  const data = getData();
  token = crypto
    .createHash('sha256')
    .update(token + 'secret')
    .digest('hex');
  const authUser = data.users.find((user: user) => user.tokens.includes(token));
  if (!authUser) {
    throw HTTPError(403, 'invalid token');
  }
  const channel = data.channels.find((channel: channel) => channel.channelId === channelId);
  if (!channel) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'length of message is over 1000 characters');
  }
  if (!channel.standup.isActive) {
    throw HTTPError(400, 'an active standup is not currently running in the channel');
  }
  const authorizedUser = channel.allMembers.find((member: member) => member.uId === authUser.authUserId);
  if (!authorizedUser) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }
  // Add the message to the standup queue
  const standupMessage: any = {
    messageId: Math.floor(Math.random() * Date.now()), // Assign a unique messageId
    uId: authUser.authUserId,
    message: message,
    timeSent: Math.floor(Date.now() / 1000),
  };

  channel.standup.messages.push(standupMessage);
  setData(data);
  return {};
}
