export default function HeroSection({ search, setSearch }) {
  return (
    <div className="relative overflow-hidden bg-[#fff9f4] px-6 pt-16 pb-24 sm:pt-24">
      {/* Decorative blur background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-50px] left-[-50px] w-[300px] h-[300px] bg-[#e0caba70] rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-50px] right-[-50px] w-[250px] h-[250px] bg-[#d3a87750] rounded-full blur-[80px]"></div>
      </div>

      <div className="max-w-5xl mx-auto text-center space-y-4">
        {/* Tag */}
        <p className="uppercase tracking-[0.22em] text-xs text-gray-500">
          new season drop
        </p>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 leading-tight">
          Discover <span className="text-[#654321]">Premium Streetwear</span>
          <br /> Crafted for comfort & style.
        </h1>

        {/* Subtext */}
        <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto">
          Unique designs. Superior materials. Limited edition pieces for those
          who stand out.
        </p>

        {/* Search Box */}
        <div className="mt-6 flex justify-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hoodies, tees, joggers..."
            className="w-72 sm:w-96 px-4 py-3 border border-[#c9a77a] rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#654321] text-gray-700"
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <button className="px-6 py-3 bg-[#654321] text-white rounded-full hover:bg-[#4c3418] transition text-sm sm:text-base">
            Shop Now
          </button>

          <button className="px-6 py-3 border border-[#654321] text-[#654321] rounded-full hover:bg-[#e2c9b8] transition text-sm sm:text-base">
            New Arrivals
          </button>
        </div>
      </div>
    </div>
  );
}
