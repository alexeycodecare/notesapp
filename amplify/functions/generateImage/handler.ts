import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: "us-east-1",
});

export const handler = async (event: any) => {
  try {
    const { prompt } = event.arguments;

    const command = new InvokeModelCommand({
      modelId: "amazon.nova-canvas-v2:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        textToImageParams: {
          text: prompt,
        },
        imageGenerationConfig: {
          numberOfImages: 1,
          height: 512,
          width: 512,
        },
      }),
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));

    return result.images[0]; // base64 encoded image

  } catch (error) {
    console.error(error);
    throw error;
  }
};