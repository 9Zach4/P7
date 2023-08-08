const Book = require('../models/Books');
const fs = require('fs');
//expots des fonctions pour les routes de gestion des livres
exports.createBook = (req, res, next) => { 
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book ({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  book.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ error }));
}; 
  
exports.getBestBooks = async (req, res) => {
    try {
        // Utiliser l'agrégation MongoDB pour projeter les champs souhaités et calculer la moyenne des notes
        const books = await Book.aggregate([
            {
                $project: {
                    title: 1,
                    imageUrl: 1,
                    author: 1,
                    year: 1,
                    genre: 1,
                    averageRating: { $avg: '$ratings.grade' },
                },
            },
            {
                $sort: { averageRating: -1 },
            },
            {
                $limit: 3,
            },
        ])

        // Envoyer une réponse avec les meilleurs livres
        res.status(200).json(books)
    } catch (error) {
        // Gérer les erreurs et renvoyer une réponse avec l'erreur
        res.status(400).json({ error })
    }
};

exports.bookRating = async (req, res) => {
  const userId = req.user.id; 
  const bookId = req.params.id;
  const { rating } = req.body;

  if (rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 0 and 5' });
  }

  try {
      const book = await Book.findById(bookId);

      if (!book) {
          return res.status(404).json({ error: 'Book not found' });
      }

      const alreadyRated = book.ratings.find(rating => rating.userId === userId);

      if (alreadyRated) {
          return res.status(400).json({ error: 'You have already rated this book' });
      }

      book.ratings.push({ userId, rating });
      book.averageRating = calculateAverageRating(book.ratings);

      await book.save();

      return res.status(200).json(book);
  } catch (error) {
      return res.status(500).json({ error: 'An error occurred while submitting the rating' });
  }
};

function calculateAverageRating(ratings) {
  const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
  return totalRating / ratings.length;
}

exports.modifyBook = (req, res, next) => { 
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete bookObject._userId
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId!=req.auth.userId){
          res.status(401).json({message : 'Non-autorisé !'});

      } else {
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié !'}))
        .catch(error => res.status(400).json({ error }));
      }
    })
    .catch(error => {
      res.status(400).json({ error });
    });
};






exports.deleteBook = (req, res, next) => { 
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId!=req.auth.userId){
          res.status(401).json({message : 'Non-autorisé !'});

      } else {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
            .catch(error => res.status(400).json({ error }));
        });
      } 
    })
    .catch(error => {
      res.status(400).json({ error });
    });
};

exports.getOneBook = (req, res, next) => { 
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => { 
  Book.find()
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));

};