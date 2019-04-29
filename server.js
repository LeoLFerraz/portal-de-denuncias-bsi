const express = require('express');
const path = require("path");
const appConfig = require(path.join(__dirname + '/configs/appConfig.js'));
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const flash = require('connect-flash');

const app = express();

app.set('view engine', 'ejs'); // Mudamos a plataforma de templates de PUG (default do express) para EJS.

// Conectando ao BD:
const mongoURI = "mongodb://admin:Alpha123@alphajunior-shard-00-00-cmbjw.mongodb.net:27017,alphajunior-shard-00-01-cmbjw.mongodb.net:27017,alphajunior-shard-00-02-cmbjw.mongodb.net:27017/test?ssl=true&replicaSet=AlphaJunior-shard-0&authSource=admin&retryWrites=true";
mongoose.connect(mongoURI, {useNewUrlParser: true})
    .then(() => {
        console.log("BD conectado");
    })
    .catch(err => console.log(err));

// Servir arquivos estáticos (stylesheets, scripts, mídia, etc):
app.use(express.static(path.join(__dirname, '/static')));

// Body parser para interpretar os Posts:
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Express-session e autenticação:
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
require("./configs/passport.js")(passport);
app.use(passport.initialize());
app.use(passport.session());

// O middleware connect-flash permite que a gente manipule "variáveis globais" entre servidor e cliente. Usamos isso
// para renderizar msgs de sucesso (login, cadastro) e erro (informações incompletas em formulários).
app.use(flash());
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Rotas:
app.use('/', require(path.join(__dirname + '/routes/index.js')));

app.listen(appConfig.serverPort, () => {
    console.log("Server iniciado. Porta: " + appConfig.serverPort);
});