import OpenAI from "openai";

type AppSyncEvent = {
  arguments: {
    prompt: string;
    size?: string;
  };
};

const SUPPORTED_SIZES = ["1024x1024", "1024x1536", "1536x1024", "auto"] as const;

export const handler = async (event: AppSyncEvent) => {
  try {
    const { prompt, size = "1024x1536" } = event.arguments;

    if (!prompt) {
      throw new Error("Prompt is required");
    }

    if (!SUPPORTED_SIZES.includes(size as (typeof SUPPORTED_SIZES)[number])) {
      throw new Error(
        `Invalid size '${size}'. Supported sizes are 1024x1024, 1024x1536, 1536x1024, and auto.`
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not configured for this Lambda environment"
      );
    }

    const openai = new OpenAI({ apiKey });

    const result = await openai.images.generate({
      model: "gpt-image-2",
      prompt,
      size,
      quality: "low",
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