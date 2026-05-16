const express = require("express");


const {
  chatWithDocument,
} = require("../controllers/chat.controller");

const router = express.Router();



router.post("/", (req, res, next) => {
  console.log("Chat route hit...");
  next();
});

router.post("/", chatWithDocument);


module.exports = router;
