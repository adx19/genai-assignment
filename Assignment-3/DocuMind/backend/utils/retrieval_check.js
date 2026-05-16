const { generateEmbedding } = require("./embedding");
const { cosineSimilarity } = require("./similarity");
const { vectorStore } = require("../store/vectorStore");
const evaluateChunk = require("./chunk_evaluator");

const runRetrievalAttempt = async(query,activeDoc)=>{

        const questionEmbedding =
        await generateEmbedding(query);

        const filteredVectors =
        vectorStore.filter(
                chunk =>
                chunk.documentId===activeDoc.id
        );

        const scoredChunks =
        filteredVectors.map(item=>({

                text:item.text,

                score:
                cosineSimilarity(
                        questionEmbedding,
                        item.embedding
                )

        }));

        const topChunks =
        scoredChunks
        .sort((a,b)=>b.score-a.score)
        .slice(0,6);


        const relevantChunks=[];
        const scores=[];

        for(const chunk of topChunks){

                const llmscore =
                await evaluateChunk(
                        query,
                        chunk.text
                );

		const cosineScore = chunk.score * 100;
	
		const finalScore = (0.4*cosineScore) + (0.6*llmscore);
		
		scores.push(finalScore);

		console.log(`
		Chunk: ${chunk.text.slice(0,50)}
		Cosine: ${cosineScore}
		LLM: ${llmscore}
		Final: ${finalScore}
		--------------------------------
		`);


                if(llmscore>=80){

                        relevantChunks.push({
                                text:chunk.text,
				cosineScore,
				llmscore,
				finalScore
                        });
                }

        }

        const averageScore=scores.length>0 ? scores.reduce((a,b) => a+b,0)/scores.length : 0;

	relevantChunks.sort((a,b) => b.finalScore-a.finalScore);

	const rerankedChunks = relevantChunks.slice(0,4);


        const retrievalStrong =
        rerankedChunks.length>=4
        || averageScore>=80;

        return{

                relevantChunks: rerankedChunks,
                averageScore,
                retrievalStrong

        };

};

module.exports={
        runRetrievalAttempt
};
