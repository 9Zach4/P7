const express = require ('express');
const router = express.Router();

const bookCrtl = require('../controllers/book');

router.post('/', bookCrtl.createBook );
router.put('/:id',bookCrtl.modifyBook);
router.delete('/:id', bookCrtl.deleteBook);
router.get('/:id', bookCrtl.getOneBook);
router.get('/',bookCrtl.getAllBooks);



module.exports = router;