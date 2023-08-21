const Book = require('../models/Books');
const fs = require('fs');

//expots des fonctions pour les routes de gestion des livres
exports.createBook = (req, res, next) => { 
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id
  delete bookObject._userId
  const book = new Book ({ // création d'un nouvel objet Book
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` //création de l'URL de l'image
  });

  book.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !'})) // enregistrement du livre dans la base de données
    .catch(error => res.status(400).json({ error }));
}; 
  
exports.getBestBooks = async (req, res) => { //fonction pour la récupération des 3 meilleurs livres
  const bestBooks = [
      {
          $project: {
              title: 1,
              imageUrl: 1,
              author: 1,
              year: 1, //récupération des données du livre
              genre: 1,
              averageRating: { $avg: '$ratings.grade' }, //calcul de la moyenne des notes
          },
      },
      { $sort: { averageRating: -1 } },
      { $limit: 3 }
  ];

  try { //récupération des 3 meilleurs livres
      const books = await Book.aggregate(bestBooks);
      return res.json(books);
  } catch (error) {
      return res.status(400).json({ error });
  }
};

exports.bookRating = async (req, res, next) => {
  const bookId = req.params.id;
  const { userId, rating } = req.body;

  if (rating < 0 || rating > 5) {
    return res.status(400).json({ error: 'La note doit être comprise entre 0 et 5' });
  }

  try {
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé !' });
    }

    const ratingIndex = book.ratings.findIndex(rating => rating.userId == req.auth.userId);

    if (ratingIndex !== -1) {
      if (book.ratings[ratingIndex].userId === req.auth.userId) {
        if (book.ratings[ratingIndex].grade !== rating) {
          book.ratings[ratingIndex].grade = rating;
        } else {
          return res.status(400).json({ error: 'La note est déjà définie à cette valeur.' });
        }
      } else {
        throw new Error("Vous n'êtes pas autorisé à modifier cette note.");
      }
    } else {
      book.ratings.push({ userId, grade: rating });
    }

    const totalRating = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);
    book.averageRating = totalRating / book.ratings.length;
    book.averageRating = book.averageRating.toFixed(1);
    
    await book.save();
    res.status(200).json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.modifyBook = (req, res, next) => {  //fonction pour la modification d'un livre
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` //création de l'URL de l'image
  } : { ...req.body };

  delete bookObject._userId //suppression de l'ID de l'utilisateur
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId!=req.auth.userId){
          res.status(401).json({message : 'Non-autorisé !'});

      } else {
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id }) //modification du livre dans la base de données
        .then(() => res.status(200).json({ message: 'Objet modifié !'}))
        .catch(error => res.status(400).json({ error })); 
      }
    })
    .catch(error => {
      res.status(400).json({ error }); //si le livre n'existe pas
    });
};

exports.deleteBook = (req, res, next) => {  //fonction pour la suppression d'un livre
  Book.findOne({ _id: req.params.id })
    .then(book => { //recherche du livre dans la base de données
      if (book.userId!=req.auth.userId){ //si l'utilisateur n'est pas l'auteur du livre
          res.status(401).json({message : 'Non-autorisé !'});
      } else {
        const filename = book.imageUrl.split('/images/')[1]; //suppression de l'image du livre
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet supprimé !'})) //suppression du livre dans la base de données
            .catch(error => res.status(400).json({ error }));
        });
      } 
    })
    .catch(error => {
      res.status(400).json({ error });
    });
};

exports.getOneBook = (req, res, next) => {  //fonction pour la récupération d'un livre
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {  //fonction pour la récupération de tous les livres
  Book.find()
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));

};