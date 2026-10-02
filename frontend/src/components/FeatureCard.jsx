function FeatureCard({ title, description }) {
  return (
    <div
      className="
        bg-white
        dark:bg-[#2B1A11]/70
        backdrop-blur-xl
        rounded-xl
        shadow-lg
        dark:shadow-black/40
        border
        border-[#7A5236]/15
        dark:border-[#A47551]/20
        p-6
        transition-all
        duration-300
        hover:shadow-xl
        hover:-translate-y-1
        hover:border-[#7A5236]/30
        dark:hover:border-[#A47551]/35
        dark:hover:bg-[#3E2723]/80
      "
    >
      <h3 className="text-xl font-semibold text-[#7A5236] dark:text-[#D4B59E] mb-3">
        {title}
      </h3>

      <p className="text-[#5E3E28] dark:text-[#D4B59E]/80">
        {description}
      </p>
    </div>
  );
}

export default FeatureCard;