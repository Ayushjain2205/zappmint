import Link from "next/link";
import LogoSmall from "@/components/icons/logo-small";
import ArrowLeft from "@/components/icons/arrow-left";
import { getPrisma } from "@/lib/prisma";

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

function GraphSVG({
  up = true,
  color = "#32e2b1",
}: {
  up?: boolean;
  color?: string;
}) {
  // More wavy, dynamic placeholder graph
  return up ? (
    <svg width="48" height="20" viewBox="0 0 48 20" fill="none">
      <path
        d="M0 18 Q6 10 12 14 Q18 18 24 8 Q30 2 36 10 Q42 18 48 2"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg width="48" height="20" viewBox="0 0 48 20" fill="none">
      <path
        d="M0 2 Q6 10 12 6 Q18 2 24 12 Q30 18 36 10 Q42 2 48 18"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
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

export default async function ExplorePage() {
  const prisma = getPrisma();
  const chats = await prisma.chat.findMany({ orderBy: { createdAt: "desc" } });
  console.log("Fetched chats from DB:", chats);

  return (
    <div className="bg-offWhite min-h-screen px-2 pb-20 pt-6">
      <div className="mx-auto mb-4 flex max-w-4xl items-center">
        <Link
          href="/"
          className="text-primaryMint mr-2 inline-flex items-center hover:underline"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-primaryMint flex items-center gap-2 text-xl font-bold">
          Explore Zapps
        </h1>
      </div>
      <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2 md:grid-cols-3">
        {chats.map((chat) => {
          const title = chat.title || chat.prompt || "Untitled App";
          const ticker =
            title
              .replace(/[^A-Za-z0-9]/g, "")
              .toUpperCase()
              .slice(0, 4) || "ZAPP";
          const price = 0.25; // Placeholder
          const userCount = 1000; // Placeholder
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
                <span className="font-mono text-xs text-gray-400">
                  {ticker}
                </span>
              </div>
              {/* Main info */}
              <div className="min-w-0 flex-1">
                <div className="text-jetBlack truncate text-base font-semibold">
                  {title}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <GraphSVG up={up} color={theme.graph} />
                  <div className="ml-auto flex flex-col items-end">
                    <span className="text-jetBlack font-mono text-sm">
                      ${price.toFixed(2)}
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
                <button
                  className={`${theme.button} rounded-full px-3 py-1 text-xs font-semibold transition`}
                >
                  Buy
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
