"use client";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export default function BuyDialog({
  ticker,
  color,
  userCount,
  price,
}: {
  ticker: string;
  color: string;
  userCount: number;
  price: string;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("10");
  // Mock price data
  const priceData = [
    { time: "9:00", price: 0.22 },
    { time: "10:00", price: 0.23 },
    { time: "11:00", price: 0.24 },
    { time: "12:00", price: 0.23 },
    { time: "13:00", price: 0.25 },
    { time: "14:00", price: 0.26 },
    { time: "15:00", price: 0.25 },
  ];
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={`bg-primaryMint hover:bg-primaryMint/90 rounded-full px-3 py-1 text-xs font-semibold text-white transition`}
        >
          Buy
        </button>
      </DialogTrigger>
      <DialogContent className="z-[1001] !bg-transparent !p-0 !shadow-none">
        <VisuallyHidden.Root>
          <DialogTitle>Buy {ticker}</DialogTitle>
        </VisuallyHidden.Root>
        <div
          className="ring-primaryMint/20 relative mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-white p-0 shadow-2xl ring-1"
          style={{ zIndex: 1002 }}
        >
          {/* Header section with gradient and ticker */}
          <div className="from-primaryMint/10 flex flex-col items-center justify-center bg-gradient-to-b to-white pb-2 pt-8">
            <div className="mb-2 flex items-center justify-center">
              <span
                className="text-5xl drop-shadow-lg"
                role="img"
                aria-label="Buy"
              >
                💸
              </span>
            </div>
            <h2 className="font-heading text-primaryMint mb-1 text-2xl font-bold">
              Buy <span className="uppercase">${ticker}</span>
            </h2>
            <div className="mb-1 text-xs text-gray-500">
              {userCount.toLocaleString()} users
            </div>
            <div className="text-jetBlack mb-2 font-mono text-base">
              Price: <span className="font-bold">${price}</span>
            </div>
          </div>
          <div className="px-8 pb-8 pt-2">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-24 w-full items-center justify-center rounded-xl bg-white">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={priceData}
                    margin={{ left: 0, right: 0, top: 8, bottom: 0 }}
                  >
                    <XAxis dataKey="time" hide tick={false} axisLine={false} />
                    <YAxis
                      domain={[0.2, 0.27]}
                      hide
                      tick={false}
                      axisLine={false}
                    />
                    <Tooltip
                      formatter={(v) =>
                        typeof v === "number" ? `$${v.toFixed(2)}` : v
                      }
                      labelFormatter={() => ""}
                      contentStyle={{
                        background: "#fff",
                        border: "1px solid #eee",
                        color: "#222",
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke={color}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <form
                className="mt-4 flex w-full flex-col gap-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  setOpen(false);
                }}
              >
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  Amount ($)
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="border-primaryMint/40 focus:border-primaryMint focus:ring-primaryMint/30 rounded-lg border bg-white px-3 py-2 text-base text-gray-900 placeholder-gray-400 transition focus:ring-2"
                    placeholder="Enter amount in USD"
                  />
                </label>
                <DialogFooter>
                  <button
                    type="submit"
                    className="bg-primaryMint hover:bg-primaryMint/90 focus:ring-primaryMint/40 mt-2 w-full rounded-lg px-4 py-2 text-lg font-semibold text-white shadow-md transition focus:outline-none focus:ring-2"
                  >
                    Buy
                  </button>
                </DialogFooter>
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GraphSVG({
  up = true,
  color = "#32e2b1",
}: {
  up?: boolean;
  color?: string;
}) {
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
