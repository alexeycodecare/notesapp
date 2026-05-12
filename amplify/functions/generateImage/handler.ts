import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: "us-east-1",
});

type AppSyncEvent = {
  arguments: {
    prompt: string;
  };
};

export const handler = async (event: AppSyncEvent) => {
  try {
    const prompt = event.arguments?.prompt;

    if (!prompt) {
      throw new Error("Prompt is required");
    }

    const payload = {
      taskType: "TEXT_IMAGE",
      textToImageParams: {
        text: prompt,
      },
      imageGenerationConfig: {
        numberOfImages: 1,
        height: 512,
        width: 512,
        quality: "standard",
        seed: Math.floor(Math.random() * 858993460),
      },
    };

    const command = new InvokeModelCommand({
      modelId: "amazon.titan-image-generator-v2:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    const response = await client.send(command);

    const decoded = new TextDecoder().decode(response.body);
    const result = JSON.parse(decoded);

    if (!result.images || !result.images.length) {
      throw new Error("No image returned from model");
    }

    return result.images[0]; // ✅ base64
  } catch (error: any) {
    console.error("Image generation error:", error);
    throw new Error(error.message || "Unknown error");
  }
};