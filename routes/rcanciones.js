module.exports = function(app ,swig) {


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
        res.send("Canción agregada:"+req.body.nombre + "<br>"
            + " genero :" + req.body.genero + "<br>"
            + " precio: "+req.body.precio);
    });

    app.get('/promo*', function (req, res) {
        res.send('Respuesta patrón promo* ');
    })


};