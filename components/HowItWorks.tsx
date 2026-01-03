export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Upload Your ACORD",
      description: "Simply drag and drop your ACORD form. Our AI-powered OCR extracts all the information, even from scanned documents.",
      color: "bg-primary-500"
    },
    {
      number: "2",
      title: "Review & Customize",
      description: "See your extracted data and AI-generated email draft side-by-side. Make any adjustments to ensure perfection.",
      color: "bg-primary-600"
    },
    {
      number: "3",
      title: "Send to Multiple Carriers",
      description: "Add carrier emails and click send. Each carrier receives a personalized submission tailored to their requirements.",
      color: "bg-primary-700"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Three simple steps to transform your submission workflow
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className={`${step.color} text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-6 shadow-lg`}>
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gray-300 -translate-x-1/2" 
                     style={{ width: 'calc(100% - 4rem)' }}>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


