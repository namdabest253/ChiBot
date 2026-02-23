'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto mt-5 w-fit max-w-[95%] rounded-full bg-[#3c45c6] border-2 border-blue-500 px-8 py-3 shadow-[0_6px_20px_rgba(0,0,0,0.5)] transition-all duration-300">
      <div className="flex items-center gap-6">
        <Link href="/" className="transition-all duration-200 hover:scale-[1.08] hover:-translate-y-1">
          <Image src="/logo4.png" alt="ChiBot Logo" width={60} height={60} />
        </Link>
        <Link
          href="/chat"
          className={`text-gray-100 font-bold no-underline transition-all duration-200 hover:scale-[1.08] hover:-translate-y-1 ${
            pathname === '/chat' ? 'underline underline-offset-4' : ''
          }`}
        >
          Chat
        </Link>
        <Link
          href="/word-bank"
          className={`text-gray-100 font-bold no-underline transition-all duration-200 hover:scale-[1.08] hover:-translate-y-1 ${
            pathname === '/word-bank' ? 'underline underline-offset-4' : ''
          }`}
        >
          Word Bank
        </Link>
      </div>
    </nav>
  );
}
