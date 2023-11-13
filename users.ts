import { getData, setData } from './dataStore';
import validator from 'validator';
import crypto from 'crypto';
import HTTPError from 'http-errors';

/**
 * For a valid user, returns information about their user ID, email, first name,
 * last name, and handle
 *
 * @param {number} authUserId
 * @param {number} uId
 * @returns {error: {string}} - uId invalid, authUserId invalid
 * @returns {user: {uId: {number}, email: {string}, nameFirst {string}, nameLast {string},
 *           handleStr {string}}}
 */

function userProfileV1(token: string, uId: number) {
  const data = getData();
  let validToken = false;
  token = crypto
    .createHash('sha256')
    .update(token + 'secret')
    .digest('hex');
  for (const user of data.users) {
    if (user.tokens.includes(token) === true) {
      validToken = true;
    }
  }
  if (validToken === false) {
    throw HTTPError(403, 'invalid token');
  }
  for (const user1 of data.users) {
    if (user1.authUserId.toString() === uId.toString()) {
      const user = {
        uId: user1.authUserId,
        email: user1.email,
        nameFirst: user1.nameFirst,
        nameLast: user1.nameLast,
        handleStr: user1.handleStr,
        profileImgUrl: user1.profileImgUrl,
      };
      return { user: user };
    }
  }
  throw HTTPError(400, 'error');
}

function userProfileSetNameV1(
  token: string,
  nameFirst: string,
  nameLast: string
) {
  if (
    nameFirst.length < 1 ||
    nameFirst.length > 50 ||
    nameLast.length < 1 ||
    nameLast.length > 50
  ) {
    throw HTTPError(400, 'error');
  }
  const data = getData();
  token = crypto
    .createHash('sha256')
    .update(token + 'secret')
    .digest('hex');
  for (const user of data.users) {
    if (user.tokens.includes(token) === true) {
      user.nameFirst = nameFirst;
      user.nameLast = nameLast;
      setData(data);
      return {};
    }
  }
  throw HTTPError(403, 'invalid token');
}

function userProfileSetEmailV1(token: string, email: string) {
  if (validator.isEmail(email) === false) {
    throw HTTPError(400, 'error');
  }
  const data = getData();
  for (const user of data.users) {
    if (user.email === email) {
      throw HTTPError(400, 'error');
    }
  }

  token = crypto
    .createHash('sha256')
    .update(token + 'secret')
    .digest('hex');
  for (const user of data.users) {
    if (user.tokens.includes(token) === true) {
      user.email = email;
      setData(data);
      return {};
    }
  }
  throw HTTPError(403, 'invalid token');
}

function userProfileSetHandleV1(token: string, handleStr: string) {
  if (
    handleStr.length < 3 ||
    handleStr.length > 20 ||
    /[^a-zA-Z0-9]/.test(handleStr)
  ) {
    throw HTTPError(400, 'error');
  }
  const data = getData();
  for (const user of data.users) {
    if (user.handleStr === handleStr) {
      throw HTTPError(400, 'error');
    }
  }
  token = crypto
    .createHash('sha256')
    .update(token + 'secret')
    .digest('hex');
  for (const user of data.users) {
    if (user.tokens.includes(token) === true) {
      user.handleStr = handleStr;
      setData(data);
      return {};
    }
  }
  throw HTTPError(403, 'invalid token');
}

function usersAllV1(token: string) {
  const users = [];
  let validToken = false;
  const data = getData();
  token = crypto
    .createHash('sha256')
    .update(token + 'secret')
    .digest('hex');
  for (const user of data.users) {
    if (user.tokens.includes(token) === true) {
      validToken = true;
    }
  }
  if (validToken === false) {
    throw HTTPError(403, 'invalid token');
  }
  for (const user of data.users) {
    const currentUser = {
      uId: user.authUserId,
      email: user.email,
      nameFirst: user.nameFirst,
      nameLast: user.nameLast,
      handleStr: user.handleStr,
      profileImgUrl: user.profileImgUrl,
    };
    users.push(currentUser);
  }
  return { users: users };
}

function userProfileUploadPhotoV1(
  imgUrl: string,
  xStart: number,
  yStart: number,
  xEnd: number,
  yEnd: number,
  token: string
) {
  let validToken = false;
  const data = getData();
  token = crypto
    .createHash('sha256')
    .update(token + 'secret')
    .digest('hex');
  for (const user of data.users) {
    if (user.tokens.includes(token) === true) {
      validToken = true;
    }
  }
  if (validToken === false) {
    throw HTTPError(403, 'invalid token');
  }
  if (
    xStart >= xEnd ||
    yStart >= yEnd ||
    imgUrl.endsWith('.jpg') === false ||
    xStart < 0 ||
    yStart < 0
  ) {
    throw HTTPError(400, 'error');
  }
  if (xEnd > 1000 || yEnd > 1000) {
    throw HTTPError(400, 'error');
  }
  return {};
}

export {
  userProfileV1,
  userProfileSetNameV1,
  userProfileSetEmailV1,
  userProfileSetHandleV1,
  usersAllV1,
  userProfileUploadPhotoV1,
};
