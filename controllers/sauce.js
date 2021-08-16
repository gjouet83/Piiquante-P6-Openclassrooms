const Sauce = require("../models/sauce");
const fs = require("fs");

// regex pour la protection d'injection de code
const validFields = (field) => {
	return /^[\sa-zA-Z0-9ÀÂÇÈÉÊËÎÔÙÛàâçèéêëîôöùû\.\(\)\[\]\"\'\-,;:\/!\?]+$/g.test(
		field
	);
};

exports.getAllSauces = (req, res, next) => {
	Sauce.find()
		.then((sauces) => {
			res.status(200).json(sauces);
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

exports.getOneSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id })
		.then((sauce) => {
			res.status(200).json(sauce);
		})
		.catch((error) => {
			res.status(404).json({ error });
		});
};

exports.createSauce = (req, res, next) => {
	// on crée un objet JSON avec la requête et on crée une nouvelle sauce en ajoutant l'url de l'image
	const sauceObj = JSON.parse(req.body.sauce);
	// on teste les champs de saisie pour vérifier qu'il n'y ait pas de caractères interdits
	if (!validFields(sauceObj.name)) {
		return res.status(406).json({ message: "Caractères non autorisés" });
	}
	if (!validFields(sauceObj.manufacturer)) {
		return res.status(406).json({ message: "Caractères non autorisés" });
	}
	if (!validFields(sauceObj.description)) {
		return res.status(406).json({ message: "Caractères non autorisés" });
	}
	if (!validFields(sauceObj.mainPepper)) {
		return res.status(406).json({ message: "Caractères non autorisés" });
	}
	const sauce = new Sauce({
		...sauceObj,
		imageUrl: `${req.protocol}://${req.get("host")}/images/${
			req.file.filename
		}`,
	});
	// on enregistre la sauce dans la bdd
	sauce
		.save()
		.then(() => {
			res.status(201).json({ message: "Sauce crée avec succès" });
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

exports.modifySauce = (req, res, next) => {
	//on crée un nouvel objet en vérifiant si la requête contient un fichier
	const sauceObj = req.file
		? {
				...JSON.parse(req.body.sauce),
				imageUrl: `${req.protocol}://${req.get("host")}/images/${
					req.file.filename
				}`,
		  }
		: { ...req.body };
	// on teste les champs de saisie pour vérifier qu'il n'y ait pas de caractères interdits
	if (!validFields(sauceObj.name)) {
		return res.status(406).json({ message: "Caractères non autorisés" });
	}
	if (!validFields(sauceObj.manufacturer)) {
		return res.status(406).json({ message: "Caractères non autorisés" });
	}
	if (!validFields(sauceObj.description)) {
		return res.status(406).json({ message: "Caractères non autorisés" });
	}
	if (!validFields(sauceObj.mainPepper)) {
		return res.status(406).json({ message: "Caractères non autorisés" });
	}
	Sauce.updateOne({ _id: req.params.id }, { ...sauceObj, _id: req.params.id })
		.then(() => {
			res.status(200).json({ message: "Sauce modifiée avec succès" });
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

exports.deleteSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id })
		.then((sauce) => {
			//on split autour d'images dans l'url pour récupérer le nom de fichier
			const filename = sauce.imageUrl.split("/images/")[1];
			//on supprime le fichier
			fs.unlink(`images/${filename}`, () => {
				Sauce.deleteOne({ _id: req.params.id })
					.then(() => {
						res.status(200).json({
							message: "Sauce supprimée avec succès",
						});
					})
					.catch((error) => {
						res.status(400).json({ error });
					});
			});
		})
		.catch((error) => {
			res.status(500).json({ error });
		});
};

exports.likeSauce = (req, res, next) => {
	if (req.body.like === 1) {
		Sauce.findOne({ _id: req.params.id, usersLiked: req.body.userId })
			.then((alreadyLiked) => {
				if (!alreadyLiked) {
					Sauce.updateOne(
						{ _id: req.params.id },
						{
							//si like=1 on incrémente les likes et on ajoute le userId dans le tableau usersLiked
							$inc: { likes: 1 },
							$push: { usersLiked: req.body.userId },
							_id: req.params.id,
						}
					)
						.then(() => {
							res.status(200).json({
								message: "Sauce likée",
							});
						})
						.catch((error) => {
							res.status(400).json({ error });
						});
				}
			})
			.catch((error) => {
				res.status(400).json({ error });
			});
	} else if (req.body.like === 0) {
		// si like=0 alors le user retire soit son like soit son dislike
		// on cherche alors si le user est présent dans le tableau usersLiked de la sauce
		Sauce.findOne({ _id: req.params.id, usersLiked: req.body.userId })
			.then((userLiked) => {
				if (userLiked) {
					Sauce.updateOne(
						{ _id: req.params.id },
						{
							//on décrémente les likes et on retire le userId dans le tableau usersLiked
							$inc: { likes: -1 },
							$pull: { usersLiked: req.body.userId },
							_id: req.params.id,
						}
					)
						.then(() => {
							res.status(200).json({
								message: "Retrait du like",
							});
						})
						.catch((error) => {
							res.status(400).json({ error });
						});
				} else {
					Sauce.findOne({ _id: req.params.id, usersDisliked: req.body.userId })
						.then((alreadyDisliked) => {
							// si like=0 et qu'il n'est pas présent dans usersLiked et qu'il est dans usersDisliked
							if (alreadyDisliked) {
								Sauce.updateOne(
									{ _id: req.params.id },
									{
										//on décrémente les dislikes et on retire le userId dans le tableau usersDisliked
										$inc: { dislikes: -1 },
										$pull: { usersDisliked: req.body.userId },
										_id: req.params.id,
									}
								)
									.then(() => {
										res.status(200).json({
											message: "Retrait du Dislike",
										});
									})
									.catch((error) => {
										res.status(400).json({ error });
									});
							}
						})
						.catch((error) => {
							res.status(400).json({ error });
						});
				}
			})
			.catch((error) => {
				res.status(400).json({ error });
			});
	} else if (req.body.like === -1) {
		Sauce.findOne({ _id: req.params.id, usersDisliked: req.body.userId })
			.then((alreadyDisliked) => {
				if (!alreadyDisliked) {
					Sauce.updateOne(
						{ _id: req.params.id },
						{
							//si like=-1 on incrémente les dislikes et on ajoute le userId dans le tableau usersDisliked
							$inc: { dislikes: 1 },
							$push: { usersDisliked: req.body.userId },
							_id: req.params.id,
						}
					)
						.then(() => {
							res.status(200).json({
								message: "Sauce dislikée",
							});
						})
						.catch((error) => {
							res.status(400).json({ error });
						});
				}
			})
			.catch((error) => {
				res.status(400).json({ error });
			});
	}
};
