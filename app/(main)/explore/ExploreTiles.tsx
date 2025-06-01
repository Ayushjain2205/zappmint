"use client";
import Link from "next/link";
import LogoSmall from "@/components/icons/logo-small";
import ArrowLeft from "@/components/icons/arrow-left";
import BuyDialog from "./BuyDialog";

const tileColors = [
  {
    name: "mint",
    button: "bg-primaryMint hover:bg-primaryMint/90 text-white",
    view: "border-primaryMint text-primaryMint hover:bg-primaryMint hover:text-white",
    graph: "#32e2b1",
    icon: "#32e2b1",
  },
  {
    name: "blue",
    button: "bg-blue-500 hover:bg-blue-600 text-white",
    view: "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white",
    graph: "#3b82f6",
    icon: "#3b82f6",
  },
  {
    name: "yellow",
    button: "bg-yellow-400 hover:bg-yellow-500 text-white",
    view: "border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-white",
    graph: "#facc15",
    icon: "#facc15",
  },
  {
    name: "pink",
    button: "bg-pink-400 hover:bg-pink-500 text-white",
    view: "border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-white",
    graph: "#ec4899",
    icon: "#ec4899",
  },
  {
    name: "purple",
    button: "bg-purple-400 hover:bg-purple-500 text-white",
    view: "border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white",
    graph: "#a78bfa",
    icon: "#a78bfa",
  },
  {
    name: "green",
    button: "bg-green-400 hover:bg-green-500 text-white",
    view: "border-green-400 text-green-400 hover:bg-green-400 hover:text-white",
    graph: "#4ade80",
    icon: "#4ade80",
  },
  {
    name: "orange",
    button: "bg-orange-400 hover:bg-orange-500 text-white",
    view: "border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-white",
    graph: "#fb923c",
    icon: "#fb923c",
  },
];

function hashStringToIndex(str: string, max: number) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % max;
}

function UserIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
      <circle cx="8" cy="6" r="3" stroke="#A0AEC0" strokeWidth="1.5" />
      <path
        d="M2.5 13c.5-2 2.5-3 5.5-3s5 1 5.5 3"
        stroke="#A0AEC0"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ExploreTiles({ chats }: { chats: any[] }) {
  return (
    <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2 md:grid-cols-3">
      {chats.map((chat) => {
        const title = chat.title || chat.prompt || "Untitled App";
        const ticker =
          title
            .replace(/[^A-Za-z0-9]/g, "")
            .toUpperCase()
            .slice(0, 4) || "ZAPP";
        // Price between 0.01 and 0.25, seeded by chat.id for consistency
        const priceSeed = (parseInt(chat.id.replace(/\D/g, ""), 10) % 250) + 1;
        const price = (priceSeed / 1000).toFixed(2); // 0.01 to 0.25
        // User count between 1 and 10, seeded by chat.id for consistency
        const userCount = (parseInt(chat.id.replace(/\D/g, ""), 10) % 10) + 1;
        const up = userCount >= 0;
        const colorIdx = hashStringToIndex(chat.id, tileColors.length);
        const theme = tileColors[colorIdx];
        return (
          <div
            key={chat.id}
            className="flex min-h-[64px] items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-sm"
          >
            {/* Logo and ticker */}
            <div className="mr-2 flex flex-col items-center">
              <div
                className={`bg-offWhite mb-1 flex h-12 w-12 items-center justify-center rounded border border-gray-100`}
              >
                <LogoSmall className={`h-7 w-7`} color={theme.icon} />
              </div>
              <span className="font-mono text-xs text-gray-400">{ticker}</span>
            </div>
            {/* Main info */}
            <div className="min-w-0 flex-1">
              <div className="text-jetBlack truncate text-base font-semibold">
                {title}
              </div>
              <div className="mt-1 flex items-center gap-2">
                {/* GraphSVG is not needed here, just for BuyDialog */}
                <div className="ml-auto flex flex-col items-end">
                  <span className="text-jetBlack font-mono text-sm">
                    ${price}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 font-mono text-xs text-gray-500">
                    <UserIcon />
                    {userCount}
                  </span>
                </div>
              </div>
            </div>
            {/* Actions */}
            <div className="ml-2 flex flex-col gap-2">
              <Link
                href={`/chats/${chat.id}`}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${theme.view}`}
              >
                View
              </Link>
              <BuyDialog
                ticker={ticker}
                color={theme.graph}
                userCount={userCount}
                price={price}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
