import {OpenAI } from 'openai';
import {axios} from 'axios';
import {exec} from 'child_process';

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,

});

async function getWeatherData(city){
    const url = `https://wttr.in/${city}?format=%C+%t+%h`;
    const response = await axios.get(url,{responseType: 'text'});
    return JSON.stringify({city, weatherInfo: response.data});
}

async function execCommands(cmd){
    return new Promise((res,rej) => {
        exec (cmd,(err,out) => {
            if(err) return res(`There was an error while executing the command: ${err.message}`);
            else return res(out);
        })
    })
}

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
    Tool Request: If the user asks for a tool, you can make a call to an external tool to get the required information. For example, if the user asks for weather information, you can call the getWeatherData function to fetch the weather data. {step: "TOOL REQUEST", content: "Calling the getWeatherData function to fetch the current weather data for Paris."}
    Final Output: Present the final translated French text, ensuring that it is clear, accurate, and faithful to the original English meaning.

RULES:
-Always output one step at a time and wait for the other step before proceding. Dont jumpt to direct conclusions.
-Always maintain the sequence and follow it rigourously alwys.
-Complete the whole process and only then provide the final output.
-Get the required information from external tools if the user asks for it, and then use that information to provide the final output.

AVAILABLE TOOLS:
- getWeatherData(city): This function takes a city name as input and returns the current weather data for that city. You can use this function to fetch weather information when the user asks for it.
- execCommands(cmd): This function takes a command as input and executes it in the shell. You can use this function to run shell commands when the user asks for it.
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
TOOL REQUEST: No external tool is needed for this translation.
FINAL OUTPUT: "Bonjour, comment ça va?" - accurately conveys meaning with appropriate context.

EXAMPLE:
USER: "What is the weather like in Paris today?"
INITIALIZE: Understanding the user's request for weather information in Paris.
THINK: The user is asking for current weather conditions in Paris, which requires fetching data from an external source.
TOOL
OVERTHINK: Considering the best way to fetch weather data for Paris. Options include using a weather API or a predefined function.
TOOL REQUEST: Calling the getWeatherData function to fetch the current weather data for Paris.
TOOL RESPONSE: The weather in Paris is sunny with a temperature of 25°C and a humidity of 60%.
THINK: Now that we have the weather data, we can translate it into French.
USEVOCAB: Selecting appropriate French vocabulary to convey the weather information accurately.
FORM SENTENCE: Constructing "Le temps à Paris est ensoleillé avec une température de 25°C et une humidité de 60%."
CHECK GRAMMAR: Verifying subject-verb agreement and natural structure in French.
FINAL OUTPUT: "Le temps à Paris est ensoleillé avec une température de 25°C et une humidité de 60%." - accurately conveys the weather information in French.    

OUTPUT FORMAT:
{ step: "INITIALIZE" | "THINK" | "OVERTHINK" | "USEVOCAB" | "FORM SENTENCE" | "CHECK GRAMMAR" |"TOOL REQUEST" | "FINAL OUTPUT", content: "THE ACTUAL OUTPUT"}
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
        
        if(parsedResult.step.toLowerCase() === 'tool request') {
            // Extract the tool request content
            const { functionName,content} = parsedResult;
            switch (functionName) {
                case 'execCommands':
                {
                    const toolInput = await execCommands(content);
                    MESSAGES_DB.push({
                        role: 'toolHelper',
                        content: JSON.stringify({step: "TOOL REQUEST",output: toolInput})
                    });
                    continue;
                }
                case 'getWeatherData':
                {
                    const toolInput = await getWeatherData(content);
                    MESSAGES_DB.push({
                        role: 'toolHelper',
                        content: JSON.stringify({step: "TOOL REQUEST",output: toolInput})
                    });
                    continue;
                }
            }
        }
    }
};

main('What is the weather in US Pairs and Delhi')