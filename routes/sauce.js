const express = require("express");
const sauceCtrl = require("../controllers/sauce");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer");

const router = express.Router();

router.get("/", auth, sauceCtrl.getAllSauces);
router.get("/:id", auth, sauceCtrl.getOneSauce);

router.post("/", auth, multer, sauceCtrl.createSauce);

module.exports = router;