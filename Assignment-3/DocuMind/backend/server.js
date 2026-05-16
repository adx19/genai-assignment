const express = require("express");
const cors = require("cors");

require("dotenv").config();

const chatRoutes = require(
  "./routes/chat.routes"
);

const uploadRoutes = require(
  "./routes/upload.routes"
);

const documentRoutes = require(
  "./routes/document.routes"
);

const app = express();

app.use(cors());

app.use(express.json());
console.log("NEW SERVER VERSION RUNNING");
app.use("/api/upload", uploadRoutes);

app.use("/api/chat", chatRoutes);

app.use(
  "/api/documents",
  documentRoutes
);

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});
