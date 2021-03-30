module.exports = function(app, swig) {


app.get('/autores/agregar', function (req, res) {
    let respuesta = swig.renderFile('views/autoresagregar.html', {

    });
    res.send(respuesta);
})

    app.get("/autores", function(req, res) {

        let autores =[
            {
                "nombre" : "Kutxi Romero",
                "grupo": "Marea",
                "rol": "Cantante"
            },
            {
                "nombre" : "Robe",
                "grupo": "Extremoduro",
                "rol": "Cantante"
            },
            {
                "nombre" : "Fito",
                "grupo": "Fito y los Fitipaldis",
                "rol": "Cantante"
            }

        ];

        let respuesta = swig.renderFile('views/autores.html', {
            autores : autores
        })
        res.send(respuesta);
    });

app.get('/autores/:id', function(req, res) {
    let respuesta = 'id: ' + req.params.id;
    res.send(respuesta);
});

app.get('/autores/:rol/:id', function(req, res) {
    let respuesta = 'id: ' + req.params.id + '<br>'
        + 'Rol: ' + req.params.rol;
    res.send(respuesta);
});

app.post("/autor", function (req,res){
    res.send("Autor agregado:"+req.body.nombre + "<br>"
        + " grupo :" + req.body.grupo + "<br>"
        + " rol: "+ req.body.rol);
});

};