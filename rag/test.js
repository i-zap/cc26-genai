import path from 'path';
import dotenv from 'dotenv';
import fs from "fs";

dotenv.config({
    path: path.resolve('../.env')
});
console.log(fs.existsSync(process.env.FILE_PATH));
console.log("process.cwd():", process.cwd());
console.log("FILE_PATH:", process.env.FILE_PATH);
console.log({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    QDRANT_URL: process.env.QDRANT_URL,
    QDRANT_CN: process.env.QDRANT_CN,
    FILE_PATH: process.env.FILE_PATH
});