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

function getArtist(req, res) {
    var artistId = req.params.id;

    Artist.findById(artistId, (err, artist) =>{
        if(err){
            res.status(500).send({message: 'Error en la peticion.'});
        } else {
            if(!artist){
                res.status(404).send({message: 'El artista no existe'});
            } else{
                res.status(200).send({artist});
            }
        }
    });    
}

function getArtists(req, res){
    var page = req.params.page || 1 ;

    var itemsPerPage = 3;

    Artist.find().sort('name').paginate(page, itemsPerPage, (err, artists, total) => {
        if(err){
            res.status(500).send({message: 'Error en la peticion.'});
        }else{
            if(!artists){
                res.status(404).send({message: 'No hay artistas.'});
            } else {
                return res.status(200).send({
                    total_items: total,
                    artists: artists
                });
            }
            
        }
    });
}

function saveArtist(req, res){
    var artist = new Artist();

    var params = req.body;
    artist.name = params.name;
    artist.description = params.description;
    artist.image = 'null';

    artist.save((err, artistStorage) => {
        if(err){
            res.status(500).send({message: 'Error al guardar el artista'});
        }else{
            if(!artistStorage){
                res.status(404).send({message: 'El artista no ha sido guardado'});
            } else {
                res.status(200).send({artist: artistStorage});
            }
        }
    });

}

function updateArtist(req, res){
    var artistId = req.params.id;
    var update = req.body;

    Artist.findByIdAndUpdate(artistId, update, (err, artistUpdate) => {
        if(err){
            res.status(500).send({message: "Error al actualizar el artista."});
        } else {
            if(!artistUpdate){
                res.status(404).send({message: "No se ha podio actualizar al artista"});
            } else {
                res.status(200).send({artist: artistUpdate});
            }
        }
    });
}

function deleteAtist(req, res){
    var artistId = req.params.id;
    
    Artist.findByIdAndRemove(artistId, (err, artistRemoved) => {
        if(err){
            res.status(500).send({message: "Error al Eliminar el Artista."});
        } else {
            if(!artistRemoved){
                res.status(404).send({message: "El artista no ha sido eliminado."});
            } else {
                Album.find({artist: artistRemoved._id}).remove((err, albumRemoved) => {
                    if(err){
                        res.status(500).send({message: "Error al Eliminar el Album."});
                    } else {
                        if(!albumRemoved){
                            res.status(404).send({message: "El Album no ha sido eliminado."});
                        } else {
                            Song.find({album: albumRemoved._id}).remove((err, songRemoved) => {
                                if(err){
                                    res.status(500).send({message: "Error al Eliminar la cancion."});
                                } else {
                                    if(!songRemoved){
                                        res.status(404).send({message: "La cancion no ha sido eliminado."});
                                    } else {
                                        res.status(200).send({artist: artistRemoved});
                                    }
                                }
                            })
                        }
                    }
                })
            }
        }
    })
}

function uploadImage(req, res){
    var artistId = req.params.id;
    var file_name = "No subido...";

    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('\/');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
            Artist.findByIdAndUpdate(artistId,{image: file_name}, (err, artistUpdate) => {
                if(!artistUpdate){
                    res.status(404).send({message: 'No se ha podido actualizar el artist...'});
                } else {
                    res.status(200).send({artis: artistUpdate});
                }
            })
        } else {
            res.status(404).send({message: 'No ha subido ninguna image...'});
        }
    }
}

function getImageFile(req, res){
    var imageFile = req.params.imageFile;
    var path_file = './uploads/artists/' + imageFile;

    fs.exists(path_file, (exists) => {
        if(exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({message: 'No existe la imagen...'})
        }
    })
}

module.exports = {
    getArtist,
    saveArtist,
    getArtists,
    updateArtist,
    deleteAtist,
    uploadImage,
    getImageFile
}