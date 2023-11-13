/* eslint-disable-next-line no-unused-vars */
import { getData, setData } from './dataStore';
/* eslint-disable-next-line no-unused-vars */
import { userProfileV1 } from './users';
import { message, user, member, standup } from './dataStore';
import crypto from 'crypto';
import HTTPError from 'http-errors';
import { updateUserStats, updateWorkspaceStats } from './stat';

/**
 * Create a new channel with the a string name, that is either public or private
 * User who creates the channel joins the channel automatically as its owner
 * Functions returns the channel's ID
 *
 * @param {string} token
 * @param {string} name
 * @param {boolean} isPublic
 * @returns {error: {string}} - when authUserId is invalid or name.length < 1 || name.length > 20.
 * @returns {channelId: {number}} - when no errors
 */
function channelsCreateV2(token: string, name: string, isPublic: boolean) {
  const data = getData();
  token = crypto
    .createHash('sha256')
    .update(token + 'secret')
    .digest('hex');
  const user = data.users.find((user:user) => user.tokens.includes(token));
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }
  if (name.length < 1 || name.length > 20) {
    throw HTTPError(400, 'Channel length invalid');
  }
  const channelId = data.channels.length + 1;
  const all = [];
  const owner = [];
  const messages: message[] = [];
  all.push({ uId: user.authUserId });
  owner.push({ uId: user.authUserId });
  const standup: standup = {
    isActive: false,
    startTime: -1,
    finishTime: -1,
    length: -1,
    messages: [],
    starter: -1,
  };
  const channel = {
    channelId: channelId,
    name: name,
    isPublic: isPublic,
    allMembers: all,
    ownerMembers: owner,
    messages: messages,
    standup: standup,
  };
  data.channels.push(channel);
  setData(data);
  updateUserStats(user.authUserId);
  updateWorkspaceStats();
  return { channelId: channelId };
}

/**
  * Returns an array of objects containing the ID's of channels and the names
  * of all the channels the user is in, including private channels
  *
  * @param { integer } authUserId
  * @return {error: {string} } - when authUserId is invalid
  * @return {Array[{channelId: number, name: string}] } - when no errors
*/
function channelsListV2(token: string) {
  const dataStore = getData();
  token = crypto.createHash('sha256').update(token + 'secret').digest('hex');
  const user = dataStore.users.find((user: user) => user.tokens.includes(token));
  if (user === undefined) {
    throw HTTPError(403, 'invalid token');
  }
  const channels = [];
  for (const channel of dataStore.channels) {
    if (channel.allMembers.some((member:member) => member.uId === user.authUserId)) {
      channels.push({
        channelId: channel.channelId,
        name: channel.name
      });
    }
  }
  return { channels };
}

/**
  * Provides an array of all channels, including private channels and their associated details
  *
  * @param {number} authUserId
  * @return {error: {string} } - when authUserId is invalid
  * @returns {Array[{channelId: number, name: string}]} - when no errors
*/
function channelsListAllV2(token: string) {
  const dataStore = getData();
  token = crypto.createHash('sha256').update(token + 'secret').digest('hex');
  const user = dataStore.users.find((user: user) => user.tokens.includes(token));
  if (user === undefined) {
    throw HTTPError(403, 'invalid token');
  }
  const channels = [];
  for (const channel of dataStore.channels) {
    channels.push({
      channelId: channel.channelId,
      name: channel.name
    });
  }
  return { channels };
}

export { channelsCreateV2, channelsListV2, channelsListAllV2 };
