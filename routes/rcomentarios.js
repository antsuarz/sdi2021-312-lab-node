module.exports = function(app, swig, gestorBD) {

    app.post("/comentarios/:cancion_id", function(req, res) {
        if ( req.session.usuario == null){
            let respuesta = swig.renderFile('views/error.html',
                {
                    error: "No puedes comentar sin registrarte"
                });
            res.send(respuesta);
            return;
        }

        let comentario = {
            autor : req.session.usuario,
            texto : req.body.texto,
            cancion_id: gestorBD.mongo.ObjectID(req.params.cancion_id)
        }
        gestorBD.insertarComentario(comentario, function(id){
            if (id == null) {
                let respuesta = swig.renderFile('views/error.html',
                    {
                        error: "Error al listar comentario"
                    });
                res.send(respuesta);
            } else {
                res.send("Comentario insertado con id: "+id);
            }
        });
    });

};