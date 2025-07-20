import { Head, Link } from '@inertiajs/react';

export default function HomePage() {
    return (
        <>
            <Head title="CV AI Analyzer – Rethink How You Hire" />
            <div className="min-h-screen bg-black text-white font-sans antialiased">
                <header className="flex justify-between items-center px-6 py-5 border-b border-gray-800">
                    <h1 className="text-xl font-bold">Sivy</h1>
                    <nav className="flex space-x-6 text-sm">
                        <Link href="/register" className="hover:underline">Register</Link>
                        <Link href="/login" className="hover:underline">Login</Link>
                        <Link href="/docs" className="hover:underline">Docs</Link>
                    </nav>
                </header>

                {/* Hero Section */}
                <main className="text-center px-6 py-24 bg-black">
                    <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                        Rethink How You Hire.
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
                        Automate CV screening. Eliminate guesswork. Focus on the best talent faster — with a platform that transforms hours of manual review into minutes of intelligent decision-making.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/upload" className="bg-white text-black px-6 py-3 rounded font-medium hover:bg-gray-200 transition">
                            Try It Free
                        </Link>
                        <a href="mailto:sales@cvai.com" className="border border-gray-600 px-6 py-3 rounded font-medium text-white hover:bg-gray-800 transition">
                            Talk to Sales
                        </a>
                    </div>
                </main>

                {/* Feature Value Props */}
                <section className="bg-[#0a0a0a] py-20 px-6">
                    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 text-left text-gray-300">
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-3">⚡ Instant Shortlisting</h3>
                            <p>Upload hundreds of CVs and get AI-ranked top candidates in minutes. No more tab-hopping, manual note-taking, or overload.</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-3">📊 Objective & Data-Driven</h3>
                            <p>Consistent scoring using your job description. Remove unconscious bias and standardize your candidate evaluation process.</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-3">🧠 Living Talent Database</h3>
                            <p>Build a searchable, structured, and reusable talent pool. Rediscover old applicants instantly for new roles.</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-3">❤️ Candidate-Friendly</h3>
                            <p>Respond faster. Deliver better candidate experiences. Turn your hiring process into a branding opportunity.</p>
                        </div>
                    </div>
                </section>

                {/* Product Preview */}
                <section className="px-4 py-14 bg-black flex justify-center">
                    <div className="w-full max-w-5xl rounded-lg overflow-hidden border border-gray-800 shadow-lg">
                        <img src="/images/cv-analyzer-preview.png" alt="App preview" className="w-full object-cover" />
                    </div>
                </section>

                {/* Testimonial Section */}
                <section className="bg-[#0a0a0a] py-20 px-6 text-center">
                    <div className="max-w-3xl mx-auto">
                        <p className="text-xl italic text-gray-300 mb-6">
                            “We used to spend two full days screening applicants manually. Now it takes 15 minutes — and we’re even more confident in our shortlist.”
                        </p>
                        <p className="font-semibold text-white">— Miftahul Aziz., Manager Engineering</p>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="bg-black py-20 px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Start screening smarter today.
                    </h2>
                    <p className="text-gray-400 mb-10">
                        Empower your HR team with automation and insights. No setup. No friction. Just results.
                    </p>
                    <Link href="/upload" className="bg-white text-black px-8 py-4 rounded font-semibold text-lg hover:bg-gray-200 transition">
                        Get Started Free
                    </Link>
                </section>

                <footer className="text-center text-sm text-gray-600 py-6 border-t border-gray-800">
                    &copy; {new Date().getFullYear()} CV AI Analyzer. Built to empower better hiring decisions.
                </footer>
            </div>
        </>
    );
}
