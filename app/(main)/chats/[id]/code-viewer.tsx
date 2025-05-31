"use client";

import ChevronLeftIcon from "@/components/icons/chevron-left";
import ChevronRightIcon from "@/components/icons/chevron-right";
import CloseIcon from "@/components/icons/close-icon";
import RefreshIcon from "@/components/icons/refresh";
import { extractFirstCodeBlock, splitByFirstCodeFence } from "@/lib/utils";
import { useState, useEffect } from "react";
import type { Chat, Message } from "./page";
import { Share } from "./share";
import { StickToBottom } from "use-stick-to-bottom";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import Spinner from "@/components/spinner";
import Confetti from "react-confetti";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

const CodeRunner = dynamic(() => import("@/components/code-runner"), {
  ssr: false,
});
const SyntaxHighlighter = dynamic(
  () => import("@/components/syntax-highlighter"),
  {
    ssr: false,
  },
);

export default function CodeViewer({
  chat,
  streamText,
  message,
  onMessageChange,
  activeTab,
  onTabChange,
  onClose,
  onRequestFix,
}: {
  chat: Chat;
  streamText: string;
  message?: Message;
  onMessageChange: (v: Message) => void;
  activeTab: string;
  onTabChange: (v: "code" | "preview") => void;
  onClose: () => void;
  onRequestFix: (e: string) => void;
}) {
  const app = message ? extractFirstCodeBlock(message.content) : undefined;
  const streamAppParts = splitByFirstCodeFence(streamText);
  const streamApp = streamAppParts.find(
    (p) =>
      p.type === "first-code-fence-generating" || p.type === "first-code-fence",
  );
  const streamAppIsGenerating = streamAppParts.some(
    (p) => p.type === "first-code-fence-generating",
  );

  const code = streamApp ? streamApp.content : app?.code || "";
  const language = streamApp ? streamApp.language : app?.language || "";
  const title = streamApp ? streamApp.filename.name : app?.filename?.name || "";
  const layout = ["python", "ts", "js", "javascript", "typescript"].includes(
    language,
  )
    ? "two-up"
    : "tabbed";

  const assistantMessages = chat.messages.filter((m) => m.role === "assistant");
  const currentVersion = streamApp
    ? assistantMessages.length
    : message
      ? assistantMessages.map((m) => m.id).indexOf(message.id)
      : 1;
  const previousMessage =
    currentVersion !== 0 ? assistantMessages.at(currentVersion - 1) : undefined;
  const nextMessage =
    currentVersion < assistantMessages.length
      ? assistantMessages.at(currentVersion + 1)
      : undefined;

  const [refresh, setRefresh] = useState(0);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "loading" | "success">("form");
  const [details, setDetails] = useState({ name: "", symbol: "" });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (step === "loading") {
      timeout = setTimeout(() => {
        setStep("success");
      }, 10000);
    }
    return () => clearTimeout(timeout);
  }, [step]);

  function handleMint(e: React.FormEvent) {
    e.preventDefault();
    setStep("loading");
  }

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) {
      setStep("form");
      setDetails({ name: "", symbol: "" });
    }
  }

  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="inline-flex min-w-0 flex-nowrap items-center gap-4">
          <button
            className="text-muted-foreground hover:text-foreground focus-visible:text-foreground"
            onClick={onClose}
          >
            <CloseIcon className="size-5" />
          </button>
          <span
            className="max-w-[40vw] truncate text-foreground sm:max-w-xs"
            title={title}
          >
            {title} v{currentVersion + 1}
          </span>
        </div>
        {layout === "tabbed" && (
          <div className="rounded-lg border-2 border-border p-1">
            <button
              onClick={() => onTabChange("code")}
              data-active={activeTab === "code" ? true : undefined}
              className="data-[active]:bg-primaryMint inline-flex h-7 w-16 items-center justify-center rounded text-xs font-medium data-[active]:text-primary-foreground"
            >
              Code
            </button>
            <button
              onClick={() => onTabChange("preview")}
              data-active={activeTab === "preview" ? true : undefined}
              className="data-[active]:bg-primaryMint inline-flex h-7 w-16 items-center justify-center rounded text-xs font-medium data-[active]:text-primary-foreground"
            >
              Preview
            </button>
          </div>
        )}
      </div>

      {layout === "tabbed" ? (
        <div className="flex grow flex-col overflow-y-auto bg-white">
          {activeTab === "code" ? (
            <StickToBottom
              className="relative grow overflow-hidden"
              resize="smooth"
              initial={streamAppIsGenerating ? "smooth" : false}
            >
              <StickToBottom.Content>
                <SyntaxHighlighter code={code} language={language} />
              </StickToBottom.Content>
            </StickToBottom>
          ) : (
            <>
              {language && (
                <div className="flex h-full items-center justify-center">
                  <CodeRunner
                    onRequestFix={onRequestFix}
                    language={language}
                    code={code}
                    key={refresh}
                  />
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="flex grow flex-col bg-white">
          <div className="h-1/2 overflow-y-auto">
            <SyntaxHighlighter code={code} language={language} />
          </div>
          <div className="flex h-1/2 flex-col">
            <div className="border-t border-gray-300 px-4 py-4">Output</div>
            <div className="flex grow items-center justify-center border-t">
              {!streamAppIsGenerating && (
                <CodeRunner
                  onRequestFix={onRequestFix}
                  language={language}
                  code={code}
                  key={refresh}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-300 px-4 py-4">
        <div className="inline-flex items-center gap-2.5 text-sm">
          <MintButton disabled={!message || !!streamApp} />
          <button
            className="inline-flex items-center gap-1 rounded border border-gray-300 px-1.5 py-0.5 text-sm text-gray-600 transition enabled:hover:bg-white disabled:opacity-50"
            onClick={() => setRefresh((r) => r + 1)}
          >
            <RefreshIcon className="size-3" />
            Refresh
          </button>
        </div>
        <div className="flex items-center justify-end gap-3">
          {previousMessage ? (
            <button
              className="text-gray-900"
              onClick={() => onMessageChange(previousMessage)}
            >
              <ChevronLeftIcon className="size-4" />
            </button>
          ) : (
            <button className="text-gray-900 opacity-25" disabled>
              <ChevronLeftIcon className="size-4" />
            </button>
          )}

          <p className="text-sm">
            Version <span className="tabular-nums">{currentVersion + 1}</span>{" "}
            <span className="text-gray-400">of</span>{" "}
            <span className="tabular-nums">
              {Math.max(currentVersion + 1, assistantMessages.length)}
            </span>
          </p>

          {nextMessage ? (
            <button
              className="text-gray-900"
              onClick={() => onMessageChange(nextMessage)}
            >
              <ChevronRightIcon className="size-4" />
            </button>
          ) : (
            <button className="text-gray-900 opacity-25" disabled>
              <ChevronRightIcon className="size-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function MintButton({ disabled }: { disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "loading" | "success">("form");
  const [details, setDetails] = useState({ name: "", symbol: "" });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (step === "loading") {
      timeout = setTimeout(() => {
        setStep("success");
      }, 10000);
    }
    return () => clearTimeout(timeout);
  }, [step]);

  function handleMint(e: React.FormEvent) {
    e.preventDefault();
    setStep("loading");
  }

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) {
      setStep("form");
      setDetails({ name: "", symbol: "" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="border-primaryMint text-primaryMint enabled:hover:bg-primaryMint/10 enabled:hover:text-primaryMint inline-flex items-center gap-1 rounded border bg-white px-2.5 py-1.5 text-sm font-semibold shadow-sm transition disabled:opacity-50"
        >
          <span role="img" aria-label="Mint" className="size-4 animate-bounce">
            🪙
          </span>
          Mint
        </button>
      </DialogTrigger>
      <DialogContent className="z-[1001] !bg-transparent !p-0 !shadow-none">
        <VisuallyHidden.Root>
          <DialogTitle>Mint your Zapp Coin</DialogTitle>
        </VisuallyHidden.Root>
        <div
          className="ring-primaryMint/20 relative mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-white p-0 shadow-2xl ring-1"
          style={{ zIndex: 1002 }}
        >
          <div className="from-primaryMint/10 flex flex-col items-center justify-center bg-gradient-to-b to-white pb-2 pt-8">
            <div className="mb-2 flex items-center justify-center">
              <span className="animate-bounce text-5xl drop-shadow-lg">🪙</span>
            </div>
            <h2 className="font-heading text-primaryMint mb-1 text-2xl font-bold">
              Mint your Zapp Coin
            </h2>
            <p className="mb-2 text-sm text-gray-500">
              Create your own $Zapp coin and join the builder economy!
            </p>
          </div>
          <div className="px-8 pb-8 pt-2">
            {step === "form" && (
              <form onSubmit={handleMint} className="flex flex-col gap-5">
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  Name
                  <input
                    className="border-primaryMint/40 focus:border-primaryMint focus:ring-primaryMint/30 rounded-lg border px-3 py-2 text-base transition focus:ring-2"
                    required
                    value={details.name}
                    onChange={(e) =>
                      setDetails({ ...details, name: e.target.value })
                    }
                    placeholder="Zapp Coin Name"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  Symbol
                  <input
                    className="border-primaryMint/40 focus:border-primaryMint focus:ring-primaryMint/30 rounded-lg border px-3 py-2 text-base uppercase transition focus:ring-2"
                    required
                    value={details.symbol}
                    onChange={(e) =>
                      setDetails({
                        ...details,
                        symbol: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="ZAPP"
                    maxLength={6}
                  />
                </label>
                <DialogFooter>
                  <button
                    type="submit"
                    className="bg-primaryMint hover:bg-primaryMint/90 focus:ring-primaryMint/40 mt-2 w-full rounded-lg px-4 py-2 text-lg font-semibold text-white shadow-md transition focus:outline-none focus:ring-2"
                  >
                    Mint
                  </button>
                </DialogFooter>
              </form>
            )}
            {step === "loading" && (
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <span className="animate-spin-slow text-5xl">🪙</span>
                <Spinner className="size-8" />
                <div className="text-primaryMint mt-2 text-center text-lg font-semibold">
                  Minting your Zapp coin...
                </div>
                <div className="text-center text-sm text-gray-400">
                  This may take up to 10 seconds
                </div>
              </div>
            )}
            {step === "success" && (
              <div className="relative flex flex-col items-center justify-center gap-4 py-8">
                <Confetti
                  width={windowSize.width}
                  height={windowSize.height}
                  numberOfPieces={350}
                  recycle={false}
                  className="pointer-events-none !fixed !left-0 !top-0 z-[1100]"
                />
                <span className="animate-bounce text-6xl">🎉</span>
                <div className="font-heading text-primaryMint text-center text-2xl font-bold">
                  Success!
                </div>
                <div className="text-center text-lg text-gray-700">
                  Your Zapp coin{" "}
                  <span className="text-primaryMint font-bold">
                    {details.name} ({details.symbol})
                  </span>{" "}
                  has been minted.
                </div>
                <button
                  className="bg-primaryMint hover:bg-primaryMint/90 focus:ring-primaryMint/40 mt-4 w-full rounded-lg px-4 py-2 text-lg font-semibold text-white shadow-md transition focus:outline-none focus:ring-2"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
