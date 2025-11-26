"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { categories } from "@/data/Categories";

gsap.registerPlugin(ScrollTrigger);

const CategoriesSection = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const cards = sectionRef.current.querySelectorAll(".category-card");

    gsap.from(cards, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 85%",
      },
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
    });
  }, []);

  return (
    <section className="w-full py-16 px-4 md:px-6 select-none" ref={sectionRef}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center font-semibold text-[26px] md:text-[30px] tracking-wider text-neutral-800 mb-10">
          CATEGORIES
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {categories.map((cat, index) => (
            <Link
              key={index}
              href={cat.href}
              className="category-card group cursor-pointer"
            >
              {/* CARD */}
              <div
                className="
                  overflow-hidden 
                  bg-gradient-to-b from-neutral-100 to-neutral-50 
                  border border-neutral-200 
                  shadow-[0_3px_10px_rgba(0,0,0,0.07)]
                  transition-all 
                  duration-500 
                  group-hover:scale-[1.03] 
                  group-hover:shadow-[0_10px_25px_rgba(0,0,0,0.12)]
                "
              >
                <div className="relative w-full h-60">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="
                      object-cover 
                      transition-all 
                      duration-500 
                      group-hover:scale-110 
                    "
                  />
                </div>
              </div>

              {/* TITLE */}
              <p className="text-sm tracking-wider text-center mt-4 text-neutral-700 font-medium transition-all duration-500 group-hover:text-black group-hover:tracking-wide">
                {cat.title}
              </p>

              {/* Underline animation */}
              <div className="mx-auto mt-1 h-[2px] w-0 bg-neutral-800 transition-all duration-500 group-hover:w-12"></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
