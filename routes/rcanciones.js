module.exports = function(app ,swig, gestorBD) {


    //el método GET /canciones/agregar tiene que ir antes de /canciones/:id. El
    // orden en el que escribimos los métodos GET y POST es importante puesto que indican
    // PRIORIDAD
    app.get('/canciones/agregar', function (req, res) {


        let respuesta = swig.renderFile('views/bagregar.html', {

        });
        res.send(respuesta);
    })

    app.get("/canciones", function(req, res) {

        let canciones =[

        ];

        let respuesta = swig.renderFile('views/btienda.html', {
            vendedor : 'Tienda de canciones',
            canciones : canciones
        })
        res.send(respuesta);
    });

    app.get('/suma', function(req, res) {
        let respuesta = parseInt(req.query.num1) + parseInt(req.query.num2);
        res.send(String(respuesta));
    });

    app.get('/cancion/:id', function (req, res) {
        let criterio = { "_id" :  gestorBD.mongo.ObjectID(req.params.id)  };
        let criterioC = { "cancion_id" :  gestorBD.mongo.ObjectID(req.params.id)  };
        gestorBD.obtenerCanciones(criterio,function(canciones){
            let user = req.session.usuario;
            let cancionId = gestorBD.mongo.ObjectID(req.params.id);
            if ( canciones == null ){
                let respuesta = swig.renderFile('views/error.html',
                    {
                        error: "Error al recuperar la canción"
                    });
                res.send(respuesta);
            } else {
                esComprable(user, cancionId, function (comprar) {
                    gestorBD.obtenerComentarios(criterioC, function (comentarios) {
                        if (comentarios == null) {
                            let respuesta = swig.renderFile('views/error.html',
                                {
                                    error: "Error al recuperar los comentarios"
                                });
                            res.send(respuesta);
                        } else {
                            let configuracion = {
                                url: "https://www.freeforexapi.com/api/live?pairs=EURUSD",
                                method: "get",
                                headers: {
                                    "token": "ejemplo",
                                }
                            }
                            let rest = app.get("rest");
                            rest(configuracion, function (error, response, body) {
                                console.log("cod: " + response.statusCode + " Cuerpo :" + body);
                                let objetoRespuesta = JSON.parse(body);
                                let cambioUSD = objetoRespuesta.rates.EURUSD.rate;
                                // nuevo campo "usd"
                                canciones[0].usd = cambioUSD * canciones[0].precio;

                                let respuesta = swig.renderFile('views/bcancion.html',
                                    {
                                        cancion: canciones[0],
                                        comentarios: comentarios,
                                        comprable: comprar,
                                    });
                                res.send(respuesta);
                            })
                        }
                    });
                });
            }
        });

    });
    app.get('/canciones/:genero/:id', function(req, res) {
        let respuesta = 'id: ' + req.params.id + '<br>'
            + 'Género: ' + req.params.genero;
        res.send(respuesta);
    });

    app.post("/cancion", function (req,res){

        let cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero,
            precio: req.body.precio,
            autor: req.session.usuario
        }
        // Conectarse
        gestorBD.insertarCancion(cancion, function(id){
            if (id == null) {
                let respuesta = swig.renderFile('views/error.html',
                    {
                        error: "Error al insertar la canción"
                    });
                res.send(respuesta);
            } else {
                if (req.files.portada != null) {
                    var imagen = req.files.portada;
                    imagen.mv('public/portada/' + id + '.png', function(err) {
                        if (err) {
                            let respuesta = swig.renderFile('views/error.html',
                                {
                                    error: "Error al subir la portada"
                                });
                            res.send(respuesta);
                        } else {
                            if (req.files.audio != null) {
                                let audio = req.files.audio;
                                audio.mv('public/audios/'+id+'.mp3', function(err) {
                                    if (err) {
                                        let respuesta = swig.renderFile('views/error.html',
                                            {
                                                error: "Error al subir el audio"
                                            });
                                        res.send(respuesta);
                                    } else {
                                        res.send("Agregada id: "+ id);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    });

    app.get('/promo*', function (req, res) {
        res.send('Respuesta patrón promo* ');
    })


    app.get("/tienda", function(req, res) {
        let criterio = {};

        if( req.query.busqueda != null ){
            criterio = { "nombre" : {$regex : ".*"+req.query.busqueda+".*"}  };
        }

        let pg = parseInt(req.query.pg); // Es String !!!
        if ( req.query.pg == null){ // Puede no venir el param
            pg = 1;
        }
        gestorBD.obtenerCancionesPg(criterio, pg , function(canciones, total ) {
            if (canciones == null) {
                let respuesta = swig.renderFile('views/error.html',
                    {
                        error: "Error al listar las canciones"
                    });
                res.send(respuesta);
            } else {
                let ultimaPg = total/4;
                if (total % 4 > 0 ){ // Sobran decimales
                    ultimaPg = ultimaPg+1;
                }
                let paginas = []; // paginas mostrar
                for(let i = pg-2 ; i <= pg+2 ; i++){
                    if ( i > 0 && i <= ultimaPg){
                        paginas.push(i);
                    }
                }
                let respuesta = swig.renderFile('views/btienda.html',
                    {
                        canciones : canciones,
                        paginas : paginas,
                        actual : pg
                    });
                res.send(respuesta);
            }
        });
    });

    app.get('/cancion/modificar/:id', function (req, res) {
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.obtenerCanciones(criterio,function(canciones){
            if ( canciones == null ){
                let respuesta = swig.renderFile('views/error.html',
                    {
                        error: "Error al listar canciones"
                    });
                res.send(respuesta);
            } else {
                let respuesta = swig.renderFile('views/bcancionModificar.html',
                    {
                        cancion : canciones[0]
                    });
                res.send(respuesta);
            }
        });
    })

    app.post('/cancion/modificar/:id', function (req, res) {
        let id = req.params.id;
        let criterio = { "_id" : gestorBD.mongo.ObjectID(id) };
        let cancion = {
            nombre : req.body.nombre,
            genero : req.body.genero,
            precio : req.body.precio
        }
        gestorBD.modificarCancion(criterio, cancion, function(result) {
            if (result == null) {
                let respuesta = swig.renderFile('views/error.html',
                    {
                        error: "Error al modificar"
                    });
                res.send(respuesta);
            } else {
                paso1ModificarPortada(req.files, id, function (result) {
                    if( result == null){
                        let respuesta = swig.renderFile('views/error.html',
                            {
                                error: "Error al modificar la canción"
                            });
                        res.send(respuesta);
                    } else {
                        res.redirect("/publicaciones");
                    }
                });

            }
        });
    })

    function paso1ModificarPortada(files, id, callback){
        if (files && files.portada != null) {
            let imagen =files.portada;
            imagen.mv('public/portada/' + id + '.png', function(err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    paso2ModificarAudio(files, id, callback); // SIGUIENTE
                }
            });
        } else {
            paso2ModificarAudio(files, id, callback); // SIGUIENTE
        }
    };
    function paso2ModificarAudio(files, id, callback){
        if (files && files.audio != null) {
            let audio = files.audio;
            audio.mv('public/audios/'+id+'.mp3', function(err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    callback(true); // FIN
                }
            });
        } else {
            callback(true); // FIN
        }
    };

    app.get('/cancion/eliminar/:id', function (req, res) {
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.eliminarCancion(criterio,function(canciones){
            if ( canciones == null ){
                let respuesta = swig.renderFile('views/error.html',
                    {
                        error: "Error al eliminar la canción"
                    });
                res.send(respuesta);
            } else {
                res.redirect("/publicaciones");
            }
        });
    })

    app.get('/cancion/comprar/:id', function (req, res) {
        let cancionId = gestorBD.mongo.ObjectID(req.params.id);
        let user = req.session.usuario;

        esComprable(user, cancionId, function(comprar){
            if(comprar) {
                let compra = {
                    usuario: user,
                    cancionId: cancionId
                };

                gestorBD.insertarCompra(compra, function (idCompra) {
                    if (idCompra == null) {
                        let respuesta = swig.renderFile('views/error.html',
                            {
                                error: "Error al insertar la compra en la base de datos"
                            });
                        res.send(respuesta);
                    } else {
                        res.redirect("/compras");
                    }
                });
            }
        });
    });


    app.get('/compras', function (req,res){
        let criterio = {"usuario" : req.session.usuario};

        gestorBD.obtenerCompras(criterio, function (compras){
            if (compras == null) {
                let respuesta = swig.renderFile('views/error.html',
                    {
                        error: "Error al listar"
                    });
                res.send(respuesta);
            }
            else{
                let cancionesCompradasIds= [];
                for(i = 0; i < compras.length; i++){
                    cancionesCompradasIds.push(compras[i].cancionId);
                }
                let criterio = { "_id": { $in: cancionesCompradasIds}}
                gestorBD.obtenerCanciones(criterio, function (canciones){
                    let respuesta = swig.renderFile('views/bcompras.html',
                        {
                            canciones : canciones
                        });
                    res.send(respuesta);
                });
            }
        });
    });

    function esComprable (usuario, cancionId, functionCallback) {
        let criterio_autor = {$and: [{"_id": cancionId}, {"autor": usuario}]};
        let criterio_comprada = {$and: [{"cancionId": cancionId}, {"usuario": usuario}]};
        gestorBD.obtenerCanciones(criterio_autor, function (canciones) {
            if (canciones == null || canciones.length > 0) {
                functionCallback(false);
            } else {
                gestorBD.obtenerCompras(criterio_comprada, function (compras) {
                    if (compras == null || compras.length > 0) {
                        functionCallback(false);
                    } else {
                        functionCallback(true);
                    }
                });
            }
        });
    };
};