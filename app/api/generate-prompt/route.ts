import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
  baseURL: process.env.OPENAI_BASE_URL
});

const getFrameworkPrompt = (framework: string) => {
  const prompts: Record<string, string> = {
    "CO-STAR": `你是一个提示词优化助手，请你将用户输入转化为 'co-star' 框架提示词。请根据每个元素提供尽可能详细的信息，确保每个元素都清晰、具体，并且符合以下格式：

==上下文==
提供一个具体的背景描述，包含任务目标和平台特征，明确内容需要适应的场景和用户需求。

==目标==
指出最终希望实现的具体目标，并分解成几项具体的子任务。

==身份==
说明内容创作者的角色及其对内容的影响，确保风格和语气与平台用户习惯一致。

==语气==
说明语气如何调整，以适应目标受众，突出内容的互动性和吸引力。

==受众==
明确主要目标受众及其特征，确保内容风格和语调符合他们的期望和偏好。

==结果==
说明预期的最终结果，确保生成的内容有明确的目的，符合平台发布要求。`,
    
    "CRISPE": `你是一个生成 CRISPE 框架提示词的助手。请将用户输入转化为符合 CRISPE 框架的提示词，包括以下几个部分：

Capacity and Role（角色）：赋予ChatGPT角色扮演的能力，明确在当前提问中应该以何种身份解答问题。

Insight（洞察）：提供充分的背景信息和上下文，帮助更好地理解问题。

Statement（声明）：明确说明需求或问题，具体指出期望得到什么样的答案或解释。

Personality（个性）：指定输出方式，如JSON结构、轻松幽默的语言等。

Experime（实验）：对于宽泛性问题，提供多个可选答案或建议。`,
    
    "ICIO": `你是一个生成 ICIO 框架提示词的助手。请将用户输入转化为符合 ICIO 框架的提示词，包括：

Input（输入）：明确提供给AI的具体数据或信息。
Context（上下文）：说明任务背景和目的。
Instruction（指令）：详细描述期望AI执行的具体操作。
Output（输出）：指定期望的输出格式和标准。`,
    
    "BROKE": `请将用户输入直接转化为严格以BROKE框架润色后的提示词：

Background（背景）：说明背景，提供充足信息
Role（角色）：指定AI需要扮演的角色
Objectives（目标）：描述需要完成的具体任务
Key Result（关键结果）：指定输出的风格、格式和内容要求
Evolve（进化）：提供三种可能的改进方向`,
    
    "Midjourney": `将用户输入的画面描述拆解为以下六个要素，并进行补充和完善：

1. 镜头：视角、构图、景深等
2. 光线：光源、明暗、氛围光等
3. 主体：核心对象的细节描述
4. 背景：环境、场景细节
5. 风格：艺术风格、渲染方式
6. 氛围：整体情绪和感觉`
  };

  return prompts[framework] || "";
};

export async function POST(req: Request) {
  try {
    const { framework, input } = await req.json();

    if (!framework || !input) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    const content = getFrameworkPrompt(framework);
    const prompt = `用户输入: "${input}"`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content },
        { role: "user", content: prompt }
      ]
    });

    return NextResponse.json({
      output: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("Generate prompt error:", error);
    return NextResponse.json(
      { error: "生成失败，请稍后重试" },
      { status: 500 }
    );
  }
}