const Sauce = require("../models/sauce");
const fs = require("fs");

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
	const sauceObj = JSON.parse(req.body.sauce);
	const sauce = new Sauce({
		...sauceObj,
		imageUrl: `${req.protocol}://${req.get("host")}/images/${
			req.file.filename
		}`,
	});
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
	const sauceObj = req.file
		? {
				...JSON.parse(req.body.sauce),
				imageUrl: `${req.protocol}://${req.get("host")}/images/${
					req.file.filename
				}`,
		  }
		: { ...req.body };
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
			const filename = sauce.imageUrl.split("/images/")[1];
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
		Sauce.updateOne(
			{ _id: req.params.id },
			{
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
	} else if (req.body.like === 0) {
		Sauce.findOne({ _id: req.params.id, usersLiked: req.body.userId })
			.then((userLiked) => {
				console.log(userLiked);
				if (userLiked) {
					Sauce.updateOne(
						{ _id: req.params.id },
						{
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
					console.log("test");
					Sauce.updateOne(
						{ _id: req.params.id },
						{
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
	} else if (req.body.like === -1) {
		Sauce.updateOne(
			{ _id: req.params.id },
			{
				$inc: { dislikes: 1 },
				$push: { usersDisliked: req.body.userId },
				_id: req.params.id,
			}
		)
			.then(() => {
				res.status(200).json({
					message: "Sauce modifiée avec succès",
				});
			})
			.catch((error) => {
				res.status(400).json({ error });
			});
	}
};
