const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema(
    {
        "nome": {
            "type": String,
            "required": true
        },
        "email": {
            "type": String,
            "required": true
        },
        "dataAniversario": {
            "type": Date,
            "require": true
        },
        "status": { // Usuário ativo ou inativo, feito com tipo = Number para ser escalável. 0 = inativo, 1 = ativo.
            "type": Number,
            "default": 1,
            "required": true
        },
        "fotoPathname": {
            "type": String,
            "required": true
        },
        "observacaoPublica": { // Vamos usar, por enquanto, para exibir na página pública "comissao" para, por exemplo, exibir meio de contato.
            "type": String,
            "required": false
        },
        "senha": {
            "type": String,
            "required": true
        }
    }
);

const Usuario = mongoose.model('usuario', usuarioSchema);

module.exports = Usuario;