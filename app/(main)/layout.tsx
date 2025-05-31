import Providers from "@/app/(main)/providers";
import { Toaster } from "@/components/ui/toaster";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <body className="bg-offWhite text-jetBlack flex min-h-full flex-col antialiased">
        {children}

        <Toaster />
      </body>
    </Providers>
  );
}
