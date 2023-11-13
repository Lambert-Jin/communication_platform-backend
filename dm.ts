import { getData, setData } from './dataStore';
import { user, message, member, dm } from './dataStore';
import { userProfileV1 } from './users';
import crypto from 'crypto';
import HTTPError from 'http-errors';
import { updateUserStats, updateWorkspaceStats } from './stat';

function dmCreateV1(token: string, uIds: number[]) {
  // uIds does not include creator
  const dataStore = getData();
  token = crypto.createHash('sha256').update(token + 'secret').digest('hex');
  const user = dataStore.users.find((user: user) => user.tokens.includes(token));
  if (user === undefined) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }
  // check for duplicate uids
  if ((new Set(uIds)).size !== uIds.length) {
    throw HTTPError(400, 'duplicate uids');
  }
  uIds.push(user.authUserId);
  const dmUsers = [];
  for (const uId of uIds) {
    if (!dataStore.users.some((user: user) => user.authUserId === uId)) {
      throw HTTPError(400, `${uId} does not refer to a valid user`);
    }
    dmUsers.push(dataStore.users.find((user: user) => user.authUserId === uId).handleStr);
  }
  dmUsers.sort();
  const dmName = dmUsers.join(', ');
  const allMembers:member[] = [];
  for (const uId of uIds) {
    allMembers.push({
      uId: uId
    });
  }
  const ownerMembers:member[] = [{
    uId: user.authUserId
  }];
  const messages:message[] = [];
  const dmId = Math.floor(Math.random() * Date.now());
  const newDm = {
    dmId: dmId,
    name: dmName,
    ownerMembers: ownerMembers,
    allMembers: allMembers,
    messages: messages,
  };
  dataStore.dms.push(newDm);
  setData(dataStore);
  updateUserStats(user.authUserId);
  updateWorkspaceStats();
  return { dmId };
}

function dmRemoveV1(token: string, dmId: number) {
  const dataStore = getData();
  token = crypto.createHash('sha256').update(token + 'secret').digest('hex');
  const user = dataStore.users.find((user: user) => user.tokens.includes(token));
  if (user === undefined) {
    throw HTTPError(403, 'token invalid');
  }
  for (const dm of dataStore.dms) {
    if (dm.dmId === dmId) {
      const isOwner = dm.ownerMembers.some((owner: any) => owner.uId === user.authUserId);
      if (isOwner) {
        const dmIndex = dataStore.dms.findIndex((dm: dm) => dm.dmId === dmId);
        dataStore.dms.splice(dmIndex, 1);
        setData(dataStore);
        updateUserStats(user.authUserId);
        updateWorkspaceStats();
        return {};
      }
      throw HTTPError(400, 'invalid permissions');
    }
  }
  throw HTTPError(400, 'invalid dmid');
}

function dmDetailsV1(token: string, dmId: number) {
  const data = getData();
  token = crypto.createHash('sha256').update(token + 'secret').digest('hex');
  const user = data.users.find((u:user) => u.tokens.includes(token));
  if (user === undefined) {
    throw HTTPError(403, 'invalid token');
  }
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      for (const member of dm.allMembers) {
        if (member.uId === user.authUserId) {
          const members = [];
          for (const m of dm.allMembers) {
            members.push(userProfileV1(token, m.uId));
          }
          return {
            name: dm.name,
            members: members
          };
        }
      }
      throw HTTPError(403, 'user not a member');
    }
  }
  throw HTTPError(400, 'dmId invalid');
}

function dmMessagesV1(token: string, dmId: number, start: number) {
  const data = getData();
  if (!Number.isInteger(start) || start < 0) {
    throw HTTPError(400, 'invalid start parameter');
  }
  const user = data.users.find((user: user) => user.tokens.includes(token));
  if (user === undefined) {
    throw HTTPError(403, 'invalid token');
  }
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      const userExists = dm.allMembers.some((member: member) => member.uId === user.authUserId);
      if (userExists) {
        const messageLog = dm.messages;
        const endIndex = Math.min(start + 50, messageLog.length);
        const messages = messageLog.slice(start, endIndex);
        return {
          messages,
          start: start,
          end: (endIndex === messageLog.length) ? -1 : endIndex,
        };
      } else {
        throw HTTPError(403, 'user not in dm');
      }
    }
  }
  throw HTTPError(400, 'dmId does not refer to a valid dm');
}

function dmListV1(token: string) {
  const data = getData();
  token = crypto.createHash('sha256').update(token + 'secret').digest('hex');
  const user = data.users.find((user:user) => user.tokens.includes(token));
  if (user === undefined) {
    throw HTTPError(403, 'invalid token');
  }
  const dmArray = [];
  for (const dm of data.dms) {
    if (dm.allMembers.some((member: member) => member.uId === user.authUserId)) {
      dmArray.push({
        dmId: dm.dmId,
        name: dm.name
      });
    }
  }
  setData(data);
  return { dms: dmArray };
}

function dmLeaveV1(token: string, dmId: number) {
  const data = getData();
  const users = data.users;
  const dms = data.dms;

  // Find the user by token
  token = crypto.createHash('sha256').update(token + 'secret').digest('hex');

  const user = users.find((user:user) => user.tokens.includes(token));
  if (!user) {
    throw HTTPError(403, 'invalid token');
  }
  // Find the dm by dmId
  const dm = dms.find((dm:dm) => dm.dmId === dmId);
  if (!dm) {
    throw HTTPError(400, 'invalid dmid');
  }
  // Check if user is a member of the dm
  if (!isDmMember(user, dm)) {
    throw HTTPError(403, 'User is not a member of the dm');
  }
  // Remove the user from the dm's allMembers array
  delete dm.allMembers[dm.allMembers.findIndex((u:member) => u.uId === user.authUserId)];
  setData(data);
  updateUserStats(user.authUserId);
  return {};
}

function isDmMember(user: user, dm: dm) {
  return dm.allMembers.some(u => u.uId === user.authUserId);
}

// need dmlist, dmleave, dmmessages,

export { dmCreateV1, dmRemoveV1, dmDetailsV1, dmMessagesV1, dmListV1, dmLeaveV1 };
