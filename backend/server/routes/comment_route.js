const router = require('express').Router();
const { wrapAsync } = require('../../util/util');
const authentication = require('../middleware/authentication');
const {
  getComments,
  createComment,
} = require('../controllers/comment_controller');

router.route('/comments/:id').get(wrapAsync(getComments));

router.route('/comment/:id').post(authentication(), wrapAsync(createComment));

module.exports = router;
