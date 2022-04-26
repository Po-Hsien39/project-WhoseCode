const router = require('express').Router();
const { wrapAsync } = require('../../util/util');
const { getPermission } = require('../controllers/permission_controller');

const authentication = require('../middleware/authentication');

router.route('/permission/:id').get(authentication(), wrapAsync(getPermission));

module.exports = router;
