'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ArtisSchema = Schema({
    name: String,
    surname: String,
    description: String,
    image: String,
});

module.exports = mongoose.model('Artist', ArtisSchema);