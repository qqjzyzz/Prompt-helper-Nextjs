import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
  baseURL: process.env.OPENAI_BASE_URL
});

export async function POST(req: Request) {
  try {
    const { framework, originalOutput, modificationInput } = await req.json();

    if (!framework || !originalOutput || !modificationInput) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    const prompt = `原始提示词是：\n${originalOutput}\n\n用户的修改意见是：${modificationInput}\n\n请根据用户的意见重新生成修改后的 ${framework} 框架提示词。请注意，最后只输出修改后的提示词。`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: `你是 ${framework} 框架的专家。` },
        { role: "user", content: prompt }
      ]
    });

    return NextResponse.json({
      output: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("Modify prompt error:", error);
    return NextResponse.json(
      { error: "修改失败，请稍后重试" },
      { status: 500 }
    );
  }
}