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
            {
                "nombre" : "Suelo Gris",
                "precio": "1.5"
            },
            {
                "nombre" : "La Inmensidad",
                "precio": "1.2"
            },
            {
                "nombre" : "PRMVR",
                "precio": "1.6"
            }

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

    app.get('/canciones/:id', function(req, res) {
        let respuesta = 'id: ' + req.params.id;
        res.send(respuesta);
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
            precio: req.body.precio
        }
        // Conectarse
        // Conectarse
        gestorBD.insertarCancion(cancion, function(id){
            if (id == null) {
                res.send("Error al insertar canción");
            } else {
                res.send("Agregada la canción ID: " + id);
            }
        });
    });

    app.get('/promo*', function (req, res) {
        res.send('Respuesta patrón promo* ');
    })


};