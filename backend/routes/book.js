const express = require ('express');
const auth = require('../middleware/auth');

const router = express.Router();


const bookCrtl = require('../controllers/book');

//routes pour la création d'un livre
router.post('/', auth, bookCrtl.createBook ); 
router.put('/:id', auth, bookCrtl.modifyBook);
router.delete('/:id', auth, bookCrtl.deleteBook);
router.get('/:id', auth, bookCrtl.getOneBook);
router.get('/', auth, bookCrtl.getAllBooks);



module.exports = router;