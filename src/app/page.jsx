"use client";
import CategoriesSection from "@/components/Home/CategoriesSection";
import Hero from "@/components/Home/Hero";

const Home = () => {
  const slides = [
    { type: "image", url: "/assets/CarouselAssets/banner1.avif" },
    { type: "video", url: "/assets/CarouselAssets/video1.mp4" },
    { type: "image", url: "/assets/CarouselAssets/banner2.avif" },
  ];

  return (
    <div>
      <Hero slides={slides} />
      <CategoriesSection />
    </div>
  );
};

export default Home;
