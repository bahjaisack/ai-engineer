import OpenAI from "openai";
import dotenv from "dotenv";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const streamCompletion = async (messages, { maxTokens = 800 } = {}) => {
  const response = await openai.chat.completions.create({
    model: "openrouter/free",
    messages,
    stream: true,
  });

  let fullResponse = "";
  for await (const chunk of response) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) {
      process.stdout.write(content);
      fullResponse += content;
    }
  }
  console.log("\n");
  return fullResponse;
};

const rl = readline.createInterface({ input, output });

const topic = (await rl.question("Enter a blog topic: ")).trim();
if (!topic) {
  console.log("A topic is required.");
  rl.close();
  process.exit(1);
}

const conversation = [
  {
    role: "system",
    content:
      "You help writers plan blog posts. Be clear, structured, and practical.",
  },
];

console.log("\n--- Blog outline ---\n");
const outline = await streamCompletion([
  ...conversation,
  {
    role: "user",
    content: `Create a detailed blog post outline for this topic: "${topic}". Include a title, introduction, main sections with bullet points, and a conclusion.`,
  },
]);

conversation.push(
  { role: "user", content: `Blog topic: ${topic}` },
  { role: "assistant", content: outline }
);

console.log("--- Summary ---\n");
const summary = await streamCompletion(
  [
    ...conversation,
    {
      role: "user",
      content:
        "Summarize the outline above in exactly two sentences. Do not add extra sentences or headings.",
    },
  ],
);

conversation.push(
  { role: "user", content: "Summarize the outline in two sentences." },
  { role: "assistant", content: summary }
);

console.log(
  "Ask follow-up questions about this topic. Type 'exit' or 'quit' to stop.\n"
);

while (true) {
  const question = (await rl.question("You: ")).trim();
  if (!question) continue;
  if (["exit", "quit"].includes(question.toLowerCase())) break;

  conversation.push({ role: "user", content: question });
  process.stdout.write("Assistant: ");
  const answer = await streamCompletion(conversation);
  conversation.push({ role: "assistant", content: answer });
}

rl.close();
