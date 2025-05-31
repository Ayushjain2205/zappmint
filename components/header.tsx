import Image from "next/image";

import GithubIcon from "@/components/icons/github-icon";
import logo from "@/public/new_logo.png";
import Link from "next/link";

export default function Header() {
  return (
    <header className="relative mx-auto flex w-full shrink-0 items-center justify-center py-6">
      <Link href="/">
        <Image
          src={logo}
          alt=""
          quality={100}
          className="mx-auto h-20 object-contain"
          priority
        />
      </Link>
    </header>
  );
}
