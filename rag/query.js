import path from 'path';
import dotenv from 'dotenv';
dotenv.config({
    path: path.resolve('../.env')
});
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAI } from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function queryRAG(userQuery){
    //convert user query to vector embeddings 
    const embeddings = new OpenAIEmbeddings({
        modelName: "text-embedding-3-small",
        openAIApiKey: process.env.OPENAI_API_KEY,
    });

    //search the vector in the quadrant
    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
        url: process.env.QDRANT_URL,
        collectionName: process.env.QDRANT_CN
    });

    //get similar vector and chunks
    const vectorRetriever = vectorStore.asRetriever({k: 5});
    const results = await vectorRetriever.invoke(userQuery);
    // feed those chunks to llm and do a simple chat with the user query 
    const SYSTEM_PROMPT = `You are a helpful assistant that answers questions based on the provided context. If the answer is not contained within the context, respond with "I don't know."
    
    Always answer the questions short and also tell me the page number in the document and the book name also

    USER DOCUMENTS:
    ${results.map (e => JSON.stringify({pagecontent: e.metadata, pageNumber: e.metadata.loc.pageNumber })).join("\n\n")}
    `;

    const llmResponse = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userQuery }
      ],
      
    })

    // console.log(SYSTEM_PROMPT);
    console.log("LLM Response: ", llmResponse.choices[0].message.content);
}

queryRAG("Explain SOA architecture and similarly even the other types.").catch(console.error);