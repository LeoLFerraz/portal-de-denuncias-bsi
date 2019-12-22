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
        "status": { // 0 = cancelada, 1 = submetida, 2 = em revisão, 3 = aprovada, 4 = solucionada
            "type": Number,
            "default": 1,
            "required": true
        },
        "observacao": {
            "type": String,
            "required": false
        },
        "visibilidade": { // 0 = apenas comissão, 1 = pública
            "type": Number,
            "required": true
        },
        "datahoraSubmissao": {
            "type": Date,
            "required": true,
            "default": new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
        },
        "responsavel": {
            "type": String,
            "required": false
        }
    }
);

const Denuncia = mongoose.model('denuncia', denunciaSchema);

module.exports = Denuncia;
