import { Head, Link } from '@inertiajs/react';

export default function HomePage() {
    return (
        <>
            <Head title="Sivy – AI CV Analyzer – Rethink How You Hire" />
            <div className="min-h-screen bg-white text-gray-800 font-sans antialiased">
                {/* Header */}
                <header className="flex justify-between items-center px-6 py-5 border-b border-gray-200">

                    <h1 className="text-xl font-bold text-gray-900">SivyHire</h1>
                    <nav className="flex space-x-6 text-sm font-medium text-gray-600">
                        <Link href="/register" className="hover:text-gray-900 transition">Register</Link>
                        <Link href="/login" className="hover:text-gray-900 transition">Login</Link>
                        <Link href="/docs" className="hover:text-gray-900 transition">Docs</Link>
                    </nav>
                </header>

                {/* Hero Section */}
                <main className="text-center px-6 py-24 bg-white">
                    <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-gray-900">
                        Rethink How You Hire.
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
                        Automate CV screening. Eliminate guesswork. Focus on the best talent faster — with a platform that transforms hours of manual review into minutes of intelligent decision-making.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/upload" className="bg-gray-900 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-700 transition">
                            Try It Free
                        </Link>
                        <a href="mailto:sales@sivy.app" className="border border-gray-300 px-6 py-3 rounded-md font-medium text-gray-700 hover:bg-gray-100 transition">
                            Talk to Sales
                        </a>
                    </div>
                </main>

                {/* Feature Value Props */}
                <section className="bg-gray-50 py-20 px-6">
                    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 text-left text-gray-600">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">⚡ Instant Shortlisting</h3>
                            <p>Upload hundreds of CVs and get AI-ranked top candidates in minutes. No more tab-hopping, manual note-taking, or overload.</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">📊 Objective & Data-Driven</h3>
                            <p>Consistent scoring using your job description. Remove unconscious bias and standardize your candidate evaluation process.</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">🧠 Living Talent Database</h3>
                            <p>Build a searchable, structured, and reusable talent pool. Rediscover old applicants instantly for new roles.</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">❤️ Candidate-Friendly</h3>
                            <p>Respond faster. Deliver better candidate experiences. Turn your hiring process into a branding opportunity.</p>
                        </div>
                    </div>
                </section>

                {/* Product Preview */}
                <section className="px-4 py-14 bg-white flex justify-center">
                    <div className="w-full max-w-5xl rounded-lg overflow-hidden border border-gray-200 shadow-2xl shadow-gray-200/50">
                        <img src="https://placehold.co/1200x750/E2E8F0/4A5568?text=Sivy+App+Preview" alt="App preview" className="w-full object-cover" />
                    </div>
                </section>

                {/* Testimonial Section */}
                <section className="bg-gray-50 py-20 px-6 text-center">
                    <div className="max-w-3xl mx-auto">
                        <p className="text-xl italic text-gray-700 mb-6">
                            “We used to spend two full days screening applicants manually. Now it takes 15 minutes — and we’re even more confident in our shortlist.”
                        </p>
                        <p className="font-semibold text-gray-900">— Miftahul Aziz., Manager Engineering</p>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="bg-white py-20 px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                        Start screening smarter today.
                    </h2>
                    <p className="text-gray-600 mb-10">
                        Empower your HR team with automation and insights. No setup. No friction. Just results.
                    </p>
                    <Link href="/upload" className="bg-gray-900 text-white px-8 py-4 rounded-md font-semibold text-lg hover:bg-gray-700 transition">
                        Get Started Free
                    </Link>
                </section>

                <footer className="text-center text-sm text-gray-500 py-6 border-t border-gray-200">
                    &copy; {new Date().getFullYear()} Sivy. Built to empower better hiring decisions.
                </footer>
            </div>
        </>
    );
}
