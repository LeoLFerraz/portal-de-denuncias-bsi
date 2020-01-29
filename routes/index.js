const express = require('express');
const router = express.Router();
const path = require("path");
const fs = require("fs");
const Usuario = require('../models/usuarioModel');
const Denuncia = require('../models/denunciaModel');
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'static/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1000000 // Isso limita os arquivos subidos ao servidor a 10MB.
    }
});
const passport = require("passport");
const {ensureAuthenticated, forwardAuthenticated} = require('../configs/auth');


// GET routes:
// Tela pública inicial. Temos o relatório público de denúncias e o form de subsmissão de denúncias.
router.get('/', (req, res) => {
    console.log("Recebendo get em '/'");
    // Vamos primeiro pedir ao Mongo Atlas todas as denúncias visíveis no site, para então renderizar nossa
    // tela com a tabela contendo-as.
    Denuncia.find({
        visibilidade: 1 // Estamos no relatório público!
    }).sort({
        datahoraSubmissao: -1 // Mostrará em ordem decrescente de submissão.
    }).limit(20).then(denuncias => {
        console.log("Renderizando index.ejs com denuncias por get em '/'.");
        res.render('../views/index.ejs', {denuncias, req});
    }).catch(err => console.log(err))
    // TODO: Paginação (exibir mais de 20 denúncias).
});

// Tela pública com cards dos usuários ativos cadastrados. Serve para o público reconhecer o responsável por sua denúncias.
router.get('/comissao', (req, res) => {
    console.log("Recebendo get em '/comissao'");
    Usuario.find({
        status: 1 // Estamos no relatório público!
    }).sort({
        nome: 1 // Mostrará em ordem decrescente de submissão.
    }).then(usuarios => {
        usuarios.forEach(usuario => {
            let usuarioFotoPath = "../uploads/" + usuario.fotoPathname;
            if(usuario.fotoPathname == undefined) {
                usuario.fotoPathname = "usuariosemfoto.png";
                usuarioFotoPath = "../uploads/" + usuario.fotoPathname;
            }
        });
        res.render('../views/comissao.ejs', {usuarios, req});
    }).catch(err => console.log(err));
});

// Tela de admin para administração de usuários.
router.get('/admin/usuarios',(req, res) => {
    res.render('../views/usuarios.ejs', {req});
} );

// Tela de admin
router.get('/admin/cadastrousuario', ensureAuthenticated, (req, res) => {
    res.render('../views/cadastrousuario.ejs', {req});
});

router.get('/404', (req, res) => {
    res.render('../views/404.ejs', {req});
});

router.get('/admin/login', forwardAuthenticated, (req, res) => {
    res.render('../views/login.ejs', {req});
});

router.get('/admin/home', ensureAuthenticated, (req, res) => {
    let query = {};
    if (req.query.status){
        query.status = req.query.status;
    }
    if (req.query.dataInicio || req.query.dataFim) {
        query.datahoraSubmissao={};
    }
    if (req.query.dataInicio) {
        query.datahoraSubmissao.$gte = req.query.dataInicio+"T00:00:00Z";
    }
    if (req.query.dataFim) {
        query.datahoraSubmissao.$lt = req.query.dataFim+"T23:59:59.999Z";
    }
    Denuncia.find(query)
        .sort({
            datahoraSubmissao: -1
        })
        .limit(100)
        .then(denuncias => {
            Usuario.find().then(usuarios => {
                res.render('../views/adminhome.ejs', {denuncias, usuarios, req});
            })
        });
});

router.get('/admin/logout', ensureAuthenticated, (req, res) => {
    req.logout();
    req.flash('success_msg', 'Você está desautenticado! :)');
    res.redirect('/admin/login');
});


// POST routes:
router.post('/', (req, res) => {
    let {descricao, visibilidade, email} = req.body;
    let datahoraSubmissao = new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"}); // Na view, forçamos o formato da data com o comando
                                        // ".toISOString().replace(/T/, ' ').replace(/\..+/, '')."
    console.log(datahoraSubmissao);
    let novaDenuncia = new Denuncia({
        descricao,
        visibilidade,
        email,
        datahoraSubmissao
    });
    novaDenuncia.save()
        .then(() => {
            req.flash('success_msg', 'Denúncia enviada com sucesso!');
            res.status(200).redirect('/');
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Problema no servidor. Denúncia não foi enviada.");
        });
}); // Nova denúncia.
router.post('/admin/cadastrousuario', upload.single('avatar'), (req, res) => {
    let {nome, email, dataAniversario, observacaoPublica, senha} = req.body;
    // Validando informações:
    let erros = [];
    if (!nome) {
        erros.push({
            msg: "O campo 'Nome' deve ser preenchido."
        })
    }
    if (!email) {
        // TODO: Validar regex de email.
        erros.push({
            msg: "Por motivos procedimentais, você precisa informar seu email. Ninguém terá acesso ao seu e-mail e ele será" +
                " armazenado criptografado em nosso sistema para sua segurança."
        })
    }
    if (!dataAniversario) {
        // TODO: Validar regex de email.
        erros.push({
            msg: "O campo de data de aniversário precisa ser preenchido."
        })
    }
    if (!senha) {
        erros.push({
            msg: "Senha inválida."
        })
    }
    if (erros.length > 0) {
        console.log("Erros detectados, re-renderizando.");
        console.log(erros);
        console.log(erros.length);
        res.render("cadastrousuario.ejs", {erros, req});
        return;
    }
    // TODO: Encapsular validação de informações nas classes do modelo.
    let fotoPathname;
    if(req.file) {
        fotoPathname = req.file.filename;
    }
    else {
        fotoPathname = "usuariosemfoto.png";
    }
    let novoUsuario = new Usuario({
        nome,
        email,
        senha,
        dataAniversario,
        observacaoPublica,
        fotoPathname
    });
    novoUsuario.save()
        .then((usuarioSalvo) => {
            if(!usuarioSalvo) {
                res.status(500).send("Problema salvando usuário");
            }
            else {
                req.flash('success_msg', 'Usuário cadastrado!');
                res.status(200).redirect('/admin/login');
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Problema salvando usuário");
        })
}); // Novo usuário.
router.post('/admin/login', (req, res) => {
    passport.authenticate('local', {
        successRedirect: '/admin/home',
        failureRedirect: '/admin/login',
        failureFlash: 'Usuário ou senha inválidos.'
    })(req, res);
}); // Autenticação do usuário.

router.post('/:denunciaid', (req, res) => { // Update de denúncias. Especialmente importante para as requisições ajax do relatório administrativo.
                                            // Espera-se receber o objeto inteiro, com todos seus atributos, independente de terem mudado ou não.
    let denunciaModificada = req.body;
    Denuncia.findByIdAndUpdate(req.params.denunciaid, denunciaModificada)
        .then(() => {
            res.status(200).send({message: 'Denúncia atualizada com sucesso!'});
        })
        .catch(err => {
            res.status(500).send({message:'Erro ao atualizar denuncia!'});
        });
});

module.exports = router;
