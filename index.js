'use strict'

var mongoose = require('mongoose');
var app = require('./app.js');
var port = process.env.PORT || 9000;

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/curso_mean2', (err, res) => {
    if(err){
        throw err;
    } else {
        console.log("La BD esta conectada");

        app.listen(port, function(){
            console.log('Servidor API de musica escuchando en http://localhost:' + port);
        });
    }
});