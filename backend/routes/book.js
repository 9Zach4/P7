const express = require ('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { imgUpload, imgSize } = require('../middleware/multer-config');
const bookCrtl = require('../controllers/book');



router.post('/', auth, imgUpload, imgSize, bookCrtl.createBook)
router.get('/bestrating', bookCrtl.getBestBooks);
router.post('/:id/rating', auth, bookCrtl.bookRating);
router.put('/:id', auth, imgUpload, imgSize, bookCrtl.modifyBook)
router.delete('/:id', auth, bookCrtl.deleteBook)
router.get('/:id', bookCrtl.getOneBook)
router.get('/', bookCrtl.getAllBooks)



module.exports = router;