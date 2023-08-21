require('dotenv').config();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');



const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/; // regex pour l'email


exports.signup = (req, res, next) => { // fonction pour l'inscription d'un nouvel utilisateur

    if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({ message: "L'email n'est pas valide." }); 
    }

    const password = req.body.password;
    if (password.length < 12) {
        return res.status(400).json({ message: "Le mot de passe doit avoir au moins 12 caractères." });
    }
    bcrypt.hash(password, 12) // hashage du mot de passe avec bcrypt
        .then(hash => { 
            const user = new User({ // création d'un nouvel utilisateur
                email: req.body.email,
                password: hash
           });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
       })
       .catch(error => res.status(500).json({ error }));
};// export de la fonction signUp pour l'inscription d'un nouvel utilisateur

exports.login = (req, res, next) => {
 const secretToken = process.env.MYT; // Utilisation de la clé secrète de l'environnement
    User.findOne({ email: req.body.email }) // recherche de l'utilisateur dans la base de données
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Paire identifiant/mot de passe incorrecte !' });
            } else {
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if (!valid) {
                            return res.status(401).json({ error: 'Paire identifiant/mot de passe incorrecte !' });
                        } else {
                            res.status(200).json({
                                userId: user._id,
                                token: jwt.sign(
                                    { userId: user._id }, // Encodage des informations dans le token
                                    secretToken,      // Utilisation de la clé secrète de l'environnement
                                    { expiresIn: '24h' }  // Création d'un token d'authentification
                                )
                            });
                        }
                    })
                    .catch(error => res.status(500).json({ error }));
            }
        })
        .catch(error => res.status(500).json({ error }));
}; // Export de la fonction login pour la connexion d'un utilisateur existant
