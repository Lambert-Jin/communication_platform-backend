import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from '../../config.json';
import cors from 'cors';
import { initializeDataFile } from './dataStore';
import {
  authRegisterV1,
  authLogoutV1,
  authLoginV1,
  authPasswordResetRequestV1,
  authPasswordResetResetV1,
} from './auth';
import {
  channelInviteV2,
  channelLeaveV1,
  channelDetailsV2,
  channelAddOwnerV2,
  channelJoinV2,
  channelMessagesV2,
  channelRemoveOwnerV2,
} from './channel';
import {
  messageSendV2,
  messageEditV2,
  messageRemoveV1,
  messageSendDm,
  messagePinV1,
  messageUnpinV1,
  messageReactV1,
  messageUnreactV1,
} from './message';
import {
  dmCreateV1,
  dmDetailsV1,
  dmRemoveV1,
  dmMessagesV1,
  dmListV1,
  dmLeaveV1,
} from './dm';
import {
  channelsCreateV2,
  channelsListV2,
  channelsListAllV2,
} from './channels';
import { clearV1 } from './other';
import {
  startStandup,
  getStandupActive,
  sendStandupMessage,
} from './standup';
import {
  userProfileV1,
  userProfileSetNameV1,
  userProfileSetEmailV1,
  userProfileSetHandleV1,
  usersAllV1,
  userProfileUploadPhotoV1,
} from './users';
import errorHandler from 'middleware-http-errors';
import { getUserStats, getWorkspaceStats } from './stat';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

initializeDataFile();

// Example get request
app.get('/echo', (req: Request, res: Response, next) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

app.get('/user/stats/v1', (req: Request, res: Response) => {
  const token: string = req.header('token');
  res.json(getUserStats(token));
});

app.get('/users/stats/v1', (req: Request, res: Response) => {
  const token: string = req.header('token');
  res.json(getWorkspaceStats(token));
});

app.post('/standup/send', (req: Request, res: Response) => {
  const {
    channelId,
    message
  } = req.body;
  const token: string = req.header('token');
  res.json(sendStandupMessage(channelId, message, token));
});

app.post('/standup/start/v1', (req: Request, res: Response) => {
  const {
    channelId,
    length
  } = req.body;
  const token: string = req.header('token');
  res.json(startStandup(channelId, length, token));
});

app.get('/standup/active', (req: Request, res: Response) => {
  const channelId: number = parseInt(req.query.channelId as string);
  const token: string = req.header('token');
  res.json(getStandupActive(channelId, token));
});

app.post('/auth/register/v3', (req: Request, res: Response) => {
  const {
    email,
    password,
    nameFirst,
    nameLast
  } = req.body;
  const result = authRegisterV1(email, password, nameFirst, nameLast);
  res.json(result);
});
app.post('/channel/leave/v1', (req, res) => {
  const { channelId } = req.body;
  const token: string = req.header('token');
  const result = channelLeaveV1(token, channelId);
  res.json(result);
});

app.post('/channels/create/v3', (req: Request, res: Response) => {
  const {
    name,
    isPublic
  } = req.body;
  const token: string = req.header('token');
  const result = channelsCreateV2(token, name, isPublic);
  res.json(result);
});

app.post('/channel/invite/v3', (req: Request, res: Response) => {
  const {
    channelId,
    uId
  } = req.body;
  const token: string = req.header('token');
  res.json(channelInviteV2(token, channelId, uId));
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});

app.post('/auth/login/v3', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = authLoginV1(email, password);
  res.json(result);
});

app.post('/auth/logout/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const result = authLogoutV1(token);
  res.json(result);
});

app.get('/channels/list/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  res.json(channelsListV2(token));
});

app.get('/channels/listall/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  res.json(channelsListAllV2(token));
});

app.get('/channel/details/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const channelId = parseInt(req.query.channelId as string);
  res.json(channelDetailsV2(token, channelId));
});

app.post('/channel/join/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId } = req.body;
  res.json(channelJoinV2(token, channelId));
});

app.get('/channel/messages/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const channelId = parseInt(req.query.channelId as string);
  const start = parseInt(req.query.start as string);
  res.json(channelMessagesV2(token, channelId, start));
});

app.get('/user/profile/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const uId = parseInt(req.query.uId as string);
  const result = userProfileV1(token, uId);
  res.json(result);
});

app.post('/message/send/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId, message } = req.body;
  res.json(messageSendV2(token, channelId, message));
});

app.post('/message/pin/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { messageId } = req.body;
  res.json(messagePinV1(token, messageId));
});

app.post('/message/unpin/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { messageId } = req.body;
  res.json(messageUnpinV1(token, messageId));
});

app.post('/standup/send/v1', (req: Request, res: Response) => {
  const {
    channelId,
    message
  } = req.body;
  const token: string = req.header('token');
  res.json(sendStandupMessage(channelId, message, token));
});

app.post('/standup/start/v1', (req: Request, res: Response) => {
  const {
    channelId,
    length
  } = req.body;
  const token: string = req.header('token');
  res.json(startStandup(channelId, length, token));
});

app.get('/standup/active/v1', (req: Request, res: Response) => {
  const channelId: number = parseInt(req.query.channelId as string);
  const token: string = req.header('token');
  res.json(getStandupActive(channelId, token));
});

app.post('/message/react/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { messageId, reactId } = req.body;
  res.json(messageReactV1(token, messageId, reactId));
});

app.post('/message/unreact/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { messageId, reactId } = req.body;
  res.json(messageUnreactV1(token, messageId, reactId));
});

app.delete('/clear/v1', (req: Request, res: Response) => {
  res.json(clearV1());
});

app.post('/channel/leave/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId } = req.body;
  res.json(channelLeaveV1(token, channelId));
});

app.post('/channel/addowner/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId, uId } = req.body;
  res.json(channelAddOwnerV2(token, channelId, uId));
});

app.post('/channel/removeowner/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId, uId } = req.body;
  res.json(channelRemoveOwnerV2(token, channelId, uId));
});

app.post('/message/send/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId, message } = req.body;
  const result = messageSendV2(token, channelId, message);
  res.json(result);
});

app.post('/message/senddm/v1', (req: Request, res: Response) => {
  const {
    dmId,
    message
  } = req.body;
  const token: string = req.header('token');
  const result = messageSendDm(token, dmId, message);
  res.json(result);
});

app.put('/message/edit/v1', (req: Request, res: Response) => {
  const {
    messageId,
    message
  } = req.body;
  const token = req.header('token');
  const result = messageEditV2(token, messageId, message);
  res.json(result);
});

app.delete('/message/remove/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const messageId = parseInt(req.query.messageId as string);
  res.json(messageRemoveV1(token, messageId));
});

app.delete('/dm/remove/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const dmId = parseInt(req.query.dmId as string);
  res.json(dmRemoveV1(token, dmId));
});

app.post('/dm/create/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { uIds } = req.body;
  res.json(dmCreateV1(token, uIds));
});

app.get('/dm/messages/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const dmId = parseInt(req.query.dmId as string);
  const start = parseInt(req.query.start as string);
  res.json(dmMessagesV1(token, dmId, start));
});

app.post('/message/senddm/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { dmId, message } = req.body;
  res.json(messageSendV2(token, dmId, message));
});

app.post('/dm/leave/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { dmId } = req.body;
  res.json(dmLeaveV1(token, dmId));
});

app.get('/dm/details/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const dmId = req.query.dmId as string;
  res.json(dmDetailsV1(token, parseInt(dmId)));
});

app.get('/dm/list/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  res.json(dmListV1(token));
});

app.put('/user/profile/setname/v2', (req: Request, res: Response) => {
  const { nameFirst, nameLast } = req.body;
  const token = req.header('token');
  const result = userProfileSetNameV1(token, nameFirst, nameLast);
  res.json(result);
});

app.put('/user/profile/setemail/v2', (req: Request, res: Response) => {
  const { email } = req.body;
  const token = req.header('token');
  const result = userProfileSetEmailV1(token, email);
  res.json(result);
});

app.put('/user/profile/sethandle/v2', (req: Request, res: Response) => {
  const { handleStr } = req.body;
  const token = req.header('token');
  const result = userProfileSetHandleV1(token, handleStr);
  res.json(result);
});

app.get('/users/all/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const result = usersAllV1(token);
  res.json(result);
});

app.post('/user/profile/uploadphoto/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { imgUrl, xStart, yStart, xEnd, yEnd } = req.body;
  const result = userProfileUploadPhotoV1(
    imgUrl,
    xStart,
    yStart,
    xEnd,
    yEnd,
    token
  );
  res.json(result);
});

app.post('/auth/passwordreset/request/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { email } = req.body;
  const result = authPasswordResetRequestV1(email, token);
  res.json(result);
});

app.post('/auth/passwordreset/reset/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { resetCode, newPassword } = req.body;
  const result = authPasswordResetResetV1(resetCode, newPassword, token);
  res.json(result);
});

app.use(errorHandler());
