module.exports = function(app, gestorBD) {

    app.get("/api/cancion", function(req, res) {
        gestorBD.obtenerCanciones( {} , function(canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(canciones) );
            }
        });
    });

    app.get("/api/cancion/:id", function(req, res) {
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id)}

        gestorBD.obtenerCanciones(criterio,function(canciones){
            if ( canciones == null ){
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(canciones[0]) );
            }
        });
    });

    app.delete("/api/cancion/:id", function(req, res) {

        let cancionId = gestorBD.mongo.ObjectID(req.params.id);
        let usuario = req.session.usuario;
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id)}

        validarAutorCancion(usuario, cancionId, function (errores) {
            if (errores !== null && errores.length > 0) {
                res.status(403); //Forbidden
                res.json({
                    errores: errores
                })
            } else {
                gestorBD.eliminarCancion(criterio,function(canciones){
                    if ( canciones == null ){
                        res.status(500);
                        res.json({
                            error : "se ha producido un error al eliminar la cancion"
                        })
                    } else {
                        res.status(200);
                        res.send( JSON.stringify(canciones) );
                    }
                });
            }
        });
    });


    app.post("/api/cancion", function(req, res) {
        let cancion = {
            nombre : req.body.nombre,
            genero : req.body.genero,
            precio : req.body.precio,
        }
        // ¿Validar nombre, genero, precio?
        validarCancion(cancion, function(errores){
            if(errores !== null && errores.length > 0){
                res.status(403); //Forbidden
                res.json({
                    errores:errores
                })
            }else {
                gestorBD.insertarCancion(cancion, function (id) {
                    if (id == null) {
                        res.status(500);
                        res.json({
                            error: "se ha producido un error"
                        })
                    } else {
                        res.status(201);
                        res.json({
                            mensaje: "canción insertada",
                            _id: id
                        })
                    }
                });
            }
        });
    });

    app.put("/api/cancion/:id", function(req, res) {

        let cancionId = gestorBD.mongo.ObjectID(req.params.id);
        let usuario = req.session.usuario;
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };

        let cancion = {};
        if ( req.body.nombre != null)
            cancion.nombre = req.body.nombre;
        if ( req.body.genero != null)
            cancion.genero = req.body.genero;
        if ( req.body.precio != null)
            cancion.precio = req.body.precio;

        validarAutorCancion(usuario, cancionId, function(errores) {
            if (errores !== null && errores.length > 0) {
                res.status(403); //Forbidden
                res.json({
                    errores: errores
                })
            } else {
                validarCancion(cancion, function (errores)
                {
                    if(errores !== null && errores.length > 0) {
                        res.status(403); //Forbidden
                        res.json({
                            errores: errores
                        })
                    } else {
                        gestorBD.modificarCancion(criterio, cancion, function (result) {
                            if (result == null) {
                                res.status(500);
                                res.json({
                                    error: "se ha producido un error"
                                })
                            } else {
                                res.status(200);
                                res.json({
                                    mensaje: "canción modificada",
                                    _id: req.params.id
                                })
                            }
                        });
                    }
                });
            }

        });
    });

    app.post("/api/autenticar/", function(req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email : req.body.email,
            password : seguro
        }

        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                res.status(401);
                res.json({
                    autenticado : false
                })
            } else {
                let token = app.get('jwt').sign(
                    {usuario: criterio.email , tiempo: Date.now()/1000},
                    "secreto");
                res.status(200);
                res.json({
                    autenticado: true,
                    token : token
                });
            }
        });
    });

    function validarCancion(cancion, functionCallback){
        let errores = new Array();
        if(cancion.nombre == null || typeof cancion.nombre === 'undefined')
            errores.push("Error en el nombre de la canción");
        if(cancion.nombre.length <1)
            errores.push("Error en el nombre de la canción: no puede estar vacio");
        if(cancion.nombre.length >20)
            errores.push("Error en el nombre de la canción: no puede contener más de 20 caracteres");
        if(cancion.genero == null || typeof cancion.genero === 'undefined')
            errores.push("Error en el género de la canción");
        if(cancion.genero.length < 3)
            errores.push("Error en el género de la canción: El nombre del género debe contener al menos 3 caracteres");
        if(cancion.genero.length > 10)
            errores.push("Error en el género de la canción: El nombre del género no puede contener más de 10 caracteres");
        if(cancion.precio == null || typeof cancion.precio === 'undefined')
            errores.push("Error en el precio de la canción");
        if(cancion.precio <= 0)
            errores.push("Error en el précio de la canción: El précio no ha de ser 0 o inferior");

        functionCallback(errores);
    }

    function validarAutorCancion(usuario, cancionId, functionCallback){
        let errores = new Array();
        let criterio = {$and: [{"_id": cancionId}, {"autor": usuario}]};
        gestorBD.obtenerCanciones(criterio,function(canciones){
            if(canciones == null){
                errores.push("Error: solo el autor de una canción puede modificarla o borrarla");
            }
            if(canciones.length == 0){
                errores.push("Error: solo el autor de una canción puede modificarla o borrarla");
            }
            functionCallback(errores);
        });
    }

};
