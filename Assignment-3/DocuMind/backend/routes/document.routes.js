const express = require("express");

const {
	documentStore,
} = require("../store/documentStore");

const {
	vectorStore,
} = require("../store/vectorStore");


const router = express.Router();

router.get("/", (req, res) => {

	console.log("Documents requested:", documentStore);

	res.json({
		documents: documentStore,
	});
});

router.post("/:id/select", (req, res) => {
	const id = req.params.id;
	
	documentStore.forEach(
		doc=>doc.active=false
	);
	
	const selectedDoc= documentStore.find(doc=>doc.id===id);

	if(!selectedDoc){
		return res.status(404).json({error: "Document not found"});
	}

	selectedDoc.active = true;
	
	res.json({success:true});
});

router.delete("/:id", (req, res)=>{
	const id = req.params.id;
	
	const index = documentStore.findIndex(doc=>doc.id===id);
	
	if(index === -1){
		return res.status(404).json({error:"Not found"});
	}

	documentStore.splice(index,1);

	for(let i = vectorStore.length-1; i>=0; i--){
		if(vectorStore[i].documentId===id){
			vectorStore.splice(i,1);
		}
	}

	res.json({success:true});
});


module.exports = router;
