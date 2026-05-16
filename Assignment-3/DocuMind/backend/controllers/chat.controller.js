const groq = require("../utils/groq");
const { enhanceQuery } = require("../utils/queryEnhancer");
const { documentStore } = require("../store/documentStore");

const {
	runRetrievalAttempt
} = require("../utils/retrieval_check");


const chatWithDocument = async(req,res)=>{

	try{

		const { question } = req.body;

		if(!question){

			return res.status(400).json({
				error:"Question required"
			});

		}


		const activeDoc =
		documentStore.find(
			doc=>doc.active
		);

		if(!activeDoc){

			return res.status(400).json({
				error:"No active document"
			});

		}


		let currentQuery =
		await enhanceQuery(question);

		let retryCount = 0;

		const maxRetries = 1;

		let result;


		while(
			retryCount <= maxRetries
		){

			result =
			await runRetrievalAttempt(
				currentQuery,
				activeDoc
			);


			if(
				result.retrievalStrong
			){

				break;

			}


			console.log(
				"Weak retrieval detected"
			);


			currentQuery =
			await enhanceQuery(
				currentQuery
			);

			retryCount++;

		}



		if(
			result.relevantChunks.length===0
		){

			return res.status(200).json({

				answer:
				"I could not find information related to your question inside this document"

			});

		}



		const context =
		result.relevantChunks
		.map(
			chunk=>chunk.text
		)
		.join("\n\n");



		const prompt = `

You are DocuMind AI, an intelligent conversational assistant that helps users understand uploaded documents.

GUIDELINES:
- Use provided context primarily
- Answer naturally
- Combine information when needed
- Keep answer conversational

CONTEXT:

${context}

USER QUESTION:

${question}

ASSISTANT RESPONSE:

`;


		const response =
		await groq.chat.completions.create({

			model:"llama-3.1-8b-instant",

			messages:[

				{
					role:"system",

					content:
					"You are DocuMind AI"
				},

				{
					role:"user",
					content:prompt
				}

			],

			temperature:0.5

		});



		const answer =
		response
		.choices[0]
		?.message
		?.content
		||
		"No response generated";



		return res.status(200).json({

			answer,

			contextChunks:
			result.relevantChunks.length,

			retries:
			retryCount

		});


	}catch(error){

		console.log(error);

		return res.status(500).json({
			error:"Server error"
		});

	}

};


module.exports = {
	chatWithDocument
};
