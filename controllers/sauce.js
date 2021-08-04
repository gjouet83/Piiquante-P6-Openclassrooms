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
		imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
	});
	sauce.save()
		.then(() => {
			res.status(201).json({ message: "Sauce crée avec succes"});
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

exports.modifySauce = (req, res, next) => {
    const sauceObj = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
	Sauce.updateOne({ _id: req.params.id }, { ...sauceObj, _id: req.params.id })
		.then(() => {
			res.status(200).json({ message: "Sauce modifiée avec succes" });
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

exports.deleteSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => {
			res.status(200).json({ message: "Sauce supprimée avec succès"})
		  })
          .catch((error) => {
			res.status(400).json({ error })
		  });
      });
    })
    .catch((error) => {
		res.status(500).json({ error })
	});
};
