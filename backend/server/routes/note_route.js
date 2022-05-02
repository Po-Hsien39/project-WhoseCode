const router = require('express').Router();
const { wrapAsync } = require('../../util/util');
const {
  getNote,
  createNote,
  modifyNote,
  deleteNote,
  getAllNotes,
} = require('../controllers/note_controller');

const authentication = require('../middleware/authentication');

router.route('/note').post(authentication(), wrapAsync(createNote));

router.route('/notes/:id').get(wrapAsync(getAllNotes));
router
  .route('/note/:id')
  .get(authentication(), wrapAsync(getNote))
  .put(wrapAsync(modifyNote))
  .delete(authentication(), wrapAsync(deleteNote));
module.exports = router;
