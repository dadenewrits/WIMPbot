const { user, requests } = require('../db');

async function registerUser({ platformId, platformType, userName, latitude, longitude }) {
  await user.create(platformId, platformType, userName, latitude, longitude);
}

async function changeUserActivity({ platformId, platformType, value }) {
  await user.changeActivity(platformId, platformType, value);
}

async function createRequest(request) {
  const createdRequest = await requests.create(request);
  return createdRequest;
}

async function userRequests({ platformId, platformType }) {
  const arrOfRequests = await requests.findToDelete(platformId, platformType);
  return arrOfRequests;
}

async function deleteRequest(id) {
  await requests.deleteRequest(id);
}

async function userActivity({ platformId, platformType }) {
  const value = await user.activeValue(platformId, platformType);
  return value;
}

async function getRequests({ platformId, platformType, radius, days }) {
  const infoRequests = await requests.search(platformId, platformType, radius, days);
  return infoRequests;
}

async function changeRequestActiveStatus({ reqId, value, moderatorId }) {
  const request = await requests.changeActiveStatus(reqId, value, moderatorId);
  return request;
}

async function usersInRequestRadius(location) {
  const users = await user.usersInRequestRadius(location);
  return users;
}

async function getBadRequestCount({ platformId, platformType }) {
  const count = await user.badRequestCount({ platformId, platformType });
  return count;
}

module.exports = {
  registerUser,
  changeUserActivity,
  createRequest,
  userRequests,
  getRequests,
  deleteRequest,
  userActivity,
  changeRequestActiveStatus,
  usersInRequestRadius,
  getBadRequestCount,
};
