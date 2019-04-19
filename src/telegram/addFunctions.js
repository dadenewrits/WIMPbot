const bot = require('./bot');
const { MODER_BUTTON, MODERATOR_GROUP_ID, CREATE_MESSAGE_TEXTS } = require('../config');

function createMessage(request) {
  return `${CREATE_MESSAGE_TEXTS.TYPE} ${
    request.requestType === 'search'
      ? CREATE_MESSAGE_TEXTS.ANSWER_SEARCH
      : CREATE_MESSAGE_TEXTS.ANSWER_FOUND
  }
${CREATE_MESSAGE_TEXTS.PLATFORM} ${
    request.platformType === 'telegram'
      ? CREATE_MESSAGE_TEXTS.PLATFORM_TELEGRAM
      : CREATE_MESSAGE_TEXTS.PLATFORM_VIBER
  }
${CREATE_MESSAGE_TEXTS.SENDER} ${request.platformType === 'telegram' ? '@' : ''}${request.userName}
${CREATE_MESSAGE_TEXTS.DATE} ${request.creationDate.toLocaleString()}
${CREATE_MESSAGE_TEXTS.LOCATION} ${CREATE_MESSAGE_TEXTS.LOCATION_LINE_BEGIN}${request.latitude},${
    request.longitude
  }${CREATE_MESSAGE_TEXTS.LOCATION_LINE_END}
${CREATE_MESSAGE_TEXTS.MESSAGE_FROM_USER} ${request.message}`;
}

function sendPhotoMessageTelegram({ request, photo, chatId }) {
  bot.telegram.sendPhoto(chatId, photo, {
    caption: createMessage({
      requestType: request.request_type,
      platformType: request.platform_type,
      userName: request.user_name,
      creationDate: request.creation_date,
      message: request.message,
      latitude: request.location.y,
      longitude: request.location.x,
    }),
    parse_mode: 'HTML',
  });
}

function sendPhotoMessageToModerate({ request, moderatorId }) {
  bot.telegram.sendPhoto(moderatorId, request.photo, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MODER_BUTTON.APPROVE,
            callback_data: MODER_BUTTON.CB_MODERATE + request.reqId + MODER_BUTTON.CB_TRUE,
          },
        ],
        [
          {
            text: MODER_BUTTON.DECLINE,
            callback_data: MODER_BUTTON.CB_MODERATE + request.reqId + MODER_BUTTON.CB_FALSE,
          },
        ],
      ],
    },
    caption: createMessage(request),
    parse_mode: 'HTML',
  });
}

function sendMessageTelegram(id, message) {
  return bot.telegram.sendMessage(id, message);
}

function getFileLink(id) {
  return bot.telegram.getFileLink(id);
}

async function getNewPhotoId(url) {
  const photoId = await bot.telegram.sendPhoto(MODERATOR_GROUP_ID, url, {
    disable_notification: true,
  });
  bot.telegram.deleteMessage(MODERATOR_GROUP_ID, photoId.message_id);
  return photoId.photo[photoId.photo.length - 1].file_id;
}

async function sendPhotoStream(readStream) {
  const newPhotoId = await bot.telegram.sendPhoto(
    MODERATOR_GROUP_ID,
    { source: readStream },
    { disable_notification: true },
  );
  bot.telegram.deleteMessage(MODERATOR_GROUP_ID, newPhotoId.message_id);
  return newPhotoId.photo[newPhotoId.photo.length - 1].file_id;
}

module.exports = {
  sendPhotoMessageTelegram,
  sendPhotoMessageToModerate,
  sendMessageTelegram,
  getFileLink,
  sendPhotoStream,
  getNewPhotoId,
};
