import openai from "openai";

async function init(){
    const result = await openai.responses.create({
        model: "gpt-4.1-mini",
        input: "Write a short poem about the ocean."
    })
}

init();