import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-8">
      <Image src="/logo4.png" alt="ChiBot Logo" width={100} height={100} className="mb-5" />
      <h1 className="text-5xl font-bold mb-4">Welcome to ChiBot</h1>
      <p className="text-xl text-gray-300 mb-2">
        Your friendly conversational partner for practicing Chinese.
      </p>
      <hr className="border-gray-600 w-64 my-4" />
      <p className="text-gray-400 mb-6">Start chatting and improve your skills!</p>
      <div className="flex flex-col items-center gap-3">
        <Link
          href="/chat"
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium no-underline transition-all duration-250 hover:scale-[1.07] hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(0,0,0,0.3)]"
        >
          Start Chatting
        </Link>
        <Link
          href="/word-bank"
          className="border border-gray-100 text-gray-100 px-6 py-2 rounded-lg font-medium no-underline transition-all duration-250 hover:scale-[1.07] hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(0,0,0,0.3)] hover:bg-white/10"
        >
          Word Bank
        </Link>
      </div>
    </div>
  );
}
