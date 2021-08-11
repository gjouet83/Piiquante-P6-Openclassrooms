const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const CryptoJS = require("crypto-js");

const key = CryptoJS.enc.Hex.parse(process.env.KEY);
const iv = CryptoJS.enc.Hex.parse(process.env.IV);

const validEmail = (email) => {
    return /^[a-z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/.test(email);
};

const validPassword = (password) => {
	return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}[^@&"()!_$*€£`+=\/;?#]+$/.test(password);
}

exports.signup = (req, res, next) => {
	if (!validEmail(req.body.email)){
		return res.status(401).json({ message: "Email non valide"});
	}
	if (!validPassword(req.body.password)){
		return res.status(401).json({ message: "Le mot de passe doit contenir au moins 8 caractères avec : une majuscule, une minuscule, un chiffre et ne doit pas contenir de caractères spéciaux"});
	}
	bcrypt
		.hash(req.body.password, 10)
		.then((hash) => {
			const user = new User({
				email: CryptoJS.AES.encrypt(req.body.email, key, {iv: iv}).toString(),
				password: hash,
			});
			user.save()
				.then(() => {
					res.status(201).json({ message: "Utilisateur créé avec succès"});
				})
				.catch((error) => {
					res.status(400).json({ error });
				});
		})
		.catch((error) => {
			res.status(500).json({ error });
		});
};

exports.login = (req, res, next) => {
	if (!validEmail(req.body.email)){
		return res.status(401).json({ message: "Email non valide"});
	}
	if (!validPassword(req.body.password)){
		return res.status(401).json({ message: "Le mot de passe doit contenir au moins 8 caractères avec : une majuscule, une minuscule, un chiffre et ne doit pas contenir de caractères spéciaux"});
	}
	User.findOne({ email: CryptoJS.AES.encrypt(req.body.email, key, {iv: iv}).toString() })
		.then((user) => {
			if (!user) {
				return res.status(401).json({ error: "Utilisateur non enregistré" });
			}
			bcrypt
				.compare(req.body.password, user.password)
				.then((passwordOk) => {
					if (!passwordOk) {
						return res.status(401).json({ error: "Mot de passe incorrect" });
					}
					res.status(200).json({
						userId: user._id,
						token: jwt.sign(
							{ userId: user._id },
							process.env.USER_TOKEN,
							{ expiresIn: "24h" }
						),
					});
				})
				.catch((error) => {
					res.status(500).json({ error });
				});
		})
		.catch((error) => {
			res.status(501).json({ error });
		});
};
