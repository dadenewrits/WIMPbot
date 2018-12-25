const WizardScene = require('telegraf/scenes/wizard');
// const processing = require('../processing');
const { DELETE_USER_TRUE, DELETE_USER_FALSE, DELETE_USER_QUESTION } = require('../config');
const { mainMenu } = require('../menu');

const name = 'deleteUserScene';
let userMessage;

const scene = new WizardScene(
    name,
    (ctx) => {
        ctx.reply(DELETE_USER_QUESTION);
        userMessage = { id: 3 };
        return ctx.wizard.next();
    },
    (ctx) => {
        if (ctx.message.text === 'так'
            || ctx.message.text === 'да'
            || ctx.message.text === 'Так'
            || ctx.message.text === 'Да') {
            userMessage.userId = ctx.message.from.id;
            // send request (delete user)
            ctx.reply(DELETE_USER_TRUE, mainMenu);
            // processing(userMessage, ctx);
            return ctx.scene.leave();
        }
        ctx.reply(DELETE_USER_FALSE, mainMenu);
        return ctx.scene.leave();
    },
);

module.exports = {
    name,
    scene,
};
