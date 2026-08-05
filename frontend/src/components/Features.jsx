import FeatureCard from "./FeatureCard";

function Features() {
  const features = [
    {
      title: "Keyword Rank Tracking",
      description:
        "Monitor your website's keyword rankings using Google Search results.",
    },
    {
      title: "SEO Analysis",
      description:
        "Analyze website performance and identify important SEO issues.",
    },
    {
      title: "AI Recommendations",
      description:
        "Receive intelligent SEO improvement suggestions powered by Google Gemini AI.",
    },
  ];

  return (
    <section className="py-20 bg-gray-100 dark:bg-[#1e293b] transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-12">
          Features
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-8 transition-colors duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                {feature.title}
              </h3>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;

