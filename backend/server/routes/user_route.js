const router = require('express').Router();
const { wrapAsync } = require('../../util/util');
const {
  userSignUp,
  userSignIn,
  getUserProfile,
} = require('../controllers/user_controller');
const authentication = require('../middleware/authentication');
router.route('/user/signin').post(wrapAsync(userSignIn));
router.route('/user/signup').post(wrapAsync(userSignUp));
router.route('/user').get(authentication(), wrapAsync(getUserProfile));

module.exports = router;
