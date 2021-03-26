//esta funcion se exportará como módulo
module.exports = function(app, swig) {
    app.get("/usuarios", function(req, res) {
        res.send("ver usuarios");
    });
};