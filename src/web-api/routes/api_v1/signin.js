const Router = require('koa-router');

const { getUserId } = require('../../../services/user');

const auth = require('../../utils/telegram-authorization');
const token = require('../../middleware/token');

const {
  webApi: {
    PREFIX: { SIGNIN },
  },
  platformType: { TELEGRAM },
} = require('../../../config');

const router = new Router({
  prefix: SIGNIN,
});

async function signin(ctx, next) {
  const payload = { ...ctx.request.query };
  try {
    auth(payload);
  } catch (err) {
    ctx.throw(401, `Authentication failed: ${err.message}`);
  }

  let wimpUserId = null;
  try {
    wimpUserId = await getUserId({
      platformId: payload.id,
      platformType: TELEGRAM,
    });
  } catch (err) {
    ctx.throw(500, 'Cannot get user ID!', { error: err });
  }

  ctx.chest = { id: payload.id, name: payload.username };

  await next();

  ctx.body = { registered: !!wimpUserId };
}

router.get('/', signin, token.set());

module.exports = router;
