"use client";
import CategoriesSection from "@/components/Home/CategoriesSection";
import FeaturedProducts from "@/components/Home/FeaturedProducts";
import Hero from "@/components/Home/Hero";
import ProductCard from "@/components/Layouts/ProductCard";

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
      <FeaturedProducts />
    </div>
  );
};

export default Home;
