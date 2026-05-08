const express = require("express");

const {
  chatWithDocument,
} = require("../controllers/chat.controller");

const router = express.Router();

router.post("/", chatWithDocument);

module.exports = router;
