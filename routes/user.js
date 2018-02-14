'use strict'

var express = require('express');
var UserController = require('../controllers/user');
var md_auth = require('../middlewares/authenticated');

var api = express.Router();

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/users'});

// defino la rutas que tendra la api asociada con cada mentodo
// del controlador
api.get('/probando-controlador', md_auth.ensureAuth, UserController.pruebas);
api.get('/users', md_auth.ensureAuth, UserController.usersList);
api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.put('/update-user/:id', md_auth.ensureAuth, UserController.updateUser);
api.post('/upload-image-user/:id', [md_auth.ensureAuth, md_upload], UserController.uploadImage);
api.get('/get-image-user/:imageFile', UserController.getImageFile);

module.exports = api;
