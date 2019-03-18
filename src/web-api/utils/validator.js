const { Validator, Rule } = require('@cesium133/forgjs');
const {
  WEB_USER_TOKEN_LENGTH,
  WEB_PHOTO_FILE_SIZE_MIN,
  WEB_PHOTO_FILE_SIZE_MAX,
} = require('../../config');

// HACK: TODO: Remove next block when
// https://github.com/oussamahamdaoui/forgJs/issues/65
// and
// https://github.com/oussamahamdaoui/forgJs/issues/66
// are fixed
function removeBugsDecorator(func) {
  // eslint-disable-next-line func-names
  return function(...args) {
    // Changes null & undefined to {} to avoid errors
    args.forEach(obj => {
      const keys = Object.keys(obj);
      keys.forEach(key => {
        if (obj[key] == null) obj[key] = {};
      });
    });
    // Removes duplicates from array
    return [...new Set(func.apply(this, args))];
  };
}
Validator.prototype.getErrors = removeBugsDecorator(Validator.prototype.getErrors);
// block end -----

const location = new Validator({
  lon: new Rule(
    { type: 'string-float|string-int', min: -180, max: 180 },
    'Longitude must be a number in range -180 to 180!',
  ),
  lat: new Rule(
    { type: 'string-float|string-int', min: -90, max: 90 },
    'Latitude must be a number in range -90 to 90!',
  ),
});

const daysAndRadius = new Validator({
  r: new Rule({ type: 'string-int', min: 0 }, 'Radius must be an integer bigger than 0!'),
  d: new Rule({ type: 'string-int', min: 0 }, 'Days must be an integer bigger than 0!'),
});

const requestMessage = new Validator({
  msg: new Rule({ type: 'string', minLength: 1, optional: true }, 'Message must not be empty!'),
});

const webToken = new Validator({
  token: new Rule(
    { type: 'string', custom: token => token.length === WEB_USER_TOKEN_LENGTH },
    'Invalid token!',
  ),
});

const photoUpload = new Validator({
  size: new Rule(
    { type: 'int', min: WEB_PHOTO_FILE_SIZE_MIN, max: WEB_PHOTO_FILE_SIZE_MAX },
    `Photo size must be in range ${WEB_PHOTO_FILE_SIZE_MIN} to ${WEB_PHOTO_FILE_SIZE_MAX} bytes`,
  ),
  type: new Rule({ type: 'string', match: /^image\/.+/ }, `Photo must be of type 'image/*'`),
});

module.exports = {
  listQuery({ d, r, lon, lat }) {
    return [...location.getErrors({ lon, lat }), ...daysAndRadius.getErrors({ d, r })];
  },

  signupQuery({ d, r, lon, lat, token }) {
    return [
      ...location.getErrors({ lon, lat }),
      ...daysAndRadius.getErrors({ d, r }),
      ...webToken.getErrors({ token }),
    ];
  },

  requestQuery({ body }) {
    if (!body) return ['POST body must not be empty!'];
    const { msg, lon, lat, token } = body;
    return [
      ...location.getErrors({ lon, lat }),
      ...webToken.getErrors({ token }),
      ...requestMessage.getErrors({ msg }),
    ];
  },

  photoUpload({ files }) {
    if (!files || !files.photo) return ["File field 'photo' must not be empty"];
    const { size, type } = files.photo;
    return photoUpload.getErrors({ size, type });
  },
};
