import { z } from 'zod';
class AI {
    constructor(model, apiKey, message) {
        this.model = model;
        this.apiKey = apiKey;
        this.message = message;
    }

    constructUrl() {
        return `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    }

    async handleResponse(response) {
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error: ${response.status} - ${response.statusText} - ${errorText}`);
        }
        const responseData = await response.json();
        return responseData;
    }

    async makeRequest(payload) {
        const url = this.constructUrl();
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        return this.handleResponse(response);
    }

    async generateText(prompt) {
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7 }
        };
        const data = await this.makeRequest(payload);
        return data.candidates[0].content.parts[0].text;
    }

    async streamText(prompt) {
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7 }
        };
        const response = await this.makeRequest(payload);
        let accumulatedText = '';
        try {
            for await (const chunk of response.body) {
                accumulatedText += Buffer.from(chunk).toString();
            }
            return accumulatedText;
        } catch (error) {
            throw new Error('Failed to stream response');
        }
    }

    validateSchema(obj, schema) {
        try {
            schema.parse(obj);
            return true;
        } catch (e) {
            console.error('Schema validation errors:', e.errors);
            return false;
        }
    }

    async generateObject(prompt, schema) {
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7 }
        };
        const data = await this.makeRequest(payload);
        try {
            console.log('Full Response before validation:', JSON.stringify(data, null, 2)); // Log the full response

            if (!this.validateSchema(data, schema)) {
                console.log('Response provides guidance, not a recipe.');
                return { message: data.candidates[0].content.parts[0].text }; // Return the guidance message as an object
            }

            const contentText = data.candidates[0].content.parts[0].text;
            console.log('Content Text:', contentText); // Log the content text before parsing
            return JSON.parse(contentText);
        } catch (error) {
            console.error('Failed to parse JSON:', error);
            throw new Error('Failed to parse response as JSON');
        }
    }

    async streamObject(prompt, schema) {
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7 }
        };
        const response = await this.makeRequest(payload);
        let accumulatedText = '';
        try {
            for await (const chunk of response.body) {
                accumulatedText += Buffer.from(chunk).toString();
                try {
                    return JSON.parse(accumulatedText);
                } catch {
                    continue;
                }
            }
        } catch (error) {
            console.log(error);
            throw new Error('Failed to parse streaming response as JSON');
        }
    }
}

(async () => {
    const model = 'gemini-1.5-flash-latest';
    const apiKey = 'AIzaSyDOJTJ60N9U1U_KrD4TtWjma-gylv72FGM';
    const message = `I'm planning a week-long trip to Paris from March 10 to March 17...`;
    const ai = new AI(model, apiKey, message);

    const recipeSchema = z.object({
        name: z.string(),
        ingredients: z.array(z.string()),
        procedure: z.string(),
    });

    const movieSchema = z.object({
        movie_name: z.string(),
        year: z.number().int(),
    });

    try {
        const generatedText = await ai.generateText("write me a poem on river");
        console.log('Generated Text:', generatedText);
        const generatedObject = await ai.generateObject("help me to cook salad", recipeSchema);
        console.log('Generated Object:', generatedObject);
        const streamedText = await ai.streamText("who is the prime minister of india");
        console.log('Streamed Text:', streamedText);
        const streamedObject = await ai.streamObject("leo", movieSchema);
        console.log('Streamed Object:', streamedObject);
    } catch (error) {
        console.log("Error in fetching");
        console.error('Error:', error.message);
    }
})();
