"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
const logo = "/assets/Logo.png";

const megaMenuData = [
  {
    title: "Shirts",
    sub: ["Casual Shirts", "Formal Shirts", "Denim Shirts", "Partywear Shirts"],
  },
  {
    title: "T-Shirts",
    sub: ["Oversized", "Graphics", "Plain", "Henley"],
  },
  {
    title: "Jeans",
    sub: ["Slim Fit", "Straight Fit", "Baggy", "Ripped Denim"],
  },
];

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products", mega: true },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const Icon = {
  profile: (
    <svg
      width="22"
      height="22"
      fill="none"
      strokeWidth="1.6"
      stroke="currentColor"
    >
      <circle cx="11" cy="7" r="4" />
      <path d="M4 20c0-4 3-6 7-6s7 2 7 6" />
    </svg>
  ),
  wishlist: (
    <svg
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M12 20s-6.5-4.4-9-8.8C-1.1 5.2 2.3 1 6.7 2.3A5.4 5.4 0 0112 6.1a5.4 5.4 0 015.3-3.8c4.4-1.3 7.8 2.9 3.7 8.9C18.5 15.6 12 20 12 20z" />
    </svg>
  ),
  cart: (
    <svg
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <circle cx="9" cy="19" r="1.6" />
      <circle cx="17" cy="19" r="1.6" />
      <path d="M3 3h3l2.4 10.4c.2.8.9 1.3 1.7 1.3h7.6c.8 0 1.5-.5 1.7-1.3L21 7H7" />
    </svg>
  ),
};
const MobileIcons = {
  arrowDown: (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 8l4 4 4-4" />
    </svg>
  ),
  arrowUp: (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 12l4-4 4 4" />
    </svg>
  ),
};

const NavBar = () => {
  const pathname = usePathname();
  const isActive = (href) => pathname === href;
  const [isProductsMegaOpen, setIsProductsMegaOpen] = useState(false);

  const [desktopMegaOpen, setDesktopMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileMega, setOpenMobileMega] = useState(null);

  const desktopMegaRef = useRef(null);
  const mobileMegaRef = useRef(null);

  /* Desktop GSAP Mega Animation */
  useEffect(() => {
    if (!desktopMegaRef.current) return;
    gsap.set(desktopMegaRef.current, {
      height: 0,
      opacity: 0,
      display: "none",
    });
  }, []);

  const openDesktopMega = () => {
    setDesktopMegaOpen(true);
    gsap.killTweensOf(desktopMegaRef.current);
    gsap.set(desktopMegaRef.current, { display: "block" });
    gsap.to(desktopMegaRef.current, {
      height: "auto",
      opacity: 1,
      duration: 0.35,
      ease: "power3.out",
    });
  };

  const closeDesktopMega = () => {
    gsap.to(desktopMegaRef.current, {
      height: 0,
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => setDesktopMegaOpen(false),
    });
  };

  /* Mobile GSAP Mega Animation */
  useEffect(() => {
    if (!mobileMegaRef.current) return;
    gsap.set(mobileMegaRef.current, { height: 0, opacity: 0 });
  }, []);

  const toggleMobileMega = (menuName) => {
    if (openMobileMega === menuName) {
      setOpenMobileMega(null); // close if already open
    } else {
      setOpenMobileMega(menuName); // open the specific one
    }
  };

  return (
    <div className="relative z-50">
      <nav className="bg-[#FAF0E6] border-b border-[#DEB887] shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* LOGO */}

          <Link
            href="/"
            className="flex items-center space-x-3 hover:scale-105 transition-transform duration-200"
          >
            <div className="w-20  md:w-14 md:h-14  overflow-hidden flex items-center justify-center ">
              <Image
                src={"/assets/logo.png"}
                alt="Branded Collection Logo"
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[#654321] text-lg md:text-xl font-serif tracking-wide">
                Branded Collection
              </span>
            </div>
          </Link>

          <ul className="hidden md:flex space-x-10 text-[15px] font-semibold uppercase text-[#654321']">
            {navLinks.map((link, idx) =>
              link.mega ? (
                <li
                  key={idx}
                  className="relative"
                  onMouseEnter={() => setIsProductsMegaOpen(true)}
                  onMouseLeave={() => setIsProductsMegaOpen(false)}
                >
                  <Link
                    href="/products"
                    className={`px-2 py-1 transition ${
                      isActive("/products")
                        ? "text-[#654321]"
                        : "text-gray-700 hover:text-[#654321]"
                    }`}
                  >
                    Products
                  </Link>

                  {isProductsMegaOpen && (
                    <div className="absolute left-1/2 top-full transform -translate-x-1/2 w-[600px] bg-[#FFFDF8] border-t border-[#DEB887] shadow-xl overflow-hidden z-40 rounded-b-md">
                      <div className="px-6 py-8 grid grid-cols-3 gap-6">
                        {megaMenuData.map((cat, i) => (
                          <div key={i}>
                            <h3 className="text-lg font-bold text-[#654321] mb-4 uppercase">
                              {cat.title}
                            </h3>
                            <ul className="space-y-2 text-gray-700">
                              {cat.sub.map((s, si) => (
                                <li key={si}>
                                  <Link
                                    href={`/products/${cat.title.toLowerCase()}/${s
                                      .toLowerCase()
                                      .replace(/ /g, "-")}`}
                                    className="hover:text-[#654321] transition"
                                  >
                                    {s}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              ) : (
                <li key={link.name} className="relative group">
                  <Link
                    href={link.href}
                    className={`relative px-2 py-1 font-semibold transition-colors ${
                      isActive(link.href)
                        ? "text-[#654321]"
                        : "text-gray-700 group-hover:text-[#654321]"
                    }`}
                  >
                    {link.name}
                    <span
                      className={`absolute left-0 -bottom-1 h-0.5 bg-[#654321] transition-all duration-300 ${
                        isActive(link.href)
                          ? "w-full"
                          : "w-0 group-hover:w-full"
                      }`}
                    ></span>
                  </Link>
                </li>
              )
            )}
          </ul>

          {/* ICONS */}
          <div className="hidden md:flex space-x-7 text-[#654321]">
            <Link href="/profile">{Icon.profile}</Link>
            <Link href="/wishlist">{Icon.wishlist}</Link>
            <Link href="/cart" className="relative">
              {Icon.cart}
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] px-1.5 py-[1px] rounded-full">
                3
              </span>
            </Link>
          </div>

          {/* MOBILE BUTTON */}
          <button
            className="md:hidden text-[#654321]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <svg width="26" height="26" stroke="currentColor" fill="none">
                <path d="M6 6l14 14M6 20L20 6" strokeWidth="2" />
              </svg>
            ) : (
              <svg width="26" height="26" stroke="currentColor" fill="none">
                <path d="M4 7h18M4 13h18M4 19h18" strokeWidth="2" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* DESKTOP MEGA MENU */}
      <div
        ref={desktopMegaRef}
        className="absolute left-0 w-full bg-[#FFFDF8] border-t border-[#DEB887] shadow-xl overflow-hidden z-40"
      >
        <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-3 gap-10">
          {megaMenuData.map((cat, i) => (
            <div key={i}>
              <h3 className="text-lg font-bold text-[#654321] mb-4 uppercase">
                {cat.title}
              </h3>
              <ul className="space-y-2 text-gray-700">
                {cat.sub.map((s, si) => (
                  <li key={si}>
                    <Link
                      href={`/products/${cat.title.toLowerCase()}/${s
                        .toLowerCase()
                        .replace(/ /g, "-")}`}
                      className="hover:text-[#654321] transition"
                    >
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-[#FAF0E6] border-t border-[#DEB887] shadow-xl px-6 py-4 text-[#654321]">
          {navLinks.map((link) => (
            <div key={link.name} className="mb-1">
              {link.mega ? (
                <button
                  className="w-full text-left py-2 font-semibold flex justify-between items-center"
                  onClick={() => toggleMobileMega(link.name)}
                >
                  {link.name}
                  <span>
                    {openMobileMega === link.name ? (
                      <MdKeyboardArrowUp />
                    ) : (
                      <MdKeyboardArrowDown />
                    )}
                  </span>
                </button>
              ) : (
                <Link
                  href={link.href}
                  className="block py-2 font-semibold"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.name}
                </Link>
              )}

              {/* Mobile Mega Menu */}
              <div ref={mobileMegaRef} className="overflow-hidden">
                {openMobileMega === link.name &&
                  megaMenuData.map((cat, i) => (
                    <div key={i} className="pl-4 pb-3">
                      <h3 className="font-bold text-[#654321]">{cat.title}</h3>
                      <ul className="pl-2 space-y-1">
                        {cat.sub.map((s, si) => (
                          <li key={si}>
                            <Link
                              href={`/products/${cat.title.toLowerCase()}/${s
                                .toLowerCase()
                                .replace(/ /g, "-")}`}
                              className="block py-1 hover:text-[#654321]"
                              onClick={() => setMobileOpen(false)}
                            >
                              {s}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NavBar;
