const LocalStrategy = require('passport-local').Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Usuario = require("../models/usuarioModel");

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({
            usernameField: 'email',
            passwordField: 'senha'
        }, (email, password, done) => {
            Usuario.findOne({
                email: email
            }).then(user => {
                // Se não tivermos usuário cadastrado com aquele email:
                if(!user) {
                    return done(null, false, {
                        message: "Combinação email/senha não encontrada."
                    });
                }

                // Verificando senha:
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if(err) {
                        throw err
                    }

                    if(isMatch) {
                        return done(null, user);
                    }
                    else {
                        return done(null, false, {
                            message: "Combinação email/senha não encontrada!"
                        });
                    }
                });
            }).catch(err => console.log(err));
        })
    )

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (err, user) => {
            if(err) {
                throw err;
            }
            done(err, user);
        })
    })

};