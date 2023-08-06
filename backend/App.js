const express = require('express');
const mongoose = require('mongoose');

const app = express();
mongoose.connect('mongodb+srv://JonhC:chocolat@cluster0.7afshel.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));



const Book = require('./models/Books');

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  }); // Middleware général appliqué à toutes les requêtes envoyées au serveur



// app.post('/api/auth/signup', signUp)
// app.post('/api/auth/login', login)

//  function signUp(req, res, next) { 
//   const body = req.body;
//   console.log("body:", body);
//     res.status(201).json({ message: 'Utilisateur créé !' });
//   }; // Middleware POST pour créer un utilisateur


// function login(req, res, next) {
//   const body = req.body;
//   console.log("body:", body);
//     res.status(200).json({ userId: "123", token:"token"});
    
//   }; // Middleware POST pour connecter un utilisateur

app.use(express.json());


app.post('/api/books', (req, res, next) => { 
  delete req.body._id;
  const book = new Book({
    ...req.body
  });
  book.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ error }));
});


app.put('/api/books/:id', (req, res, next) => { 
  Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));
});

app.delete('/api/books/:id', (req, res, next) => { 
  Book.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
    .catch(error => res.status(400).json({ error }));
});

app.get('/api/books/:id', (req, res, next) => { 
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));

});


 app.get('/api/books', (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));

 });

 


module.exports = app;