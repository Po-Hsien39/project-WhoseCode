const router = require('express').Router();
const { wrapAsync, authentication } = require('../../util/util');
const { executeCode } = require('../controllers/code_controller');

router.route('/code').post(wrapAsync(executeCode));

module.exports = router;
