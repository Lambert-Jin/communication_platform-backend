/* eslint-disable-next-line no-unused-vars */
import { data, getData, setData } from './dataStore';

/**
  * Resets the data of the program to a empty, fresh state
  *
  * @param {}
  * @returns {}
*/
function clearV1() {
  const data: any = {
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
  data.workSpaceStat.channelsExist.push({
    numChannelsExist: 0,
    timeStamp: Math.floor(Date.now() / 1000),
  });
  data.workSpaceStat.dmsExist.push({
    numDmsExist: 0,
    timeStamp: Math.floor(Date.now() / 1000),
  });
  data.workSpaceStat.messagesExist.push({
    numMessagesExist: 0,
    timeStamp: Math.floor(Date.now() / 1000),
  });
  setData(data);
  return {};
}

export { clearV1 };
