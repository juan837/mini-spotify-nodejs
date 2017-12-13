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

function getSong(req, res) {
  var songId = req.params.id;
  
  // De este modo se busca una coleccion y se llena la relacion que contiene con otra
  // Coleccion, de manera automatica
  Song.findById(songId).populate({path: 'album'}).exec((err, song) => {
      if(err){
          res.status(500).send({message: 'Error en la peticion.'});
      } else {
          if(!song){
              res.status(404).send({message: 'La cancion no existe'});
          } else{
              res.status(200).send({song});
          }
      }
  });  
}

function getSongs(req, res) {
  var albumId = req.params.album;

  if(!albumId){
    // sacar todas las canciones en la BD
    var find = Song.find().sort('number');

  } else {
      // sacar los albums espeficificos de un artista
      var find = Song.find({album: albumId}).sort('number');
  }

  // relleno el artributo de artist con el ID asociado
  find.populate({
    path: 'album', 
    populate: {
      path: 'artist',
      model: 'Artist'
    }
  }).exec((err, songs) => {
      if(err){
          res.status(500).send({message: 'Error en la peticion'});
      } else {
          if(!songs){
              res.status(404).send({message: 'No hay canciones'});
          } else {
              res.status(200).send({songs});
          }
      }
  });
}

function saveSong(req, res) {
  var song = new Song();

  var params = req.body;
  song.number = params.number;
  song.name = params.name;
  song.duration = params.duration;
  song.file = null;
  song.album = params.album;

  song.save((err, songStorage) => {
    if (err) {
      res.status(500).send({message: 'Error en el servido'});
    } else {
      if (!songStorage) {
        res.status(404).send({message: 'No se ha guardado la cancion'});
      } else {
        res.status(200).send({song: songStorage});
      }
    }
  });
}

function updateSong(req, res){
  var songId = req.params.id;
  var update = req.body;

  Song.findByIdAndUpdate(songId, update, function(err, songUpdated){
      if(err){
          res.status(500).send({message: "Error en el servidor"});
      } else {
          if(!songUpdated){
              res.status(404).send({message: "No se ha actualizado la cancion"});
          } else {
              res.status(200).send({song: songUpdated});
          }
      }
  });
}

function deleteSong(req, res) {
  var songId = req.params.id;
  Song.findOneAndRemove(songId, function (err, songRemoved) {
    if(err){
      res.status(500).send({message: "Error en el servidor"});
    } else {
        if(!songRemoved){
            res.status(404).send({message: "No se ha eliminado la cancion"});
        } else {
            res.status(200).send({song: songRemoved});
        }
    }
  })
}

function uploadSongFile(req, res){
  var songId = req.params.id;
  var file_name = "No subido...";

  if(req.files){
      var file_path = req.files.file.path;
      var file_split = file_path.split('\/');
      var file_name = file_split[2];

      var ext_split = file_name.split('\.');
      var file_ext = ext_split[1];
      console.log('Ext ', file_ext);
      if(file_ext == 'mp3' || file_ext == 'ogg'){
          console.log('song id ', songId);
          console.log('file name ', file_name);
          Song.findByIdAndUpdate(songId,{file: file_name}, (err, songUpdate) => {
              if(!songUpdate){
                  res.status(404).send({message: 'No se ha podido actualizar la cancion...'});
              } else {
                  res.status(200).send({image: file_name, song: songUpdate});
              }
          })
      } else {
          res.status(404).send({message: 'No ha subido ninguna cancion...'});
      }
  }
}


function getSongFile(req, res){
  var songFile = req.params.songFile;
  var path_file = './uploads/songs/' + songFile;

  fs.exists(path_file, (exists) => {
      if(exists) {
          res.sendFile(path.resolve(path_file));
      } else {
          res.status(200).send({message: 'No existe la cancion...'})
      }
  })
}

module.exports = {
  getSong,
  saveSong,
  getSongs,
  updateSong,
  deleteSong,
  uploadSongFile,
  getSongFile
}