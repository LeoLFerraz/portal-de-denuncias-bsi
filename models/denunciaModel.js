const mongoose = require("mongoose");

const denunciaSchema = new mongoose.Schema(
    {
        "descricao": {
            "type": String,
            "required": true
        },
        "email": {
            "type": String,
            "required": true
        },
        "status": { // 0 = cancelada, 1 = submetida, 2 = sob revisão, 3 = solucionada
            "type": Number,
            "default": 1,
            "required": true
        },
        "observacao": {
            "type": String,
            "required": false
        },
        "visibilidade": {
            "type": Number,
            "required": true
        },
        "datahoraSubmissao": {
            "type": Date,
            "required": true,
            "default": Date.now()
        },
        "responsavel": {
            "type": String,
            "required": false
        }
    }
);

const Denuncia = mongoose.model('denuncia', denunciaSchema);

module.exports = Denuncia;