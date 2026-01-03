export default function Features() {
  const features = [
    {
      title: "AI-Powered Parsing",
      description: "Advanced OCR technology converts scanned ACORDs into structured, searchable data instantly.",
      icon: "🤖"
    },
    {
      title: "Multi-Carrier Submission",
      description: "Send tailored submissions to multiple insurance carriers with a single click.",
      icon: "📧"
    },
    {
      title: "Time Savings",
      description: "Reduce submission prep time by 90%. Spend more time on what matters - your clients.",
      icon: "⚡"
    },
    {
      title: "Smart Email Drafting",
      description: "AI generates personalized emails for each carrier, maintaining your professional tone.",
      icon: "✍️"
    },
    {
      title: "Side-by-Side Review",
      description: "Review your ACORD and email draft simultaneously before sending.",
      icon: "👁️"
    },
    {
      title: "Secure & Compliant",
      description: "Bank-level encryption ensures your client data stays protected and compliant.",
      icon: "🔒"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Scale Your Business
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Built specifically for insurance brokers who want to work smarter, not harder.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


