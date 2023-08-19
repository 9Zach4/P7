const express = require ('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { imgUpload, imgSize } = require('../middleware/multer-config');

const bookCrtl = require('../controllers/book');



router.post('/', auth, imgUpload, imgSize, bookCrtl.createBook) // route pour la création d'un livre
router.post('/:id/rating', auth, bookCrtl.bookRating); // route pour l'ajout d'une note à un livre  
router.get('/bestrating', bookCrtl.getBestBooks); // route pour la récupération des 3 meilleurs livres
router.put('/:id', auth, imgUpload, imgSize, bookCrtl.modifyBook) // route pour la modification d'un livre
router.delete('/:id', auth, bookCrtl.deleteBook) // route pour la suppression d'un livre
router.get('/:id', bookCrtl.getOneBook) // route pour la récupération d'un livre
router.get('/', bookCrtl.getAllBooks) // route pour la récupération de tous les livres



module.exports = router;