import Link from "next/link";
import LogoSmall from "@/components/icons/logo-small";
import ArrowLeft from "@/components/icons/arrow-left";
import { getPrisma } from "@/lib/prisma";

function GraphSVG({ up = true }: { up?: boolean }) {
  // More wavy, dynamic placeholder graph
  return up ? (
    <svg width="48" height="20" viewBox="0 0 48 20" fill="none">
      <path
        d="M0 18 Q6 10 12 14 Q18 18 24 8 Q30 2 36 10 Q42 18 48 2"
        stroke="#32e2b1"
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg width="48" height="20" viewBox="0 0 48 20" fill="none">
      <path
        d="M0 2 Q6 10 12 6 Q18 2 24 12 Q30 18 36 10 Q42 2 48 18"
        stroke="#32e2b1"
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
          return (
            <div
              key={chat.id}
              className="flex min-h-[64px] items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-sm"
            >
              {/* Logo and ticker */}
              <div className="mr-2 flex flex-col items-center">
                <div className="bg-offWhite mb-1 flex h-12 w-12 items-center justify-center rounded border border-gray-100">
                  <LogoSmall className="text-primaryMint h-7 w-7" />
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
                  <GraphSVG up={up} />
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
                  className="border-primaryMint text-primaryMint hover:bg-primaryMint rounded-full border bg-white px-3 py-1 text-xs font-semibold transition hover:text-white"
                >
                  View
                </Link>
                <button className="bg-primaryMint hover:bg-primaryMint/90 rounded-full px-3 py-1 text-xs font-semibold text-white transition">
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
