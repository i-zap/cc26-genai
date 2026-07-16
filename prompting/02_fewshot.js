import {OpenAI } from 'openai';

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function run(){
    client.responses.create({
        model: 'gpt-4.1-mini',
        messages: [
            {
                role: 'user',
                content: 'Translate the following English text to French: "Hello, how are you?" \
                Greetings - Expected Output: Gracias. \
                Lets Goo!! - Expected Output: Vamos!!'
            },
        ],
    }).then((response) => {
        console.log(`Ans from OPEN AI: `,response.choices[0].messages.content);
    })
}