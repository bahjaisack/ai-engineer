import OpenAI from "openai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

const topic = "Artificial Intelligence in Education";



//content

async function generateContent() {

    console.log("\nGenerating content...");

    const prompts = [
        {
            type: "article",
            prompt: `Write a short and engaging article about ${topic}.`
        },
        {
            type: "summary",
            prompt: `Write a short summary about ${topic}.`
        },
        {
            type: "social",
            prompt: `Write an engaging social media post about ${topic}.`
        }
    ];

    const content = {};

    for (const item of prompts) {

        console.log(`Generating ${item.type}...`);

        try {

            const response = await openai.chat.completions.create({
                model: "openrouter/free",
                messages: [
                    {
                        role: "user",
                        content: item.prompt
                    }
                ]
            });

            content[item.type] = response.choices[0].message.content;

            console.log(`${item.type} completed!`);

        } catch (error) {

            console.log(`Error generating ${item.type}:`, error.message);

            content[item.type] = "Content generation failed.";

        }
    }

    return content;
}



// image

async function generateImage() {

  console.log("\nGenerating image...");

  try {

      const response = await openai.images.generate({
          model: "gpt-image-1",
          prompt: `Create a professional header image for an article about ${topic}. Modern technology, education, artificial intelligence, clean professional design.`,
          size: "1024x1024",
          response_format: "b64_json"
      });

      const image = response.data[0];

      const buffer = Buffer.from(image.b64_json, "base64");

      fs.writeFileSync("content-suite/header.png", buffer);

      console.log("Image saved to content-suite/header.png");

      return "content-suite/header.png";

  } catch (error) {

      console.log("Image generation failed:", error.message);

      return null;
  }
}


// audio

async function generateAudio(content) {

    console.log("\nGenerating audio...");

    try {

        const mp3 = await openai.audio.speech.create({
            model: "mistralai/voxtral-mini-tts-2603",
            voice: "en_paul_happy",
            input: content.article,
            response_format: "mp3"
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());

        fs.writeFileSync(
            "content-suite/narration.mp3",
            buffer
        );

        console.log("Audio saved to content-suite/narration.mp3");

        return "content-suite/narration.mp3";

    } catch (error) {

        console.log("Audio generation failed:", error.message);

        return null;
    }
}


function qualityControl(content) {

    console.log("\nRunning quality control...");

    if (!content.article || content.article.length < 50) {
        console.log("Warning: Article is too short.");
    }

    if (!content.summary || content.summary.length < 20) {
        console.log("Warning: Summary is too short.");
    }

    if (!content.social || content.social.length < 20) {
        console.log("Warning: Social media post is too short.");
    }

    console.log("Quality control completed!");
}




function exportContent(content, imagePath, audioPath) {

    console.log("\nExporting content suite...");

    const output = {
        topic: topic,

        article: content.article,

        summary: content.summary,

        socialMediaPost: content.social,

        image: imagePath,

        audio: audioPath
    };

    fs.writeFileSync(
        "content-suite/content-suite.json",
        JSON.stringify(output, null, 2)
    );

    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Content Suite</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 900px;
            margin: auto;
            padding: 40px;
        }

        img {
            width: 100%;
            border-radius: 10px;
        }

        section {
            margin-bottom: 40px;
        }
    </style>
</head>

<body>

    <h1>${topic}</h1>

    <section>
        <h2>Article</h2>
        <p>${content.article}</p>
    </section>

    <section>
        <h2>Summary</h2>
        <p>${content.summary}</p>
    </section>

    <section>
        <h2>Social Media Post</h2>
        <p>${content.social}</p>
    </section>

    <section>
        <h2>Visual Design</h2>
        ${
            imagePath
            ? `<img src="header.png">`
            : `<p>Image generation failed.</p>`
        }
    </section>

    <section>
        <h2>Audio Narration</h2>
        ${
            audioPath
            ? `<audio controls src="narration.mp3"></audio>`
            : `<p>Audio generation failed.</p>`
        }
    </section>

</body>
</html>
`;

    fs.writeFileSync(
        "content-suite/index.html",
        html
    );

    console.log("JSON exported to content-suite/content-suite.json");

    console.log("HTML exported to content-suite/index.html");
}




async function main() {

    if (!fs.existsSync("content-suite")) {
        fs.mkdirSync("content-suite");
    }

    console.log("================================");
    console.log("       CONTENT SUITE");
    console.log("================================");

    console.log(`\nTopic: ${topic}`);

    const content = await generateContent();

    const imagePath = await generateImage();

    const audioPath = await generateAudio(content);

    qualityControl(content);

    exportContent(
        content,
        imagePath,
        audioPath
    );

    console.log("Content Suite Completed!");
}

main();