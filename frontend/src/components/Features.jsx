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
    <section className="py-20 bg-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">
          Features
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;