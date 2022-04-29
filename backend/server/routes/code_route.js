const router = require('express').Router();
const { wrapAsync } = require('../../util/util');
const { executeCode } = require('../controllers/code_controller');

router.route('/code').post(wrapAsync(executeCode));

module.exports = router;
