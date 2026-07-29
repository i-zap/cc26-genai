import path from 'path';
import dotenv from 'dotenv';
dotenv.config({
    path: path.resolve('../.env')
});
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";

async function vectorEmbeddings(filepath) {
    const loader = new PDFLoader(filepath);
    const document = await loader.load();

    const embeddings = new OpenAIEmbeddings({
        modelName: "text-embedding-3-small",
        openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
        url: process.env.QDRANT_URL,
        collectionName: process.env.QDRANT_CN
    });
    await vectorStore.addDocuments(document);
}

await vectorEmbeddings(process.env.FILE_PATH2);
console.log("Vector embeddings created and stored in Qdrant successfully.");