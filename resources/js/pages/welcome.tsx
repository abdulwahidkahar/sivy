import { Head, Link } from '@inertiajs/react';

export default function HomePage() {
  return (
    <>
      <Head title="CV AI Analyzer" />
      <div className="min-h-screen bg-black text-white font-sans">
        <header className="flex justify-between items-center px-6 py-4 text-sm">
          <div className="flex items-center space-x-6">
            <Link href="/register" className="hover:underline">Register</Link>
            <Link href="/login" className="hover:underline">Login</Link>
            <Link href="/docs" className="hover:underline">Documentation</Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="https://twitter.com" className="hover:underline">X (formerly Twitter)</Link>
            <Link href="https://discord.com" className="hover:underline">Discord</Link>
            <Link href="https://github.com" className="hover:underline">GitHub</Link>
          </div>
        </header>

        <main className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            The modern open-source developer<br />experience platform for your APIs.
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mb-8">
            Create world-class <span className="underline">API Docs</span> with a built-in <span className="underline">interactive playground</span><br />which seamlessly turns to a full featured <span className="underline">API Client</span>.
          </p>
          <div className="flex gap-4">
            <Link href="/upload" className="bg-white text-black px-6 py-3 rounded font-medium hover:bg-gray-200 transition">
              Get started for free
            </Link>
            <button className="border border-gray-600 px-6 py-3 rounded font-medium text-white hover:bg-gray-800 transition">
              Chat with sales
            </button>
          </div>
        </main>

        <section className="w-full px-4 py-8 flex justify-center">
          <div className="border border-gray-700 rounded-xl overflow-hidden w-full max-w-5xl">
            <img src="/images/cv-analyzer-preview.png" alt="App preview" className="w-full object-cover" />
          </div>
        </section>

        <footer className="text-center text-sm text-gray-600 py-6">
          &copy; {new Date().getFullYear()} CV AI Analyzer. Built with ❤️ for developers.
        </footer>
      </div>
    </>
  );
}
