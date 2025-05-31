/* eslint-disable @next/next/no-img-element */
"use client";

import Fieldset from "@/components/fieldset";
import ArrowRightIcon from "@/components/icons/arrow-right";
import LightningBoltIcon from "@/components/icons/lightning-bolt";
import LoadingButton from "@/components/loading-button";
import Spinner from "@/components/spinner";
import bgImg from "@/public/halo.png";
import * as Select from "@radix-ui/react-select";
import assert from "assert";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState, useRef, useTransition } from "react";
import { createChat } from "./actions";
import { Context } from "./providers";
import Header from "@/components/header";
import { useS3Upload } from "next-s3-upload";
import UploadIcon from "@/components/icons/upload-icon";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { MODELS, SUGGESTED_PROMPTS } from "@/lib/constants";

export default function Home() {
  const { setStreamPromise } = use(Context);
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(MODELS[0].value);
  const [quality, setQuality] = useState("high");
  const [screenshotUrl, setScreenshotUrl] = useState<string | undefined>(
    undefined,
  );
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const selectedModel = MODELS.find((m) => m.value === model);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPending, startTransition] = useTransition();

  const { uploadToS3 } = useS3Upload();
  const handleScreenshotUpload = async (event: any) => {
    if (prompt.length === 0) setPrompt("Build this");
    setQuality("low");
    setScreenshotLoading(true);
    let file = event.target.files[0];
    const { url } = await uploadToS3(file);
    setScreenshotUrl(url);
    setScreenshotLoading(false);
  };

  const textareaResizePrompt = prompt
    .split("\n")
    .map((text) => (text === "" ? "a" : text))
    .join("\n");

  return (
    <div className="font-body relative flex grow flex-col">
      <div className="absolute inset-0 flex justify-center">
        <Image
          src={bgImg}
          alt=""
          className="max-h-[953px] w-full max-w-[1200px] object-cover object-top mix-blend-screen"
          priority
        />
      </div>

      <div className="isolate flex h-full grow flex-col">
        <Header />

        <div className="mt-5 flex grow flex-col items-center px-4 lg:mt-16">
          <a
            className="bg-offWhite text-jetBlack mb-4 inline-flex shrink-0 items-center rounded-full border-[0.5px] px-7 py-2 text-xs shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25)] md:text-base"
            href="https://togetherai.link/?utm_source=llamacoder&utm_medium=referral&utm_campaign=example-app"
            target="_blank"
          >
            <span className="text-center">
              Tokenizing{" "}
              <span className="text-primaryMint font-semibold">
                imagination
              </span>
              , powering{" "}
              <span className="text-primaryMint font-semibold">builders</span>
            </span>
          </a>

          <h1 className="text-jetBlack font-heading mt-4 text-balance text-center text-4xl leading-none md:text-[64px] lg:mt-8">
            Mint your <span className="text-primaryMint">idea</span>
            <br className="hidden md:block" /> into a{" "}
            <span className="text-blueAccent">$zapp</span>
          </h1>

          <form
            className="relative w-full max-w-2xl pt-6 lg:pt-12"
            action={async (formData) => {
              startTransition(async () => {
                const { prompt, model, quality } = Object.fromEntries(formData);

                assert.ok(typeof prompt === "string");
                assert.ok(typeof model === "string");
                assert.ok(quality === "high" || quality === "low");

                const { chatId, lastMessageId } = await createChat(
                  prompt,
                  model,
                  quality,
                  screenshotUrl,
                );

                const streamPromise = fetch(
                  "/api/get-next-completion-stream-promise",
                  {
                    method: "POST",
                    body: JSON.stringify({ messageId: lastMessageId, model }),
                  },
                ).then((res) => {
                  if (!res.body) {
                    throw new Error("No body on response");
                  }
                  return res.body;
                });

                startTransition(() => {
                  setStreamPromise(streamPromise);
                  router.push(`/chats/${chatId}`);
                });
              });
            }}
          >
            <Fieldset>
              <div className="relative flex w-full max-w-2xl rounded-xl border-4 border-gray-300 bg-white pb-10">
                <div className="w-full">
                  {screenshotLoading && (
                    <div className="relative mx-3 mt-3">
                      <div className="rounded-xl">
                        <div className="group mb-2 flex h-16 w-[68px] animate-pulse items-center justify-center rounded bg-gray-200">
                          <Spinner />
                        </div>
                      </div>
                    </div>
                  )}
                  {screenshotUrl && (
                    <div
                      className={`${isPending ? "invisible" : ""} relative mx-3 mt-3`}
                    >
                      <div className="rounded-xl">
                        <img
                          alt="screenshot"
                          src={screenshotUrl}
                          className="group relative mb-2 h-16 w-[68px] rounded"
                        />
                      </div>
                      <button
                        type="button"
                        id="x-circle-icon"
                        className="absolute -right-3 -top-4 left-14 z-10 size-5 rounded-full bg-white text-gray-900 hover:text-gray-500"
                        onClick={() => {
                          setScreenshotUrl(undefined);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                      >
                        <XCircleIcon />
                      </button>
                    </div>
                  )}
                  <div className="relative">
                    <div className="p-3">
                      <p className="invisible w-full whitespace-pre-wrap">
                        {textareaResizePrompt}
                      </p>
                    </div>
                    <textarea
                      placeholder="Build me a budgeting app..."
                      required
                      name="prompt"
                      rows={1}
                      className="peer absolute inset-0 w-full resize-none bg-transparent p-3 placeholder-gray-500 focus-visible:outline-none disabled:opacity-50"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          const target = event.target;
                          if (!(target instanceof HTMLTextAreaElement)) return;
                          target.closest("form")?.requestSubmit();
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 right-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Select.Root
                      name="model"
                      value={model}
                      onValueChange={setModel}
                    >
                      <Select.Trigger className="hover:text-jetBlack focus-visible:outline-primaryMint inline-flex items-center gap-1 rounded-md p-1 text-sm text-gray-400 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2">
                        <Select.Value aria-label={model}>
                          <span>{selectedModel?.label}</span>
                        </Select.Value>
                        <Select.Icon>
                          <ChevronDownIcon className="size-3" />
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content className="overflow-hidden rounded-md bg-white shadow ring-1 ring-black/5">
                          <Select.Viewport className="space-y-1 p-2">
                            {MODELS.map((m) => (
                              <Select.Item
                                key={m.value}
                                value={m.value}
                                className="flex cursor-pointer items-center gap-1 rounded-md p-1 text-sm data-[highlighted]:bg-gray-100 data-[highlighted]:outline-none"
                              >
                                <Select.ItemText className="inline-flex items-center gap-2 text-gray-500">
                                  {m.label}
                                </Select.ItemText>
                                <Select.ItemIndicator>
                                  <CheckIcon className="text-primaryMint size-3" />
                                </Select.ItemIndicator>
                              </Select.Item>
                            ))}
                          </Select.Viewport>
                          <Select.ScrollDownButton />
                          <Select.Arrow />
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>

                    <div className="h-4 w-px bg-gray-200 max-sm:hidden" />

                    <Select.Root
                      name="quality"
                      value={quality}
                      onValueChange={setQuality}
                    >
                      <Select.Trigger className="hover:text-jetBlack focus-visible:outline-primaryMint inline-flex items-center gap-1 rounded p-1 text-sm text-gray-400 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2">
                        <Select.Value aria-label={quality}>
                          <span className="max-sm:hidden">
                            {quality === "low"
                              ? "Low quality [faster]"
                              : "High quality [slower]"}
                          </span>
                          <span className="sm:hidden">
                            <LightningBoltIcon className="size-3" />
                          </span>
                        </Select.Value>
                        <Select.Icon>
                          <ChevronDownIcon className="size-3" />
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content className="overflow-hidden rounded-md bg-white shadow ring-1 ring-black/5">
                          <Select.Viewport className="space-y-1 p-2">
                            {[
                              { value: "low", label: "Low quality [faster]" },
                              {
                                value: "high",
                                label: "High quality [slower]",
                              },
                            ].map((q) => (
                              <Select.Item
                                key={q.value}
                                value={q.value}
                                className="flex cursor-pointer items-center gap-1 rounded-md p-1 text-sm data-[highlighted]:bg-gray-100 data-[highlighted]:outline-none"
                              >
                                <Select.ItemText className="inline-flex items-center gap-2 text-gray-500">
                                  {q.label}
                                </Select.ItemText>
                                <Select.ItemIndicator>
                                  <CheckIcon className="text-primaryMint size-3" />
                                </Select.ItemIndicator>
                              </Select.Item>
                            ))}
                          </Select.Viewport>
                          <Select.ScrollDownButton />
                          <Select.Arrow />
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                    <div className="h-4 w-px bg-gray-200 max-sm:hidden" />
                    <div>
                      <label
                        htmlFor="screenshot"
                        className="flex cursor-pointer gap-2 text-sm text-gray-400 hover:underline"
                      >
                        <div className="flex size-6 items-center justify-center rounded bg-black hover:bg-gray-700">
                          <UploadIcon className="size-4" />
                        </div>
                        <div className="flex items-center justify-center transition hover:text-gray-700">
                          Attach
                        </div>
                      </label>
                      <input
                        // name="screenshot"
                        id="screenshot"
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                        ref={fileInputRef}
                      />
                    </div>
                  </div>

                  <div className="relative flex shrink-0 has-[:disabled]:opacity-50">
                    <div className="bg-primaryMint pointer-events-none absolute inset-0 -bottom-[1px] rounded" />

                    <LoadingButton
                      className="bg-primaryMint outline-primaryMint hover:bg-primaryMint/75 relative inline-flex size-6 items-center justify-center rounded font-medium text-white shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      type="submit"
                    >
                      <ArrowRightIcon />
                    </LoadingButton>
                  </div>
                </div>

                {isPending && (
                  <LoadingMessage
                    isHighQuality={quality === "high"}
                    screenshotUrl={screenshotUrl}
                  />
                )}
              </div>
              <div className="mt-4 flex w-full flex-wrap justify-center gap-3">
                {SUGGESTED_PROMPTS.map((v) => (
                  <button
                    key={v.title}
                    type="button"
                    onClick={() => setPrompt(v.description)}
                    className="rounded bg-gray-200 px-2.5 py-1.5 text-xs hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            </Fieldset>
          </form>
        </div>
      </div>
    </div>
  );
}

function LoadingMessage({
  isHighQuality,
  screenshotUrl,
}: {
  isHighQuality: boolean;
  screenshotUrl: string | undefined;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white px-1 py-3 md:px-3">
      <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
        <span className="animate-pulse text-balance text-center text-sm md:text-base">
          {isHighQuality
            ? `Coming up with project plan, may take 15 seconds...`
            : screenshotUrl
              ? "Analyzing your screenshot..."
              : `Creating your app...`}
        </span>

        <Spinner />
      </div>
    </div>
  );
}

export const runtime = "edge";
export const maxDuration = 45;
