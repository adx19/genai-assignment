const express = require("express");

const {
  documentStore,
} = require("../store/documentStore");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    documents: documentStore,
  });
});

module.exports = router;
