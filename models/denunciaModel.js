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
        "status": { // 0 = submetida, 1 = aprovada em revisão pela comissão, 2 = aprovada em revisão pelo NAPE, 3 = solucionada, 4 = cancelada.
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