import OpenAI from "openai";

type AppSyncEvent = {
  arguments: {
    prompt: string;
  };
};

export const handler = async (event: AppSyncEvent) => {
  try {
    const { prompt } = event.arguments;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!prompt) {
      throw new Error("Prompt is required");
    }

    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not configured for this Lambda environment"
      );
    }

    const openai = new OpenAI({ apiKey });

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