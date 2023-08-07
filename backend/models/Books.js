const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({ // création du schéma de données pour les livres

  userId: { type: String, required: true }, 
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  ratings: [
    {
      userId: { type: String, required: true,},    
      grade: { type: Number, required: true },       
    },
  ],
  averageRating: { type: Number, default: null }, // valeur par défaut pour la note moyenne 
});

module.exports = mongoose.model('Book', bookSchema); // export du schéma de données pour les livresS
