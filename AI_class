export class AI {
    constructor(
        private model: string,
        private apiKey: string,
        private systemInstruction: string,
        private message: string
    ) {}

    private constructUrl(): string {
        return `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.apiKey}`;
    }

    private async handleResponse(response: Response) {
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        return await response.json();
    }

    async streamText({
        model = this.model,
        message = this.message,
        systemInstruction = this.systemInstruction
    } = {}) {
        const url = this.constructUrl();
        const payload = {
            contents: [{
                parts: [{
                    text: message
                }]
            }],
            systemInstruction,
            generationConfig: {
                temperature: 0.7,
                stream: true
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        return this.handleResponse(response);
    }

    async generateText({
        model = this.model,
        message = this.message,
        systemInstruction = this.systemInstruction
    } = {}) {
        const url = this.constructUrl();
        const payload = {
            contents: [{
                parts: [{
                    text: message
                }]
            }],
            systemInstruction,
            generationConfig: {
                temperature: 0.7,
                stream: false
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        return this.handleResponse(response);
    }

    async generateObject({
        model = this.model,
        message = this.message,
        systemInstruction = "Respond with valid JSON only. " + this.systemInstruction
    } = {}) {
        const response = await this.generateText({ model, message, systemInstruction });
        try {
            return JSON.parse(response.candidates[0].content.parts[0].text);
        } catch (error) {
            throw new Error('Failed to parse response as JSON');
        }
    }

    async streamObject({
        model = this.model,
        message = this.message,
        systemInstruction = "Respond with valid JSON only. " + this.systemInstruction
    } = {}) {
        const response = await this.streamText({ model, message, systemInstruction });
        let accumulatedText = '';
        
        try {
            for await (const chunk of response) {
                accumulatedText += chunk.candidates[0].content.parts[0].text;
                try {
                    return JSON.parse(accumulatedText);
                } catch {
                    continue;
                }
            }
        } catch (error) {
            throw new Error('Failed to parse streaming response as JSON');
        }
    }
}
