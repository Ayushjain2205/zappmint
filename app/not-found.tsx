import Header from "@/components/header";

export default function Page() {
  return (
    <body className="bg-offWhite text-jetBlack flex min-h-full flex-col antialiased">
      <div className="flex grow flex-col">
        <Header />
        <div className="flex grow items-center justify-center">
          <h2 className="text-3xl">404 | Not Found</h2>
        </div>
      </div>
    </body>
  );
}
