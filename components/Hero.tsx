import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-primary-50 to-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Transform Your Insurance
            <span className="block text-primary-600">Submission Process</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            BrokerwellAI streamlines ACORD form submissions with AI-powered parsing 
            and multi-carrier outreach. Upload once, send to multiple carriers instantly.
          </p>
          <div className="mt-10">
            <Link href="/signup">
              <button className="px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

