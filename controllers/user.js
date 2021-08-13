const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const CryptoJS = require("crypto-js");

//personnalisation de KEY et IV pour la comparaison lors du login
const key = CryptoJS.enc.Hex.parse(process.env.KEY);
const iv = CryptoJS.enc.Hex.parse(process.env.IV);

// regex pour la protection d'injection de code
const validEmail = (email) => {
    return /^[a-z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/.test(email);
};

const validPassword = (password) => {
	return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}[^@&"()!_$*€£`+=\/;?#]+$/.test(password);
}

exports.signup = (req, res, next) => {
	//on teste les champs
	if (!validEmail(req.body.email)){
		return res.status(401).json({ message: "Email non valide"});
	}
	if (!validPassword(req.body.password)){
		return res.status(401).json({ message: "Le mot de passe doit contenir au moins 8 caractères avec : une majuscule, une minuscule, un chiffre et ne doit pas contenir de caractères spéciaux"});
	}
	bcrypt
		// on hash le mot de passe
		.hash(req.body.password, 10)
		.then((hash) => {
			//on crée un user en cryptant le mail et en ajoutant le hash 
			const user = new User({
				email: CryptoJS.AES.encrypt(req.body.email, key, {iv: iv}).toString(),
				password: hash,
			});
			//on enregistre dans la bdd
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
	//on teste les champs
	if (!validEmail(req.body.email)){
		return res.status(401).json({ message: "Email non valide"});
	}
	if (!validPassword(req.body.password)){
		return res.status(401).json({ message: "Le mot de passe doit contenir au moins 8 caractères avec : une majuscule, une minuscule, un chiffre et ne doit pas contenir de caractères spéciaux"});
	}
	//on cherche le user avec le même email crypté
	User.findOne({ email: CryptoJS.AES.encrypt(req.body.email, key, {iv: iv}).toString() })
		.then((user) => {
			if (!user) {
				return res.status(401).json({ error: "Utilisateur non enregistré" });
			}
			bcrypt
				//on compare le hash du password
				.compare(req.body.password, user.password)
				.then((passwordOk) => {
					if (!passwordOk) {
						return res.status(401).json({ error: "Mot de passe incorrect" });
					}
					// on crée un token 
					res.status(200).json({
						userId: user._id,
						token: jwt.sign(
							{ userId: user._id },
							process.env.USER_TOKEN,
							{ expiresIn: "4h" }
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
