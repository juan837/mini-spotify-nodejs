'use strict'

var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');

function pruebas(req, res){
    res.status(200).send({
        message: 'Prueba...'
    });
}

function usersList(req, res) {
    User.find().sort('name').exec((err, users) => {
        if(err){
            res.status(500).send({message: 'Error en la peticion.'});
        }else{
            if(!users){
                res.status(404).send({message: 'No hay Usuarios.'});
            } else {
                return res.status(200).send({users});
            }
            
        }
    });
}

function saveUser(req, res){
     var user = new User();
     var params = req.body;

     console.log(params);

     //asigno las variables
     user.name = params.name;
     user.surname = params.surname;
     user.email = params.email;
     user.role = "ROLE_USER";
     user.image = 'null';

     //asigno la clave
     if(params.password){
        // Encriptar contrase#a
        bcrypt.hash(params.password, null, null, function(err, hash){
            user.password = hash;
            if(user.name != null && user.surname != null && user.email != null){
                // guardar el usuario
                user.save((err, userStored) => {
                    if(err){
                        res.status(500).send({ message: 'Error al guardar el usuario'});
                    } else {
                        if(!userStored){
                            res.status(404).send({ message: 'No se ha registrado' });
                        } else {
                            res.status(200).send({ user: userStored });
                        }
                        
                    }
                });
            }else{
                res.status(200).send({ message: 'Introduce todos los campos'});
            }
        });
     } else {
        res.status(200).send({ message: 'Introduce la clave'});
     }
     
}

function loginUser(req, res) {
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if(err) {
            res.status(500).send({ message: 'Error en la peticion'});
        } else {
            if (!user) {
                res.status(404).send({ message: 'El usuario no existe'});
            } else {
                //comprobar contrase#a
                bcrypt.compare(password, user.password, (err, check) => {
                    if (check) {
                        //devolvemos datos del usuario logueado
                        if(params.gethash){
                            //devolver token de jwt
                            res.status(200).send({
                                token: jwt.createToken(user)
                            });
                        }else{
                            res.status(200).send({user});
                        }
                    } else { 
                        res.status(404).send({ message: 'No puede loguearse'});
                    }
                })
            }
        }
    });


};

function updateUser(req, res){
    var userId = req.params.id;
    var update = req.body;

    console.log('userId ', userId);
    console.log('req.user.sub ', req.user.sub);
    if (userId !== req.user.sub) {
        return res.status(500).send({message: "No tiene permiso para actualizar este usuario"});
    }

    User.findByIdAndUpdate(userId, update, (err, userUpdate) => {
        if(err){
            res.status(500).send({message: "Error al actualizar el usuario"});
        } else {
            if(!userUpdate){
                res.status(404).send({message: "No se ha podido actualizar el usuario"});
            }else{
                res.status(200).send({user: userUpdate});
            }
        }
    });
}

function uploadImage(req, res){
    var userId = req.params.id;
    var file_name = 'No subido...';

    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('\/');
        var file_name = file_split[2];

        

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        console.log(file_ext);

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
            User.findByIdAndUpdate(userId, {image: file_name}, (err, userUpdate ) => {
                if(!userUpdate){
                    res.status(404).send({message: 'No se ha podido actualizar el usuario'})
                } else {
                    res.status(200).send({user: userUpdate});
                }
            })
        } else {
            res.status(200).send({message: 'Extension del archivo no validos'});
        }

        // console.log(file_split)
    } else {
        res.status(200).send({message: 'No ha subido ninguna imagen'});
    }
}

function getImageFile(req, res){
    var imageFile = req.params.imageFile;
    var path_file = './uploads/users/' + imageFile;

    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({message: 'No existe la imagen...'});
        }
    });
}

// aca cargo el array de funciones para que sean exportadas
module.exports = {
    pruebas,
    usersList,
    saveUser,
    loginUser,
    updateUser,
    uploadImage,
    getImageFile
}