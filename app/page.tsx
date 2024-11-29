"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Github } from "lucide-react";

const frameworks = {
  "CO-STAR": "适用于背景丰富、需要多维度定制输出的场景，如专业报告、市场分析。",
  "CRISPE": "适用于角色扮演和模拟的场景，如个性化互动、情境模拟。",
  "ICIO": "适用于明确任务指令和格式的场景，如数据处理、内容创作、技术任务。",
  "BROKE": "适用于项目管理和持续改进的场景，如创意设计、研究分析。",
  "Midjourney": "生成高质量的绘画提示词，将用户输入的画面描述拆解为镜头、光线、主体、背景、风格和氛围六个要素。"
};

export default function Home() {
  const [selectedFramework, setSelectedFramework] = useState("");
  const [userInput, setUserInput] = useState("");
  const [initialOutput, setInitialOutput] = useState("");
  const [modificationInput, setModificationInput] = useState("");
  const [modifiedOutput, setModifiedOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFrameworkSelect = (framework: string) => {
    setSelectedFramework(framework);
  };

  const handleGeneratePrompt = async () => {
    if (!userInput || !selectedFramework) {
      alert("请输入任务描述并选择框架");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          framework: selectedFramework,
          input: userInput,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setInitialOutput(data.output);
    } catch (error) {
      alert(error instanceof Error ? error.message : "生成失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModifyPrompt = async () => {
    if (!modificationInput || !initialOutput) {
      alert("请输入修改建议");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/modify-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          framework: selectedFramework,
          originalOutput: initialOutput,
          modificationInput,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setModifiedOutput(data.output);
    } catch (error) {
      alert(error instanceof Error ? error.message : "修改失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">多框架提示词助手</h1>
        <a
          href="https://github.com/qqjzyzz?tab=projects"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80"
        >
          <Github className="w-6 h-6" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {Object.entries(frameworks).map(([framework, description]) => (
          <Button
            key={framework}
            variant={selectedFramework === framework ? "default" : "outline"}
            onClick={() => handleFrameworkSelect(framework)}
            className="w-full"
          >
            {framework}
          </Button>
        ))}
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <Input
              placeholder="请输入您的任务 (例如：写一篇宣传AI的小红书)"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <Button
              onClick={handleGeneratePrompt}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "生成中..." : "生成提示词"}
            </Button>
          </div>
        </Card>

        {initialOutput && (
          <>
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                初始 {selectedFramework} 提示词:
              </h2>
              <Textarea
                value={initialOutput}
                readOnly
                className="min-h-[200px]"
              />
            </Card>

            <Card className="p-6">
              <div className="space-y-4">
                <Input
                  placeholder="提出需要修改的点 (例如：请更加注重营销角度)"
                  value={modificationInput}
                  onChange={(e) => setModificationInput(e.target.value)}
                />
                <Button
                  onClick={handleModifyPrompt}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "修改中..." : "修改提示词"}
                </Button>
              </div>
            </Card>
          </>
        )}

        {modifiedOutput && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              修改后的 {selectedFramework} 提示词:
            </h2>
            <Textarea
              value={modifiedOutput}
              readOnly
              className="min-h-[200px]"
            />
          </Card>
        )}
      </div>
    </main>
  );
}