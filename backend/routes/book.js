const express = require ('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const bookCrtl = require('../controllers/book');

//routes pour la création d'un livre
router.get('/', bookCrtl.getAllBooks);
router.post('/', auth, multer, bookCrtl.createBook ); 
router.get('/:id', bookCrtl.getOneBook);
router.put('/:id', auth, multer, bookCrtl.modifyBook);
router.delete('/:id', auth, bookCrtl.deleteBook);


module.exports = router;