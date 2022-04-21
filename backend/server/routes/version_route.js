const router = require('express').Router();
const { wrapAsync } = require('../../util/util');
const {
  getVersions,
  getVersion,
} = require('../controllers/version_controller');

const authentication = require('../middleware/authentication');
router.route('/versions/:id').get(wrapAsync(getVersions));
router.route('/version/:id/:versionId').get(wrapAsync(getVersion));

module.exports = router;
