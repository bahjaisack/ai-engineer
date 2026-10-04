import OpenAI from "openai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

const conversation = [
  {
      speaker: "speaker1",
      voice: "en_paul_happy",
      text: "Hey! Did you finish the project?",
  },
  {
      speaker: "speaker2",
      voice: "gb_oliver_excited",
      text: "Yes! I finally finished it this morning. I'm really excited about it!",
  },
  {
      speaker: "speaker1",
      voice: "en_paul_happy",
      text: "That's amazing! I knew you could do it.",
  },
  {
      speaker: "speaker2",
      voice: "gb_oliver_excited",
      text: "Thank you! I'm looking forward to showing it to everyone.",
  },
];

if (!fs.existsSync("audio")) {
    fs.mkdirSync("audio");
}

for (let i = 0; i < conversation.length; i++) {

    const line = conversation[i];

    console.log(`Generating ${line.speaker}...`);

    const mp3 = await openai.audio.speech.create({
        model: "mistralai/voxtral-mini-tts-2603",
        voice: line.voice,
        input: line.text,
        response_format: "mp3",
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    const fileName = `audio/${i + 1}-${line.speaker}.mp3`;

    fs.writeFileSync(fileName, buffer);

    console.log(`Audio saved to ${fileName}`);
}

console.log("Conversation completed!");