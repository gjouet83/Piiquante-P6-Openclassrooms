const Sauce = require("../models/sauce");

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
	const sauce = new Sauce({
		...req.body,
	});
	sauce
		.save()
		.then(() => {
			res.status(201).json({ 
                message: "Sauce crée avec succes", 
            });
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};
