import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-primary-700">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
          Ready to Transform Your Workflow?
        </h2>
        <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
          Join forward-thinking insurance brokers who are saving hours every day 
          with BrokerwellAI&apos;s intelligent submission platform.
        </p>
        <div className="flex justify-center">
          <Link href="/signup">
            <button className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

