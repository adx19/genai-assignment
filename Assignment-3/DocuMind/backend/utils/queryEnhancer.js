const groq = require("./groq");


const enhanceQuery = async (query) => {
	console.log("Enhancer called...");
	try {
		console.log("Enhancer running...");
		
		const prompt = `
		You are an AI system that improves user queries for sematic document retrieval.
		Your job is to rewrite vague or short queries into semantically rich technical search queries.
		
		RULES:
		- Preserve the original intent.
		- Expand implied techincal meaning.
		- Add missing technical context ONLY if strongly implied.
		- Keep important concepts from the original query.
		- Fix spelling and grammar.
		- Do NOT answer the query.
		- Do NOT make the query shorter.
		- Do NOT make the query generic.
		- Return ONLY the reqritten query.
		
		Examples:
		
		User Query:
		hash ring thing
	
		Rewritten Query:
		How does the hash ring work in consistent hasing systems?
	
		User Query:
		nodes removed.

		Rewritten Query:
		What happens when nodes are removed ina consistent hashing system?
		
		User Query:
		cache scaling.

		Rewritten Query:
		How does scaling work in distributed caching systems using consistent hasing?
	
		USER QUERY:
		${query}
		`;
		
		const response = await groq.chat.completions.create({
			model: "llama-3.1-8b-instant",
			
			messages: [
				{
					role: "system",
					content: "You improve search queries for semantic retrieval systems.",
				},
				{
					role: "user",
					content: prompt,
				},
			],
			
			temperature: 0.2,
		});
		const enhancedQuery = response.choices[0]?.message?.content?.trim();
		if(!enhancedQuery) return query;
		
		const cleanedQuery = enhancedQuery.replace(/"/g, "");
		
		return enhancedQuery;

	} catch (error) {
		console.error(error);
		return query;
	}
};

module.exports = {
	enhanceQuery,
};


