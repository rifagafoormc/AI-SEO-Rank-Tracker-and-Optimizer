import { Link } from "react-router-dom";

function Hero() {
  return (
    <section
      className="relative overflow-hidden bg-white dark:bg-[#1A0F0A] text-slate-900 dark:text-white min-h-[calc(100vh-80px)] flex items-center transition-colors duration-500"
    >

      {/* ================= BACKGROUND GLOWS ================= */}

      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[160px]
                   opacity-[0.12] dark:opacity-[0.40]"
        style={{ backgroundColor: "#6F4E37" }}
      />

      <div
        className="absolute -top-32 right-[-120px] w-[500px] h-[500px] rounded-full blur-[150px]
                   opacity-[0.12] dark:opacity-[0.35]"
        style={{ backgroundColor: "#A47551" }}
      />

      <div
        className="absolute -bottom-48 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[170px]
                   opacity-[0.12] dark:opacity-[0.30]"
        style={{ backgroundColor: "#3E2723" }}
      />

      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-[140px]
                   opacity-[0.10] dark:opacity-[0.18]"
        style={{ backgroundColor: "#D4B59E" }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* ================= CONTENT ================= */}

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 text-center">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
            backdrop-blur-md border text-sm font-medium mb-8"
          style={{
            backgroundColor: "rgba(164,117,81,0.15)",
            borderColor: "rgba(164,117,81,0.40)",
            color: "#6F4E37",
            boxShadow: "0 0 30px rgba(164,117,81,0.25)",
          }}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
              style={{ backgroundColor: "#A47551" }}
            />
            <span
              className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{ backgroundColor: "#A47551" }}
            />
          </span>

          <span className="dark:text-[#D4B59E]">AI-POWERED SEO PLATFORM</span>
        </div>

        {/* Heading */}
        <h1 className="max-w-5xl mx-auto text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05]">

          <span
            className="block bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(to right, #A47551, #D4B59E, #F5EBDD)",
            }}
          >
            AI SEO
          </span>

          <span className="block text-slate-900 dark:text-white mt-2">
            Rank Tracker & Optimizer
          </span>

        </h1>

        {/* Description */}
        <p className="max-w-2xl mx-auto mt-8 text-lg md:text-xl text-slate-600 dark:text-[#D4B59E]/85 leading-relaxed">
          Track keyword rankings, analyze website performance,
          and optimize your website with real-time SEO insights.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">

          <Link
            to="/register"
            className="
              group relative overflow-hidden
              text-white px-9 py-4 rounded-xl font-semibold
              transition-all duration-300 hover:-translate-y-0.5
            "
            style={{
              backgroundColor: "#7A5236",
              boxShadow: "0 10px 40px rgba(122,82,54,0.45)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#5E3E28";
              e.currentTarget.style.boxShadow = "0 10px 50px rgba(122,82,54,0.60)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#7A5236";
              e.currentTarget.style.boxShadow = "0 10px 40px rgba(122,82,54,0.45)";
            }}
          >
            <span className="relative z-10">Get Started →</span>
          </Link>

          <Link
            to="/login"
            className="
              px-9 py-4 rounded-xl font-semibold
              text-slate-700 dark:text-white
              backdrop-blur-md transition-all duration-300
            "
            style={{
              backgroundColor: "rgba(164,117,81,0.12)",
              border: "1px solid rgba(164,117,81,0.35)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(164,117,81,0.22)";
              e.currentTarget.style.borderColor = "rgba(164,117,81,0.60)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(164,117,81,0.12)";
              e.currentTarget.style.borderColor = "rgba(164,117,81,0.35)";
            }}
          >
            Login
          </Link>

        </div>

        {/* ================= TRUST / FEATURES ================= */}

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mt-10 text-sm text-slate-600 dark:text-[#D4B59E]/85">

          {[
            { label: "Real SERP Data", color: "#A47551" },
            { label: "Performance Analysis", color: "#A47551" },
            { label: "Secure Authentication", color: "#D4B59E" },
          ].map((feature) => (
            <div key={feature.label} className="flex items-center gap-2">
              <span
                className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: `${feature.color}22`,
                  color: feature.color,
                }}
              >
                ✓
              </span>
              {feature.label}
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Hero;