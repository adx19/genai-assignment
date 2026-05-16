const {
  generateEmbedding,
} = require("../utils/embedding");

const {
  vectorStore,
} = require("../store/vectorStore");

const {
  documentStore,
} = require("../store/documentStore");

const multer = require("multer");

const {
  chunkText,
} = require("../utils/chunk");

const {
  extractTextFromPDF,
} = require("../utils/pdf");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

const uploadMiddleware =
  upload.single("file");

const uploadDocument = async (
  req,
  res
) => {
  uploadMiddleware(req, res, async (err) => {
    try {
      if (err) {
        return res.status(500).json({
          error: "File upload failed",
        });
      }

      const file = req.file;

      if (!file) {
        return res.status(400).json({
          error: "No file uploaded",
        });
      }

      let extractedText = "";

      if (
        file.mimetype === "application/pdf"
      ) {
        extractedText =
          await extractTextFromPDF(
            file.buffer
          );
      } else {
        extractedText =
          file.buffer.toString("utf-8");
      }

      	const id = Date.now().toString();

	documentStore.forEach(
		doc => doc.active = false
	);

	
	const chunks = chunkText(
	        extractedText
      	);

      	for (const chunk of chunks) {
        	const embedding = await generateEmbedding(chunk);

        	vectorStore.push({
          		text: chunk,
          		embedding,
			documentId: id
        	});
      	}

      // Store document metadata
      	documentStore.push({
        	id,
        	filename: file.originalname,
        	status: "Ready for chat",
        	uploadedAt: new Date(),
		active: true
      	});
	
	console.log("Document store:", documentStore);
	
	console.log("Vector store size:", vectorStore.length);

      	console.log(chunks[0]);

      	return res.status(200).json({
        	success: true,
        	fileName: file.originalname,
        	totalChunks: chunks.length,
        	vectorsStored:
          	vectorStore.length,
      	});
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: "Server error",
      });
    }
  });
};

module.exports = {
  uploadDocument,
};
