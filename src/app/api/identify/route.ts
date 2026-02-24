import { NextResponse } from "next/server";
import { auth } from "@/auth";
import Anthropic from "@anthropic-ai/sdk";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = process.env.DATA_DIR
  ? path.join(process.env.DATA_DIR, "uploads")
  : path.join(process.cwd(), "public", "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = image.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    const filename = `${Date.now()}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(filepath, buffer);
    const imageUrl = `/uploads/${filename}`;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        imageUrl,
        identified: false,
        message: "Image saved. Set ANTHROPIC_API_KEY in .env.local to enable AI identification.",
      });
    }

    const client = new Anthropic();
    const base64Image = buffer.toString("base64");
    const mediaType = image.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64Image },
            },
            {
              type: "text",
              text: `This is a fountain pen. Please identify it and return a JSON object with these exact fields:
- brand: manufacturer name (string, e.g. "Pilot", "Lamy", "TWSBI")
- model: model name (string, e.g. "Metropolitan", "Safari", "Eco")
- color: body color description (string, e.g. "Black", "Navy Blue", "Clear Demonstrator")
- nib_size: nib size (string, one of: "EF", "XF", "F", "M", "B", "BB", "1.0mm", "1.1mm", "1.5mm", "Flex", "Oblique", "Other")
- nib_material: nib material (string, one of: "Steel", "Gold (14k)", "Gold (18k)", "Gold (21k)", "Titanium", "Unknown")
- nib_type: nib type (string, one of: "Regular", "Flex", "Italic", "Stub", "Cursive Italic", "Architect", "Reverse", "Zoom", "Other")
- fill_system: fill system (string, one of: "Cartridge/Converter", "Piston", "Eyedropper", "Vacuum", "Squeeze", "Button", "Coin", "Aerometric", "Unknown")

Use empty string "" for any field you cannot determine. Respond with only the raw JSON object, no markdown, no explanation.`,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    let penData: Record<string, string> = {};
    try {
      penData = JSON.parse(textBlock.text);
    } catch {
      // Return image URL even if parsing fails
    }

    return NextResponse.json({ imageUrl, identified: true, ...penData });
  } catch (error) {
    console.error("Identify error:", error);
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
  }
}
