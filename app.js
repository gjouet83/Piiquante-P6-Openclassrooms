require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const app = express();


console.log(process.env);
mongoose
	.connect(
		process.env.APP_MONGODBURL,
		{ useNewUrlParser: true, useUnifiedTopology: true }
	)
	.then(() => console.log("Connexion à MongoDB réussie !"))
	.catch(() => console.log("Connexion à MongoDB échouée !"));

module.exports = app;
