const express = require ('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const bookCrtl = require('../controllers/book');


router.get('/bestrating', bookCrtl.getBestBooks);
router.get('/', bookCrtl.getAllBooks);
router.post('/:id/rating', auth, bookCrtl.bookRating);
router.post('/', auth, multer, bookCrtl.createBook ); 
router.get('/:id', bookCrtl.getOneBook);
router.put('/:id', auth, multer, bookCrtl.modifyBook);
router.delete('/:id', auth, bookCrtl.deleteBook);


module.exports = router;