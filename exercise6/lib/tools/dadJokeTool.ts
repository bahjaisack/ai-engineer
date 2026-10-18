import { tool } from "ai";

import { z } from "zod";

export const dadJokeTool = tool({

    description: "Get a random dad joke",

    inputSchema: z.object({}),

    execute: async () => {

        try {
    
            const response = await fetch(
                "https://icanhazdadjoke.com/",
                {
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            if (!response.ok) {
                return {
                    success: false,
                    message: `Dad joke API failed with status ${response.status}.`,
                };
            }
    
            const data = await response.json();
    
            if (!data.joke) {
    
                return {
                    success: false,
                    message: "No joke was returned by the API.",
                };
    
            }
    
            return {
                success: true,
                joke: data.joke,
            };
    
        } catch (error) {
    
            console.error("Dad joke tool error:", error);
    
            return {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Failed to fetch a dad joke.",
            };
        }
    },
});