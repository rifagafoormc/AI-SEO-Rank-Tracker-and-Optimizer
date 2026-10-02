function Features() {
  const features = [
    {
      icon: "📈",
      title: "Keyword Rank Tracking",
      description:
        "Track your website's Google keyword rankings and see the latest ranking position for each target keyword.",
    },
    {
      icon: "🔍",
      title: "SERP Analysis",
      description:
        "Fetch real Google SERP results and identify your website's ranking page, position, title and search snippet for each keyword.",
    },
    {
      icon: "📝",
      title: "SEO Audit",
      description:
        "Analyze important on-page SEO factors including titles, meta descriptions, headings, images, links, structured data and content.",
    },
    {
      icon: "🤖",
      title: "AI SEO Recommendations",
      description:
        "Use Gemini-powered analysis to generate evidence-based SEO recommendations based on your website and collected page data.",
    },
    {
      icon: "⚡",
      title: "Website Performance",
      description:
        "Measure website performance using Google PageSpeed Insights with Performance, LCP, CLS, FCP and TBT metrics.",
    },
    {
      icon: "🕒",
      title: "Analysis History",
      description:
        "Save and manage previous SEO analyses, audits and performance checks so you can review your website activity over time.",
    },
  ];

  return (
    <section className="bg-gradient-to-br from-[#F5EBDD] via-[#EFE3D2] to-[#F5EBDD] dark:from-[#1A0F0A] dark:via-[#201410] dark:to-[#1A0F0A] py-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Heading */}
        <div className="text-center mb-12">

          <p className="text-[#7A5236] dark:text-[#D4B59E] font-semibold mb-2">
            POWERFUL FEATURES
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-[#1A0F0A] dark:text-white">
            Everything You Need for Better SEO
          </h2>

          <p className="text-[#5E3E28] dark:text-[#D4B59E]/80 mt-4 max-w-2xl mx-auto">
            Analyze, track and optimize your website's SEO performance
            with powerful tools built into one platform.
          </p>

        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {features.map((feature, index) => (

            <div
              key={index}
              className="
                bg-[#7A5236]/10
                dark:bg-[#2B1A11]/70
                backdrop-blur-xl
                rounded-2xl
                shadow-lg
                dark:shadow-black/40
                border
                border-[#7A5236]/30
                dark:border-[#A47551]/25
                p-8
                transition-all
                duration-300
                hover:-translate-y-2
                hover:bg-[#7A5236]/20
                dark:hover:bg-[#3E2723]/80
                hover:shadow-2xl
                dark:hover:shadow-black/50
              "
            >

              {/* Icon */}
              <div
                className="
                  w-14
                  h-14
                  flex
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#7A5236]/15
                  dark:bg-[#A47551]/20
                  backdrop-blur-md
                  border
                  border-[#7A5236]/25
                  dark:border-[#A47551]/30
                  text-2xl
                  mb-6
                "
              >
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-[#1A0F0A] dark:text-white mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-[#5E3E28] dark:text-[#D4B59E]/85 leading-relaxed">
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