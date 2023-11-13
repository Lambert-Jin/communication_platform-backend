import { getData, setData } from './dataStore';
import { user, channel, message, member, react, dm } from './dataStore';
import crypto from 'crypto';
import HTTPError from 'http-errors';
import { updateUserStats, updateWorkspaceStats } from './stat';

function messageSendV2(token: string, channelId: number, message: string) {
  const dataStore = getData();
  token = crypto.createHash('sha256').update(token + 'secret').digest('hex');
  const user = dataStore.users.find((user: user) => user.tokens.includes(token));
  if (user === undefined) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }
  const channel = dataStore.channels.find((channel: channel) => channel.channelId === channelId);
  if (channel === undefined) {
    throw HTTPError(400, 'channel does not exist');
  } if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'message length invalid');
  }
  for (const member of channel.allMembers) {
    if (member.uId === user.authUserId) {
      // message id generation for unique & random
      const messageId = Math.floor(Math.random() * Date.now());
      const timeSent = Math.floor(Date.now() / 1000);
      channel.messages.push({
        messageId: messageId,
        uId: user.authUserId,
        message: message,
        timeSent: timeSent
      });
      setData(dataStore);
      updateUserStats(user.authUserId);
      updateWorkspaceStats();
      return { messageId: messageId };
    }
  }
  throw HTTPError(403, 'authorised user is not a member of the channel');
}

function messageEditV2(token: string, messageId: number, message: string) {
  const data = getData();
  token = crypto
    .createHash('sha256')
    .update(token + 'secret')
    .digest('hex');
  const authUser = data.users.find((user: any) => user.tokens.includes(token));
  if (!authUser) {
    throw HTTPError(403, 'Invalid token');
  }
  if (message.length > 1000) {
    throw HTTPError(400, 'Message length exceeds 1000 characters');
  }

  let messageFound = false;
  for (const channel of data.channels) {
    const messageIndex = channel.messages.findIndex((msg: message) => msg.messageId === messageId);
    if (messageIndex !== -1) {
      messageFound = true;
      const channelMessage = channel.messages[messageIndex];
      const isMember = channel.allMembers.some((member: any) => member.uId === authUser.authUserId);
      if (!isMember) {
        throw HTTPError(403, 'Not a member of the channel/DM');
      }
      const isOwner = channel.ownerMembers.some((owner: any) => owner.uId === authUser.authUserId);
      if (channelMessage.uId !== authUser.authUserId && !isOwner && authUser.authUserId !== 1) {
        throw HTTPError(403, 'No permission to edit the message');
      }
      channelMessage.message = message;
      setData(data);
      return {};
    }
  }
  for (const dm of data.dms) {
    const messageIndex = dm.messages.findIndex((msg: message) => msg.messageId === messageId);
    if (messageIndex !== -1) {
      messageFound = true;
      const dmMessage = dm.messages[messageIndex];
      const isMember = dm.allMembers.some((member: any) => member.uId === authUser.authUserId);
      if (!isMember) {
        throw HTTPError(403, 'Not a member of the channel/DM');
      }
      const isOwner = dm.ownerMembers.some((owner: any) => owner.uId === authUser.authUserId);
      if (dmMessage.uId !== authUser.authUserId && !isOwner) {
        throw HTTPError(403, 'No permission to edit the message');
      }
      if (message === '') {
        dm.messages.splice(messageIndex, 1);
      } else {
        dmMessage.message = message;
      }
      setData(data);
      return {};
    }
  }
  if (!messageFound) {
    throw HTTPError(400, 'Invalid messageId');
  }
}

function messageRemoveV1(token: string, messageId: number) {
  const data = getData();
  token = crypto.createHash('sha256').update(token + 'secret').digest('hex');
  const authUser = data.users.find((user: any) => user.tokens.includes(token));
  if (!authUser) return { error: 'Invalid token' };
  let messageFound = false;
  for (const channel of data.channels) {
    const messageIndex = channel.messages.findIndex((msg: any) => msg.messageId === messageId);
    if (messageIndex !== -1) {
      messageFound = true;
      const channelMessage = channel.messages[messageIndex];
      const isOwner = channel.ownerMembers.some((owner: any) => owner.uId === authUser.authUserId);
      if (channelMessage.uId !== authUser.authUserId && !isOwner && authUser.authUserId !== 1) {
        throw HTTPError(403, 'no permissions to edit message');
      }
      channel.messages.splice(messageIndex, 1);
      setData(data);
      updateWorkspaceStats();
      return {};
    }
  }
  for (const dm of data.dms) {
    const messageIndex = dm.messages.findIndex((msg: any) => msg.messageId === messageId);
    if (messageIndex !== -1) {
      messageFound = true;
      const dmMessage = dm.messages[messageIndex];
      const isOwner = dm.ownerMembers.some((owner: any) => owner.uId === authUser.authUserId);
      if (dmMessage.uId !== authUser.authUserId && !isOwner) {
        throw HTTPError(403, 'no permissions to edit message');
      }
      dm.messages.splice(messageIndex, 1);
      setData(data);
      updateWorkspaceStats();
      return {};
    }
  }
  if (!messageFound) {
    throw HTTPError(400, 'invalid messageId');
  }
}

function messageSendDm(token: string, dmId: number, message: string) {
  const dataStore = getData();
  token = crypto.createHash('sha256').update(token + 'secret').digest('hex');
  const user = dataStore.users.find((user: user) => user.tokens.includes(token));
  if (user === undefined) {
    throw HTTPError(403, 'token invalid');
  }
  if (message.length > 1000 || message.length < 1) throw HTTPError(400, 'message length error');
  for (const dm of dataStore.dms) {
    if (dm.dmId === dmId) {
      for (const member of dm.allMembers) {
        if (member.uId === user.authUserId) {
          const messageId = Math.floor(Math.random() * Date.now());
          const timeSent = Math.floor(Date.now() / 1000);
          dm.messages.push({
            messageId: messageId,
            uId: user.authUserId,
            message: message,
            timeSent: timeSent
          });
          setData(dataStore);
          updateUserStats(user.authUserId);
          updateWorkspaceStats();
          return { messageId: messageId };
        }
      }
      throw HTTPError(403, 'user is not a member of the dm');
    }
  }
  throw HTTPError(400, 'dmId does not refer to any existing dm');
}

function messageReactV1(token: string, messageId: number, reactId: number) {
  const dataStore = getData();
  token = crypto.createHash('sha256').update(token + 'secret').digest('hex');
  const user = dataStore.users.find((user: user) => user.tokens.includes(token));
  if (user === undefined) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }
  if (!dataStore.reacts.some(reactId)) return { error400: 'invalid react id' };
  for (const channel of dataStore.channels) {
    const message = channel.find((m: message) => m.messageId === messageId);
    if (message !== undefined && !message.reacts.some((r: react) => r.uId === user.authUserId)) {
      if (channel.allMembers.some((m: member) => m.uId === user.authUserId)) {
        message.reacts.push({
          uId: user.authUserId,
          reactId: reactId,
        });
        setData(dataStore);
        return {};
      }
      throw HTTPError(400, 'user is not a part of the channel');
    }
  }
  const dm = dataStore.dms.find((d: dm) => d.dmId === messageId);
  if (dm !== undefined && !dm.reacts.some((r: react) => r.uId === user.authUserId)) {
    if (dm.allMembers.some((m: member) => m.uId === user.authUserId)) {
      dm.reacts.push({
        uId: user.authUserId,
        reactId: reactId,
      });
      setData(dataStore);
      return {};
    }
    throw HTTPError(400, 'user is not a part of the dm');
  }
  throw HTTPError(400, 'messageId is not valid');
}

function messageUnreactV1(token: string, messageId: number, reactId: number) {
  const dataStore = getData();
  token = crypto.createHash('sha256').update(token + 'secret').digest('hex');
  const user = dataStore.users.find((user: user) => user.tokens.includes(token));
  if (user === undefined) throw HTTPError(403, 'token does not refer to a valid user');
  if (!dataStore.reacts.includes(reactId)) throw HTTPError(400, 'invalid react');
  const message = findmessagefromid(messageId);
  if (message === undefined) throw HTTPError(400, 'invalid messageId');
  for (const react of message.reacts) {
    if (react.uId === user.authUserId && react.reactId === reactId) {
      const index = message.reacts.indexOf(react);
      if (index === 0) {
        message.reacts = [];
      } else {
        message.reacts.splice(index, 1);
      }
      setData(dataStore);
    }
  }
  throw HTTPError(400, 'message does not contain a react with reactId from authuser');
}

function messagePinV1(token: string, messageId: number) {
  const dataStore = getData();
  token = crypto.createHash('sha256').update(token + 'secret').digest('hex');
  const channel = findchannelfromid(messageId);
  const message = findmessagefromid(messageId);
  const user = dataStore.users.find((user: user) => user.tokens.includes(token));

  if (user === undefined) throw HTTPError(403, 'token does not refer to a valid user');
  if (message === undefined) throw HTTPError(400, 'messageId is not valid');
  if (!channel.allMembers.includes({ uId: user.authUserId })) throw HTTPError(403, 'invalid perms');

  if (channel.pinned.includes(message)) throw HTTPError(400, 'message already pinned');
  channel.pinned.push(message);
  return {};
}

function messageUnpinV1(token: string, messageId: number) {
  const dataStore = getData();
  token = crypto.createHash('sha256').update(token + 'secret').digest('hex');
  const channel = findchannelfromid(messageId);
  const message = findmessagefromid(messageId);
  const user = dataStore.users.find((user: user) => user.tokens.includes(token));

  if (user === undefined) throw HTTPError(403, 'token does not refer to a valid user');
  if (message === undefined) throw HTTPError(400, 'messageId is not valid');
  if (!channel.allMembers.includes({ uId: user.authUserId })) throw HTTPError(403, 'invalid perms');

  if (!channel.pinned.includes(message)) throw HTTPError(400, 'message not pinned');
  const index = channel.pinned.indexOf(message);
  if (index === 0) {
    message.pinned = [];
  } else {
    channel.pinned.splice(index, 1);
  }
  return {};
}

function findmessagefromid(messageId: number) {
  const dataStore = getData();
  for (const channel of dataStore.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) return message;
    }
  }
  for (const dm of dataStore.dms) {
    for (const message of dm.message) {
      if (message.messageId === message) return message;
    }
  }
}

function findchannelfromid(messageId: number) {
  const dataStore = getData();
  for (const channel of dataStore.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) return channel;
    }
  }
  for (const dm of dataStore.dms) {
    for (const message of dm.message) {
      if (message.messageId === message) return dm;
    }
  }
}

export { messageSendV2, messageEditV2, messageRemoveV1, messageSendDm, messageReactV1, messageUnreactV1, messagePinV1, messageUnpinV1 };
