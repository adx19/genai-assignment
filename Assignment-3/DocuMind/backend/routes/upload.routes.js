const express = require("express");

const {
  uploadDocument,
} = require("../controllers/upload.controller");

const router = express.Router();

router.post("/", uploadDocument);

module.exports = router;
