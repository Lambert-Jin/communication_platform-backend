import validator from 'validator';
import { getData, setData } from './dataStore';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import HTTPError from 'http-errors';
import { updateUtilization } from './stat';

const PORT = process.env.PORT || 3000;

/**
 * Creates a new account given a user's details including generating a user handle
 *
 * @param {string} email
 * @param {string} password
 * @param {string} nameFirst
 * @param {string} nameLast
 * @return {error: {string}} - invalid email, existing email, password < 6 characters,
 *                              nameFirst > 50 || nameFirst < 1, nameLast > 50 || nameLast < 1,
 * @returns {authUserId: {number}} - success
 */

function authRegisterV1(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
) {
  const data = getData();
  let validEmail = false;
  let usedEmail = true;
  let validPassword = true;
  let validFirstname = false;
  let validLastname = false;

  if (validator.isEmail(email)) {
    validEmail = true;
  }

  for (const user of data.users) {
    if (JSON.stringify(user.email) === JSON.stringify(email)) {
      usedEmail = false;
    }
  }

  if (password.length < 6) {
    validPassword = false;
  }

  if (nameFirst.length >= 1 && nameFirst.length <= 50) {
    validFirstname = true;
  }
  if (nameLast.length >= 1 && nameLast.length <= 50) {
    validLastname = true;
  }

  if (
    validEmail === false ||
    usedEmail === false ||
    validPassword === false ||
    validFirstname === false ||
    validLastname === false
  ) {
    throw HTTPError(400, 'error');
  }

  const uId = data.users.length + 1;
  let handle =
    nameFirst.replace(/[^a-z0-9]/gi, '').toLowerCase() +
    nameLast.replace(/[^a-z0-9]/gi, '').toLowerCase();
  handle = handle.substring(0, 20);
  let num = 0;
  for (const user of data.users) {
    if (
      JSON.stringify(user.handleStr.substring(0, 20)) === JSON.stringify(handle)
    ) {
      num++;
    }
  }
  if (num > 0) {
    handle = handle + String(num - 1);
  }
  const token = Math.random();
  const tokenString = token.toString();
  const tokens: string[] = [];
  tokens.push(
    crypto
      .createHash('sha256')
      .update(tokenString + 'secret')
      .digest('hex')
  );
  password = crypto
    .createHash('sha256')
    .update(password + 'secret')
    .digest('hex');

  const channelsJoined = [];
  channelsJoined.push({
    numChannelsJoined: 0,
    timeStamp: Math.floor(Date.now() / 1000)
  });
  const dmsJoined = [];
  dmsJoined.push({
    numDmsJoined: 0,
    timeStamp: Math.floor(Date.now() / 1000)
  });
  const messagesSent = [];
  messagesSent.push({
    numMessagesSent: 0,
    timeStamp: Math.floor(Date.now() / 1000)
  });

  const newUser = {
    authUserId: uId,
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
    handleStr: handle,
    tokens: tokens,
    profileImgUrl: `http://localhost:${PORT}/src/images/default.jpg`,
    userStats: {
      channelsJoined: channelsJoined,
      dmsJoined: dmsJoined,
      messagesSent: messagesSent,
      involvementRate: 0,
    }
  };
  data.users.push(newUser);
  setData(data);
  updateUtilization();
  return {
    token: tokenString,
    authUserId: newUser.authUserId,
  };
}

/**
 * Returns a users Id given their email and password
 *
 * @param {string} email
 * @param {string} password
 * @returns {error: {string}} - email does not belong to a user, password is incorrect
 * @returns {authUserId: {number}} - success
 */
function authLoginV1(email: string, password: string) {
  const data = getData();
  password = crypto
    .createHash('sha256')
    .update(password + 'secret')
    .digest('hex');
  for (const user of data.users) {
    // checks if email and password match
    if (user.email === email && user.password === password) {
      const token = Math.random();
      const tokenString = token.toString();
      user.tokens.push(
        crypto
          .createHash('sha256')
          .update(tokenString + 'secret')
          .digest('hex')
      );
      setData(data);
      return {
        token: tokenString,
        authUserId: user.authUserId,
      };
    }
  }
  // email or password does not exist
  throw HTTPError(400, 'error');
}

function authLogoutV1(token: string) {
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
  for (const user of data.users) {
    const index = user.tokens.indexOf(token);
    if (index > -1) {
      user.tokens.splice(index, 1);
    }
  }
  setData(data);
  return {};
}

function authPasswordResetRequestV1(email: string, token: string) {
  const data = getData();
  let validToken = false;
  let validEmail = false;
  const resetCode = Math.random().toString(36).slice(2, 10);
  token = crypto
    .createHash('sha256')
    .update(token + 'secret')
    .digest('hex');
  for (const user of data.users) {
    if (user.email.toString() === email.toString()) {
      validEmail = true;
    }
    if (user.tokens.includes(token) === true) {
      validToken = true;
    }
  }
  if (validToken === false) {
    throw HTTPError(403, 'invalid token');
  }
  for (const user of data.users) {
    if (user.email.toString() === email.toString()) {
      user.resetCode = resetCode;
      setData(data);
    }
  }
  if (validEmail === true) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'jackdavidrobson@gmail.com',
        pass: 'cjhornhdzjvacpag',
      },
    });
    const mailOptions = {
      from: 'jackdavidrobson@gmail.com', // sender address
      to: email, // list of receivers
      subject: 'Password reset code', // Subject line
      text: resetCode, // plain text body
    };
    transporter.sendMail(mailOptions, function (error: any, info: any) {
      console.log('Email sent: ' + info.response);
      // do something useful
    });
    return {};
  }
  return {};
}

function authPasswordResetResetV1(
  resetCode: string,
  newPassword: string,
  token: string
) {
  if (newPassword.length < 6) {
    throw HTTPError(400, 'error');
  }
  const data = getData();
  let validToken = false;
  let validResetCode = false;
  token = crypto
    .createHash('sha256')
    .update(token + 'secret')
    .digest('hex');
  for (const user of data.users) {
    if (user.tokens.includes(token) === true) {
      validToken = true;
    }
    if (user.resetCode === resetCode) {
      validResetCode = true;
    }
  }
  if (validToken === false) {
    throw HTTPError(403, 'invalid token');
  }
  if (validResetCode === false) {
    throw HTTPError(400, 'error');
  }
  newPassword = crypto
    .createHash('sha256')
    .update(newPassword + 'secret')
    .digest('hex');
  for (const user of data.users) {
    console.log(user.resetCode);
    console.log(data);
    if (user.resetCode.toString() === resetCode.toString()) {
      user.password = newPassword;
      user.resetCode = undefined;
      setData(data);
      console.log(data);
    }
  }
  return {};
}

export {
  authLoginV1,
  authRegisterV1,
  authLogoutV1,
  authPasswordResetRequestV1,
  authPasswordResetResetV1,
};
