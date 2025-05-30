import { useChatApplication } from "@/lib/swr";
import type { UpsertChatAppProps } from "@/lib/zod";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Chat } from "./chat";
import { KnowledgebasesForm } from "./knowledgebases-form";
import { ModelSelectorForm } from "./model-form";
import { PromptForm } from "./prompt-form";
import { ToolsForm } from "./tools-form";

export function ChatPlayground() {
  const { chatApplication } = useChatApplication();
  const { applicationId, workspaceId } = useParams<{
    applicationId: string;
    workspaceId: string;
  }>();
  const [chatAppConfigs, setChatAppConfigs] = useState<UpsertChatAppProps>({});

  useEffect(() => {
    if (chatApplication) {
      const { model, prompt, tools, config, knowledgebases } = chatApplication;
      setChatAppConfigs({
        model,
        prompt,
        tools,
        config,
        knowledgebases,
      });
    }
  }, [chatApplication]);

  const handleSubmit = (params: UpsertChatAppProps, cb?: () => void) => {
    fetch(`/api/applications/${applicationId}/chatapp?workspaceId=${workspaceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    }).then(async (res) => {
      if (res.ok) {
        cb?.();
      } else {
        const { message } = await res.json();
        toast.error(message);
      }
    });
  };

  if (!chatApplication) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-8 py-6 sm:flex-row">
      <div className="max-h-[calc(100vh_-_230px)] flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white text-gray-700">
        <ModelSelectorForm
          model={chatAppConfigs.model}
          onModelChange={(model) => {
            setChatAppConfigs((prev) => ({ ...prev, model }));
            handleSubmit({ model });
          }}
          config={chatAppConfigs.config?.modelSetting}
          onConfigChange={(modelSetting) => {
            if (modelSetting) {
              setChatAppConfigs((prev) => ({ ...prev, config: { ...prev.config, modelSetting } }));
              handleSubmit({ config: { ...chatAppConfigs.config, modelSetting } }, () => {
                toast.success("模型配置已更新");
              });
            }
          }}
        />
        <PromptForm
          value={chatAppConfigs.prompt}
          onValueChange={(prompt) => {
            setChatAppConfigs((prev) => ({ ...prev, prompt }));
            handleSubmit({ prompt });
          }}
        />
        <ToolsForm
          value={chatAppConfigs.tools}
          onValueChange={(tools) => {
            setChatAppConfigs((prev) => ({ ...prev, tools }));
            handleSubmit({ tools });
          }}
        />
        <KnowledgebasesForm
          knowledgebases={chatAppConfigs.knowledgebases}
          onKnowledgebasesChange={(knowledgebases) => {
            setChatAppConfigs((prev) => ({ ...prev, knowledgebases }));
            handleSubmit({ knowledgebases });
          }}
          recallConfig={chatAppConfigs.config?.recall}
          onRecallConfigChange={(recall) => {
            if (recall) {
              setChatAppConfigs((prev) => ({ ...prev, config: { ...prev.config, recall } }));
              handleSubmit({ config: { ...chatAppConfigs.config, recall } }, () => {
                toast.success("召回配置已更新");
              });
            }
          }}
        />
      </div>
      <div className="max-h-[calc(100vh_-_230px)] flex-1 rounded-lg bg-white ring-1 ring-gray-700/10">
        <Chat
          model={chatAppConfigs.model}
          prompt={chatAppConfigs.prompt}
          tools={chatAppConfigs.tools}
          config={chatAppConfigs.config}
          knowledgebases={chatAppConfigs.knowledgebases}
          initialMessages={[]}
        />
      </div>
    </div>
  );
}
