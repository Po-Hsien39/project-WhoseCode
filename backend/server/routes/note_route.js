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

router
  .route('/note')
  .post(authentication(), wrapAsync(createNote))
  .delete(wrapAsync(deleteNote));

router.route('/notes/:id').get(wrapAsync(getAllNotes));
router.route('/note/:id').get(wrapAsync(getNote)).put(wrapAsync(modifyNote));
module.exports = router;
