'use strict'

var fs = require('fs');
var path = require('path');

var mongoosePagination = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');

function getAlbum(req, res) {
    var albumId = req.params.id;

    // De este modo se busca una coleccion y se llena la relacion que contiene con otra
    // Coleccion, de manera automatica
    Album.findById(albumId).populate({path: 'artist'}).exec((err, album) => {
        if(err){
            res.status(500).send({message: 'Error en la peticion.'});
        } else {
            if(!album){
                res.status(404).send({message: 'El album no existe'});
            } else{
                res.status(200).send({album});
            }
        }
    });    
}

function getAlbums(req, res){
    var artisId = req.params.artist;

    if(!artisId){
        // sacar todos los albums en la BD
        var find = Album.find().sort('title');

    } else {
        // sacar los albums espeficificos de un artista
        var find = Album.find({artist: artisId}).sort('title');
    }

    // relleno el artributo de artist con el ID asociado
    find.populate({path: 'artist'}).exec((err, albums) => {
        if(err){
            res.status(500).send({message: 'Error en la peticion'});
        } else {
            if(!albums){
                res.status(404).send({message: 'No hay albums'});
            } else {
                res.status(200).send({albums});
            }
            
        }
    });
    

}

function saveAlbum(req, res){
    var album = new Album();

    var params = req.body;
    album.title = params.title;
    album.description = params.description;
    album.year = params.year;
    album.image = 'null';
    album.artist = params.artist;

    album.save((err, albumStored) => {
        if(err){
            res.status(500).send({message: "Error en el servidor"});
        } else {
            if(!albumStored){
                res.status(404).send({message: "No se ha guardado el album"});
            } else {
                res.status(200).send({album: albumStored});
            }
        }
    });

}

function updateAlbum(req, res){
    var albumId = req.params.id;
    var update = req.body;

    Album.findByIdAndUpdate(albumId, update, function(err, albumUpdated){
        if(err){
            res.status(500).send({message: "Error en el servidor"});
        } else {
            if(!albumUpdated){
                res.status(404).send({message: "No se ha actualizado el Album"});
            } else {
                res.status(200).send({album: albumUpdated});
            }
        }
    });
}

function deleteAlbum(req, res){
    var albumId = req.params.id;

    Album.findByIdAndRemove(albumId, function (err, albumRemoved) {
        if(err){
            res.status(500).send({message: "Error en el servidor"});
        } else {
            if(!albumRemoved){
                res.status(404).send({message: "No se ha eliminado el Album"});
            } else {
                Song.find({album: albumRemoved._id}).remove((err, songRemoved) => {
                    if(err){
                        res.status(500).send({message: "Error al Eliminar la cancion."});
                    } else {
                        if(!songRemoved){
                            res.status(404).send({message: "La cancion no ha sido eliminado."});
                        } else {
                            res.status(200).send({album: albumRemoved});
                        }
                    }
                })
            }
        }   
    })
}

function uploadImage(req, res){
    var albumId = req.params.id;
    var file_name = "No subido...";

    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('\/');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
            Album.findByIdAndUpdate(albumId,{image: file_name}, (err, albumUpdate) => {
                if(!albumUpdate){
                    res.status(404).send({message: 'No se ha podido actualizar el artist...'});
                } else {
                    res.status(200).send({album: albumUpdate});
                }
            })
        } else {
            res.status(404).send({message: 'No ha subido ninguna image...'});
        }
    }
}

function getImageFile(req, res){
    var imageFile = req.params.imageFile;
    var path_file = './uploads/albums/' + imageFile;

    fs.exists(path_file, (exists) => {
        if(exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({message: 'No existe la imagen...'})
        }
    })
}

module.exports = {
    getAlbum,
    saveAlbum,
    getAlbums,
    updateAlbum,
    deleteAlbum,
    uploadImage,
    getImageFile
}