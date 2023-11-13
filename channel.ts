import { getData, setData } from './dataStore';
import { user, channel, member } from './dataStore';
import { userProfileV1 } from './users';
import crypto from 'crypto';
import HTTPError from 'http-errors';
import { updateUserStats, updateWorkspaceStats } from './stat';

function findUId(token: string) {
  const data = getData();
  token = crypto.createHash('sha256').update(token + 'secret').digest('hex');
  const user = data.users.find((user: user) => user.tokens.includes(token));
  if (user) { return user.uId; }
  throw HTTPError(403, 'invalid user');
}

/**
 * Retrieves a page of messages from a channel's message log, starting at the specified index.
 * @param token The authentication token of the requesting user.
 * @param channelId The ID of the channel whose message log is being queried.
 * @param start The index of the first message to retrieve.
 * @returns An object containing the requested messages, along with the start and end indices.
 */
export function channelMessagesV2(token: string, channelId: number, start: number) {
  // Check if the start parameter is valid
  if (!Number.isInteger(start) || start < 0) {
    return { error: 'Invalid start parameter' };
  }
  // Check the validity of the authentication token
  const uId = findUId(token);
  if (typeof uId !== 'number') {
    return uId;
  }
  // Check if the user is a member of the specified channel and the channel is valid
  const channelDetails = channelDetailsV2(token, channelId);
  if ('error' in channelDetails) {
    return channelDetails;
  }
  // Retrieve the relevant portion of the message log
  const messageLog = getData().channels[channelId - 1].messages;
  const endIndex = Math.min(start + 50, messageLog.length);
  const messages = messageLog.slice(start, endIndex);
  return {
    messages,
    start: start,
    end: (endIndex === messageLog.length) ? -1 : endIndex,
  };
}

/**
 * Given a channel with ID channelId that the authorised user is a member of, provides basic
 * details about the channel.
 *
 * @param {number} authUserId
 * @param {number} channelId
 * @return {error: {string}} - when channelId is invalid, authUserId is invalid, or member is not
 *                             apart of the channel.
 * @returns {name: {string}, isPublic: {boolean}, ownerMembers: Array[{member}],
*           allMembers: Array[{member}]}} - when no errors
*/
export function channelDetailsV2(token: string, channelId: number) {
  const dataStore = getData();
  token = crypto.createHash('sha256').update(token + 'secret').digest('hex');
  const user = dataStore.users.find((user: user) => user.tokens.includes(token));
  if (user === undefined) {
    throw HTTPError(403, 'token invalid');
  }
  const channel = dataStore.channels.find((channel: channel) => channel.channelId === channelId);
  if (channel === undefined) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  } else {
    const channelMembers = channel.allMembers;
    for (const member of channelMembers) {
      if (member.uId === user.authUserId) {
        return {
          name: channel.name,
          isPublic: channel.isPublic,
          ownerMembers: channel.ownerMembers,
          allMembers: channel.allMembers
        };
      }
    }
    throw HTTPError(403, 'user is not a member of the channel');
  }
}

export function channelLeaveV1(token: string, channelId: number) {
  const data = getData();
  token = crypto
    .createHash('sha256')
    .update(token + 'secret')
    .digest('hex');
  const authUser = data.users.find((user: user) => user.tokens.includes(token));
  if (!authUser) {
    throw HTTPError(403, 'Invalid token');
  }

  const channelIndex = data.channels.findIndex((channel: channel) => channel.channelId === channelId);
  if (channelIndex === -1) {
    throw HTTPError(400, 'Invalid channelId');
  }

  const channel = data.channels[channelIndex];
  if (channel.standup.starter === authUser.authUserId) {
    throw HTTPError(400, 'user is the starter of standup');
  }
  const memberIndex = channel.allMembers.findIndex((member: member) => member.uId === authUser.authUserId);
  if (memberIndex === -1) {
    throw HTTPError(403, 'The authorised user is not a member of the channel');
  }
  const ownerMemberIndex = channel.ownerMembers.findIndex((member: member) => member.uId === authUser.authUserId);
  if (ownerMemberIndex !== -1) {
    channel.ownerMembers.splice(ownerMemberIndex, 1);
  }
  channel.allMembers.splice(memberIndex, 1);
  setData(data);
  updateUserStats(authUser.authUserId);
  updateWorkspaceStats();
  return ({});
}

/**
 * Invites a user with ID uId to join a channel with ID channelId. Once invited, the user is
 * added to the channel immediately. In both public and private channels, all members are able
 * to invite users.
 *
 * @param {string} token
 * @param {number} channelId
 * @param {number} uId
 * @returns {error: {string}} - if channelId invalid, uId invalid, uId already exists in channel,
 *                              channelId is valid and authUserId is not a member, authUserId is
 *                              invalid
 * @returns {{}} - success
 */
export function channelInviteV2(token: string, channelId: number, uId: number) {
  const data = getData();
  token = crypto
    .createHash('sha256')
    .update(token + 'secret')
    .digest('hex');
  const user = data.users.find((user: user) => user.tokens.includes(token));
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }
  const channelIndex = data.channels.findIndex((channel: channel) => channel.channelId === channelId);
  if (channelIndex === -1) {
    throw HTTPError(400, 'Invalid channelId');
  }
  const targetUser = data.users.find((user: user) => user.authUserId === uId);
  if (!targetUser) {
    throw HTTPError(400, 'Invalid uId');
  }
  const channel = data.channels[channelIndex];
  const isAuthUserInChannel = channel.allMembers.some((member: member) => member.uId === user.authUserId);
  if (!isAuthUserInChannel) {
    throw HTTPError(403, 'Unauthorized user is not a member of the channel');
  }
  const isTargetUserInChannel = channel.allMembers.some((member: member) => member.uId === targetUser.authUserId);
  if (isTargetUserInChannel) {
    throw HTTPError(400, 'Target user is already a member of the channel');
  }
  channel.allMembers.push({ uId: targetUser.authUserId });
  setData(data);
  updateUserStats(uId);
  updateWorkspaceStats();
  return ({});
}

export function channelAddOwnerV2(token: string, channelId: number, uId: number) {
  const data = getData();
  token = crypto
    .createHash('sha256')
    .update(token + 'secret')
    .digest('hex');
  const owner = data.users.find((user: user) => user.tokens.includes(token));
  if (owner === undefined) {
    throw HTTPError(400, 'uId does not exist');
  }
  const ownerId = owner.authUserId;
  const channelDetails = channelDetailsV2(token, channelId);
  if (!channelDetails.allMembers.some((member: member) => member.uId === uId)) {
    throw HTTPError(400, 'invited user is not part of channel');
  }

  const memberDetails = userProfileV1(token, uId);
  if ('error' in memberDetails) {
    throw HTTPError(400, 'Memberdetails not valid');
  }

  const member = data.users.find((u: user) => u.authUserId === uId);
  if (member === undefined) {
    throw HTTPError(400, 'uId does not exist');
  }

  const channel = data.channels[channelId - 1];

  const isOwner = channel.ownerMembers.some((member: member) => member.uId === ownerId);
  const isMemberOwner = channel.ownerMembers.some((m: member) => m.uId === member.authUserId);
  if (!isOwner || isMemberOwner) {
    throw HTTPError(403, 'User doesnt have suffieicnet permissions');
  }
  channel.ownerMembers.push({
    uId: member.authUserId
  });
  channel.allMembers.push({
    uId: member.authUserId
  });
  setData(data);
  return {};
}

export function channelRemoveOwnerV2(token: string, channelId: number, ownerId: number) {
  const data = getData();
  token = crypto
    .createHash('sha256')
    .update(token + 'secret')
    .digest('hex');
  const authUserId = data.users.find((user: user) => user.tokens.includes(token)).authUserId;
  if (typeof authUserId !== 'number') {
    return authUserId;
  }

  const channelDetails = channelDetailsV2(token, channelId);
  if ('error' in channelDetails) {
    throw HTTPError(403, 'invited user is not part of channel');
  }

  const targetProfile = userProfileV1(token, ownerId);
  if ('error' in targetProfile) {
    throw HTTPError(400, 'invited user is not part of channel');
  }
  const channel = getData().channels[channelId - 1];
  const owners = channel.ownerMembers;

  const authUserIsOwner = owners.some((owner: member) => owner.uId === authUserId);
  const targetIsOwner = owners.some((owner: member) => owner.uId === ownerId);

  if (!authUserIsOwner || !targetIsOwner) {
    throw HTTPError(400, 'invited user is not part of channel');
  }

  if (authUserId === ownerId && owners.length === 1) {
    throw HTTPError(400, 'invited user is not part of channel');
  }

  const targetIndex = owners.findIndex((owner: member) => owner.uId === ownerId);
  owners.splice(targetIndex, 1);
  setData(getData());

  return {};
}

export function channelJoinV2(token: string, channelId: number) {
  const uId = findUId(token);
  if (typeof uId !== 'number') {
    throw HTTPError(403, 'invalid authuserid');
  }

  let isGlobalOwner = false;
  if (uId === 1) {
    isGlobalOwner = true;
  }

  const data = getData();

  if (channelId > data.channels.length) {
    throw HTTPError(400, 'error');
  }

  // Check if the user is already a member of the channel
  if (data.channels[channelId - 1].allMembers.some((member: member) => member.uId === uId)) {
    throw HTTPError(400, 'user already apart of channel');
  }

  // channel is public
  if (!data.channels[channelId - 1].isPublic && !isGlobalOwner) {
    throw HTTPError(403, 'User does not have permission');
  }
  // add to user to member list
  const channel = data.channels[channelId - 1];
  const user = data.users.find((u: user) => u.authUserId === uId);
  channel.allMembers.push({
    uId: user.authUserId
  });
  setData(data);
  updateUserStats(user.authUserId);
  updateWorkspaceStats();
  return {};
}
