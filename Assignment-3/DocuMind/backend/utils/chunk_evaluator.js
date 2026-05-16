const groq = require("./groq");


const evaluateChunk = async (query, chunk) => {
	try {
		const prompt=`
		Query: ${query}

		Chunk: ${chunk}
		
		Evaluate how relevant the chunk is for answering the query

		Return ONLY a number from 0-100.
		Do NOT explain.
		Do NOT include % symbol.
		PERCENTAGE:
		`;

		const systemPrompt=`
		You are an AI that check whether given chunk matches the context of the given query.
		Do NOT answer the query.
		Only check the relevance.
		`;

		const response = await groq.chat.completions.create({
			model: "llama-3.1-8b-instant",
			messages: [
				{
					role:"system",
					content:systemPrompt
				},
				{
					role:"user",
					content:prompt,
				},
			],
			temperature:0.2,
		});
		const score = response.choices[0]?.message?.content?.trim();
		console.log("Chunk score: ", score);
		return parseInt(score);
	} catch (error){
		console.error(error);
		
		return 0;
	}

};

module.exports = evaluateChunk;
