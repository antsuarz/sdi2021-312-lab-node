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

app.use(express.static('public'));

app.set('port', 8081);

app.set('db','mongodb://admin:sdi@tiendamusica-shard-00-00.jxgw2.mongodb.net:27017,tiendamusica-shard-00-01.jxgw2.mongodb.net:27017,tiendamusica-shard-00-02.jxgw2.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-od6pn1-shard-0&authSource=admin&retryWrites=true&w=majority');
app.set('clave','abcdefg');
app.set('crypto',crypto);

require("./routes/rusuarios.js")(app,swig, gestorBD);
require("./routes/rcanciones.js")(app, swig, gestorBD);
require("./routes/rautores.js")(app, swig);

app.listen(app.get('port'), function(){
    console.log('Servidor activo');
});