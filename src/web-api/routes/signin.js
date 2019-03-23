const path = require('path');
const validator = require('../utils/validator');
const { getUserId } = require('../../services');
const { WEB_API_V1_PREFIX, WEB_API_PATH_SIGNIN, PLATFORM_TYPE_TELEGRAM } = require('../../config');
const { setError } = require('../utils/error-handling');
const authorize = require('../utils/telegram-authorization');
// const { getUserCredentials } = require('../utils/web-token');

const route = path.join(WEB_API_V1_PREFIX, WEB_API_PATH_SIGNIN);

function formBody({ registered, token }) {
  return { ...setError(), registered, token };
}

async function handleRoute(ctx) {
  const payload = { ...ctx.request.query };
  try {
    authorize(payload);
  } catch (err) {
    ctx.throw(401, `Authorization failed: ${err.message}`);
  }

  let userId = null;
  try {
    userId = await getUserId({
      platformId: payload.id,
      platformType: PLATFORM_TYPE_TELEGRAM,
    });
  } catch (err) {
    ctx.throw(500, 'Cannot get user ID!', { error: err });
  }

  // const webToken = createToken(payload.id, payload.username);

  ctx.body = formBody({ registered: !!userId, token: 'webToken' });
}

module.exports = ({ router }) => {
  router.get(route, async ctx => handleRoute(ctx));
};
