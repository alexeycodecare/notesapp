import OpenAI from "openai";

type AppSyncEvent = {
  arguments: {
    prompt: string;
  };
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const handler = async (event: AppSyncEvent) => {
  try {
    const { prompt } = event.arguments;

    if (!prompt) {
      throw new Error("Prompt is required");
    }

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "512x512",
    });

    if (!result.data || !result.data.length) {
      throw new Error("No image returned from model");
    }

    const imageBase64 = result.data[0].b64_json;

    return {
      image: imageBase64,
    };
  } catch (error: any) {
    console.error(error);

    throw new Error(error.message || "Image generation failed");
  }
};