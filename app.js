// Módulos
let express = require('express');
let app = express();

let expressSession = require('express-session');
app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));

let crypto = require('crypto');

let fileUpload = require('express-fileupload');
app.use(fileUpload());
let bodyParser = require('body-parser');
let mongo = require('mongodb');
let swig = require('swig');

let gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app,mongo);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.set('port', 8081);

app.set('db','mongodb://admin:sdi@tiendamusica-shard-00-00.jxgw2.mongodb.net:27017,tiendamusica-shard-00-01.jxgw2.mongodb.net:27017,tiendamusica-shard-00-02.jxgw2.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-od6pn1-shard-0&authSource=admin&retryWrites=true&w=majority');
app.set('clave','abcdefg');
app.set('crypto',crypto);


app.listen(app.get('port'), function(){
    console.log('Servidor activo');
});

var routerUsuarioSession = express.Router();
routerUsuarioSession.use(function(req, res, next) {
    console.log("routerUsuarioSession");
    if ( req.session.usuario ) {
        next();
    } else {
        console.log("va a : "+req.session.destino)
        res.redirect("/identificarse");
    }
});

//routerAudios
let routerAudios = express.Router();
routerAudios.use(function(req, res, next) {
    console.log("routerAudios");
    let path = require('path');
    let idCancion = path.basename(req.originalUrl, '.mp3');
    gestorBD.obtenerCanciones(
        {"_id": mongo.ObjectID(idCancion) }, function (canciones) {
            if(req.session.usuario && canciones[0].autor == req.session.usuario ){
                next();
            } else {
                res.redirect("/tienda");
            }
        })
});

//Aplicar routerAudios
app.use("/audios/",routerAudios);
//Aplicar routerUsuarioSession
app.use("/canciones/agregar",routerUsuarioSession);
app.use("/publicaciones",routerUsuarioSession);


require("./routes/rusuarios.js")(app,swig, gestorBD);
require("./routes/rcanciones.js")(app, swig, gestorBD);
require("./routes/rautores.js")(app, swig);

app.use(express.static('public'));