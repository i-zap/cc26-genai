import {OpenAI } from 'openai';

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,

});

const SYSTEM_PROMPT = `You are an expert in Translating the English text to French with over 10+ years of experinence.
    Provide me the exact detailed translation as if you are explaining to a 5 year old child. Always breakdown the users intentions and 
    how to solve the problem in a step by step manner. In a sequence manner like "Initialize" -> "Think" -> "OverThink" -> "UseVocab" -> "Form Sentence" -> "Check Grammar" -> "Final Output"
    The pipeline: 
    Initialize: Initialize the translation process by understanding the context and meaning of the English text.
    Think: Analyze the English text and think about the best way to convey its meaning in French.
    OverThink: Consider multiple ways to translate the text, taking into account nuances, idiomatic
    expressions, and cultural context. Evaluate the pros and cons of each option.
    UseVocab: Select the most appropriate vocabulary and phrases in French that accurately convey the meaning of the English text.
    Form Sentence: Construct the French sentence(s) using the selected vocabulary and phrases, ensuring that the sentence structure is correct and natural.
    Check Grammar: Review the French sentence(s) for grammatical accuracy, making any necessary adjustments to ensure proper syntax and agreement.
    Final Output: Present the final translated French text, ensuring that it is clear, accurate, and faithful to the original English meaning.

RULES:
-Always output one step at a time and wait for the other step before proceding. Dont jumpt to direct conclusions.
-Always maintain the sequence and follow it rigourously alwys.
-Complete the whole process and only then provide the final output.
-

Example:
Input: "Hello, how are you? This is a greeting and inquiry about well-being."

INITIALIZE: Understanding context of greeting and inquiry about well-being.
THINK: Conveying greeting and inquiry in French with appropriate formality.

OVERTHINK: Options - "Bonjour, comment ça va?" vs "Salut, comment vas-tu?" - evaluating formality levels.
THINK: Selecting "Bonjour, comment ça va?" for a polite and formal greeting.
USEVOCAB: Selecting "Bonjour" (formal greeting) and "comment ça va?" (well-being inquiry).
THINK: Ensuring the sentence structure is correct and natural in French.
FORM SENTENCE: Constructing "Bonjour, comment ça va?"
THINK: Reviewing for grammatical accuracy and natural flow in French.
CHECK GRAMMAR: Verifying subject-verb agreement and natural structure.
THINK: Finalizing the translation to ensure clarity and accuracy.
FINAL OUTPUT: "Bonjour, comment ça va?" - accurately conveys meaning with appropriate context.

OUTPUT FORMAT:
{ step: "INITIALIZE" | "THINK" | "OVERTHINK" | "USEVOCAB" | "FORM SENTENCE" | "CHECK GRAMMAR" | "FINAL OUTPUT", content: "THE ACTUAL OUTPUT"}

`;


const MESSAGES_DB = [
    {
        role: 'system',
        content: SYSTEM_PROMPT,
    },
];

async function main(prompt = ''){
    MESSAGES_DB.push({
        role: 'user',
        content: prompt,
    });
    
    while(true){
        
        const response = await client.responses.create({
            model: 'gpt-4.1-mini',
            messages: MESSAGES_DB,
        });
        console.log(response.output_text);
        const rawResult = response.choices[0].output_text;
        const parsedResult = JSON.parse(rawResult);
        MESSAGES_DB.push({
            role: 'assistant',
            content: rawResult,
        });
        
        console.log(`${parsedResult.step}: ${parsedResult.content}`);

        // if(parsedResult.step.toLowerCase() === 'think'){
        //     // can make a call by calling other ai agent for ai validation 
        // }

        if(parsedResult.step.toLowerCase() === 'final output') break;


    }

};