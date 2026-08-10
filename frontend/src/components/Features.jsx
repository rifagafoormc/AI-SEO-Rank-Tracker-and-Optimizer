function Features() {
  const features = [
    {
      icon: "📈",
      title: "Keyword Rank Tracking",
      description:
        "Track your website's keyword rankings and monitor your search engine positions over time.",
    },
    {
      icon: "🔍",
      title: "Real SERP Rankings",
      description:
        "Fetch real search engine ranking data and view your keyword positions in the Rankings dashboard.",
    },
    {
      icon: "⚡",
      title: "Website Performance",
      description:
        "Analyze website performance using Google PageSpeed Insights with Performance, LCP, CLS and TBT metrics.",
    },
    {
      icon: "📊",
      title: "SEO Analysis",
      description:
        "Analyze your website and identify important SEO and performance information from a single dashboard.",
    },
    {
      icon: "🕒",
      title: "Analysis History",
      description:
        "Keep track of previous website analyses and manage your saved analysis records easily.",
    },
    {
      icon: "🔐",
      title: "Secure User Accounts",
      description:
        "Register and log in securely with JWT authentication, password protection and role-based access.",
    },
  ];

  return (
    <section className="bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 dark:from-[#080b1a] dark:via-[#100b24] dark:to-[#090d1f] py-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Heading */}
        <div className="text-center mb-12">

          <p className="text-blue-600 dark:text-cyan-300 font-semibold mb-2">
            POWERFUL FEATURES
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
            Everything You Need for Better SEO
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
            Analyze, track and monitor your website's SEO performance
            with powerful tools built into one platform.
          </p>

        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {features.map((feature, index) => (

            <div
              key={index}
              className="
                bg-violet-500/10
                dark:bg-[#3b1766]/70
                backdrop-blur-xl
                rounded-2xl
                shadow-lg
                dark:shadow-violet-950/40
                border
                border-violet-300/40
                dark:border-violet-400/30
                p-8
                transition-all
                duration-300
                hover:-translate-y-2
                hover:bg-violet-500/20
                dark:hover:bg-[#4c1d7a]/80
                hover:shadow-2xl
                dark:hover:shadow-violet-900/50
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
                  bg-violet-500/20
                  dark:bg-violet-500/30
                  backdrop-blur-md
                  border
                  border-violet-300/30
                  text-2xl
                  mb-6
                "
              >
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 dark:text-violet-100 leading-relaxed">
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