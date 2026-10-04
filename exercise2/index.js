import OpenAI from "openai";
import fs from "fs";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const theme = await new Promise((resolve) => {
  rl.question("Enter your theme: ", resolve);
});

rl.close();

const sizes = [
  {
    name: "square",
    size: "1024x1024",
  },
  {
    name: "portrait",
    size: "1024x1536",
  },
  {
    name: "landscape",
    size: "1536x1024",
  },
];

const styles = ["vivid", "natural"];

if (!fs.existsSync("images")) {
  fs.mkdirSync("images");
}

const gallery = [];

for (const size of sizes) {
  for (const style of styles) {

    const prompt = `
      ${theme}

      Style: ${style}.
      Create a high-quality image with a ${style} visual appearance.
    `;

    console.log(`Generating ${size.name} - ${style}...`);

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: size.size,
      response_format: "b64_json",
    });

    const image_base64 = result.data[0].b64_json;
    const image_bytes = Buffer.from(image_base64, "base64");

    const fileName = `${size.name}-${style}.png`;

    fs.writeFileSync(
      `images/${fileName}`,
      image_bytes
    );

    console.log(
      `Image saved to images/${fileName}`
    );

    gallery.push({
      fileName,
      size: size.name,
      style,
    });
  }
}


let galleryHTML = `
<!DOCTYPE html>
<html>
<head>

  <title>AI Image Gallery</title>

  <style>

    body {
      font-family: Arial;
      background: #111;
      color: white;
      text-align: center;
    }

    .gallery {
      display: grid;
      grid-template-columns:
        repeat(auto-fit, minmax(300px, 1fr));

      gap: 20px;
      padding: 30px;
    }

    .card {
      background: #222;
      padding: 15px;
      border-radius: 10px;
    }

    img {
      width: 100%;
      border-radius: 8px;
    }

    h2 {
      text-transform: capitalize;
    }

  </style>

</head>

<body>

  <h1>AI Image Gallery</h1>

  <h2>Theme: ${theme}</h2>

  <div class="gallery">
`;


for (const image of gallery) {

  galleryHTML += `
    <div class="card">

      <img
        src="images/${image.fileName}"
        alt="${image.size} ${image.style}"
      >

      <h2>${image.size}</h2>

      <p>Style: ${image.style}</p>

    </div>
  `;
}


galleryHTML += `
  </div>

</body>
</html>
`;


fs.writeFileSync(
  "gallery.html",
  galleryHTML
);

console.log("Gallery created: gallery.html");