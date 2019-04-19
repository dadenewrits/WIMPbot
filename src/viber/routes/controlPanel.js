const TextMessage = require('viber-bot').Message.Text;
const bot = require('../bot');
const keyboard = require('../menu');
const { PLATFORM_TYPE_VIBER } = require('../../config');
const { getUserActivity, getUserStep, setUserStep } = require('../../services');
const badRequest = require('../badRequest');

bot.onTextMessage(/controlPanel/, async (message, response) => {
  try {
    if (
      (await getUserStep({
        platformId: response.userProfile.id,
        platformType: PLATFORM_TYPE_VIBER,
      })) !== 1
    ) {
      badRequest(response.userProfile);
      return;
    }
    await setUserStep({
      platformId: response.userProfile.id,
      platformType: PLATFORM_TYPE_VIBER,
      value: 2,
    });
    const controlKeyboard = keyboard.controlPanel(
      await getUserActivity({
        platformId: response.userProfile.id,
        platformType: PLATFORM_TYPE_VIBER,
      }),
    );
    bot.sendMessage(
      response.userProfile,
      new TextMessage('Ви в панелі керування', controlKeyboard),
    );
  } catch (error) {
    console.log(error);
    badRequest(response.userProfile);
  }
});