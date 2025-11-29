"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { CgClose, CgMenu } from "react-icons/cg";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import {
  FiSearch,
  FiUser,
  FiHeart,
  FiShoppingBag,
  FiLogIn,
} from "react-icons/fi";

// --- Color Palette ---
const PALETTE = {
  BG_LIGHT: "bg-[#FAF0E6]", // Light Beige
  BORDER_ACCENT: "border-[#DEB887]", // Tan/Brown Border
  TEXT_PRIMARY: "text-[#654321]", // Dark Brown Text/Accent
  HOVER_ACCENT: "hover:text-[#654321]",
  ACCENT_BG: "bg-[#654321]", // Dark Brown BG
  ACCENT_HOVER_BG: "hover:bg-[#DEB887]",
  OVERLAY: "bg-[#4E342E]", // Darker Brown for overlay
  LOGO_TEXT: "font-serif text-[#654321] tracking-wide",
};

// --- Data Structure (SIMPLIFIED FOR MEN'S ONLY) ---
const navLinks = [
  { name: "Men", href: "/men", mega: true }, // Retained: Men's Menu
  { name: "New Arrivals", href: "/new-arrivals" }, // Retained
  { name: "Best Sellers", href: "/best-sellers" }, // Retained
  { name: "About Us", href: "/about-us" }, // Retained
  { name: "Contact Us", href: "/contact-us" }, // Retained
];

// Utility links are now empty as the necessary links are in navLinks
const sidebarUtilityLinks = [];

// Image categories for the mega menu (Adjusted for Men's focus)
const imageCategories = [
  { title: "SALE", img: "/assets/bf-sale.jpg", link: "/sale" },
  { title: "T-Shirts", img: "/assets/all-topwear.jpg", link: "/topwear" },
  { title: "Bottomwear", img: "/assets/all-bottoms.jpg", link: "/bottoms" },
  { title: "Sneakers", img: "/assets/member-vault.jpg", link: "/sneakers" },
];

const sidebarMegaData = {
  Men: [
    {
      title: "Topwear",
      subs: ["All T-Shirts", "Oversized T-Shirts", "Sajana", "Shirts"],
    },
    {
      title: "Bottomwear",
      subs: ["Pants", "Jeans", "Joggers", "Shorts & Boxers"],
    },
    {
      title: "Accessories",
      subs: ["Backpacks", "Perfumes", "Socks", "Caps", "Shoe Laces"],
    },
    // Adding a general link group as placeholder for other main sections
    {
      title: "General",
      subs: ["New Arrivals", "Best Sellers"],
    },
  ],
};

const Icon = {
  cart: <FiShoppingBag className="w-6 h-6" />,
};

// Placeholder image path
const placeholderImage = "/assets/placeholder.jpg";

const NavBar = () => {
  const pathname = usePathname();
  // Check if current path matches link href
  const isActive = (href) => pathname === href;

  // State for the main sidebar (hamburger menu) open/close
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // *** CHANGE: Set 'Men' as the initial open mega menu ***
  const [openMegaMenu, setOpenMegaMenu] = useState("Men");

  // Toggle the main sidebar and control body scrolling
  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    document.body.style.overflow = newState ? "hidden" : "auto";
  };

  // Toggle the mega menu section (Men)
  const toggleMegaMenu = (menuName) => {
    // If the menu is already open, close it (set to null), otherwise open it
    setOpenMegaMenu(openMegaMenu === menuName ? null : menuName);
  };

  // Close everything when a link is clicked
  const handleLinkClick = () => {
    setIsSidebarOpen(false);
    // Closing it here is standard UX for mobile navigation:
    // setOpenMegaMenu(null);
    document.body.style.overflow = "auto";
  };

  // --- Component for rendering Sidebar Links/Mega Menu ---
  const SidebarContent = ({ link }) => {
    const isMega = link.mega;
    const isCurrentlyOpen = openMegaMenu === link.name;
    const data = sidebarMegaData[link.name];

    if (isMega) {
      return (
        <div key={link.name} className={`border-b ${PALETTE.BORDER_ACCENT}`}>
          <button
            className={`w-full text-left py-4 px-4 font-bold flex justify-between items-center text-lg ${PALETTE.TEXT_PRIMARY} ${PALETTE.HOVER_ACCENT}`}
            onClick={() => toggleMegaMenu(link.name)}
          >
            {link.name}
            <span className="text-xl text-gray-700">
              {isCurrentlyOpen ? (
                <MdKeyboardArrowUp />
              ) : (
                <MdKeyboardArrowDown />
              )}
            </span>
          </button>

          {/* *** CHANGE APPLIED HERE: Added 'overflow-y-auto' to enable scrolling within the mega menu content. *** */}
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isCurrentlyOpen
                ? "max-h-[calc(100vh-160px)] opacity-100 overflow-y-auto" // Use calc(100vh - header_height) for better max-height definition
                : "max-h-0 opacity-0"
            }`}
          >
            {/* The core 'Men' sidebar content */}
            {isMega && data && (
              <div className="p-4 space-y-4">
                {/* Top Row: Featured Collections (Image Grid) */}
                <h3
                  className={`text-xs font-semibold uppercase ${PALETTE.TEXT_PRIMARY} mb-2`}
                >
                  FEATURED COLLECTIONS
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {imageCategories.map((item, i) => (
                    <Link
                      href={item.link}
                      key={i}
                      className={`flex flex-col items-center text-center text-xs font-medium ${PALETTE.HOVER_ACCENT}`}
                      onClick={handleLinkClick}
                    >
                      <div className="w-full aspect-square overflow-hidden rounded-full border border-gray-100 mb-1">
                        <Image
                          src={placeholderImage}
                          alt={item.title}
                          width={60}
                          height={60}
                          className="object-cover"
                        />
                      </div>
                      {item.title.split(" ")[0]}
                    </Link>
                  ))}
                </div>

                {/* Categories Section (Simplified Grid) */}
                <h3
                  className={`text-xs font-semibold uppercase ${PALETTE.TEXT_PRIMARY} pt-4 mb-2`}
                >
                  Top Categories
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {data
                    .flatMap((d) => d.subs)
                    .slice(0, 8)
                    .map((subName, i) => (
                      <Link
                        href={`/products/${link.name.toLowerCase()}/${subName
                          .toLowerCase()
                          .replace(/ /g, "-")}`}
                        key={i}
                        className={`flex flex-col items-center text-center text-xs font-medium ${PALETTE.HOVER_ACCENT}`}
                        onClick={handleLinkClick}
                      >
                        <div className="w-full aspect-square overflow-hidden rounded-lg border border-gray-100 mb-1">
                          <Image
                            src={placeholderImage}
                            alt={subName}
                            width={60}
                            height={60}
                            className="object-cover"
                          />
                        </div>
                        {subName.split(" ")[0]}
                      </Link>
                    ))}
                </div>

                {/* Detailed Category Links */}
                {data.map((cat, i) => (
                  <div key={i} className="pt-2">
                    <h4
                      className={`text-sm font-bold ${PALETTE.TEXT_PRIMARY} mb-2`}
                    >
                      {cat.title}
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700 pl-2">
                      {cat.subs.map((s, si) => (
                        <li key={si}>
                          <Link
                            href={`/products/${link.name.toLowerCase()}/${s
                              .toLowerCase()
                              .replace(/ /g, "-")}`}
                            className={`block py-1 ${PALETTE.HOVER_ACCENT}`}
                            onClick={handleLinkClick}
                          >
                            {s}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Regular link
    return (
      <Link
        key={link.name}
        href={link.href}
        className={`block py-4 px-4 font-bold text-lg ${PALETTE.TEXT_PRIMARY} ${PALETTE.HOVER_ACCENT} border-b ${PALETTE.BORDER_ACCENT}`}
        onClick={handleLinkClick}
      >
        {link.name}
      </Link>
    );
  };

  return (
    <header
      className={`sticky top-0 w-full z-50 ${PALETTE.BG_LIGHT} shadow-md`}
    >
      {/* Top Bar (Hamburger/Logo/Search/Icons) */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* LEFT SIDE: HAMBURGER & MAIN CATEGORIES */}
        <div className="flex items-center space-x-6">
          {/* 1. HAMBURGER BUTTON */}
          <button
            className={`${PALETTE.TEXT_PRIMARY} ${PALETTE.HOVER_ACCENT}`}
            onClick={toggleSidebar}
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? (
              <CgClose className="w-6 h-6" />
            ) : (
              <CgMenu className="w-6 h-6" />
            )}
          </button>

          {/* 2. MAIN CATEGORY LINKS (Desktop only - Regular links only) */}
          <ul
            className={`hidden lg:flex space-x-6 text-sm font-semibold uppercase ${PALETTE.TEXT_PRIMARY} h-full`}
          >
            {navLinks
              .filter((link) => !link.mega)
              .map((link) => (
                <li key={link.name} className="relative group">
                  <Link
                    href={link.href}
                    className={`relative py-1 transition-colors ${
                      PALETTE.HOVER_ACCENT
                    } ${
                      isActive(link.href)
                        ? PALETTE.TEXT_PRIMARY
                        : "text-gray-700"
                    }`}
                  >
                    {link.name}
                    {/* Underline Indicator */}
                    <span
                      className={`absolute left-0 -bottom-1 h-0.5 ${
                        PALETTE.ACCENT_BG
                      } transition-all duration-300 ${
                        isActive(link.href)
                          ? "w-full"
                          : "w-0 group-hover:w-full"
                      }`}
                    ></span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>

        {/* CENTER: LOGO */}
        <Link href="/" className="absolute left-1/2 transform -translate-x-1/2">
          <Image
            src={"/assets/logo.png"}
            alt="Brand Logo"
            width={60}
            height={60}
          />
        </Link>

        {/* RIGHT SIDE: SEARCH & ICONS */}
        <div className="flex items-center space-x-4">
          {/* Search Input (Desktop/Large Screen) */}
          <div className="hidden sm:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Men's..."
                className={`w-48 lg:w-64 xl:w-80 h-10 border ${PALETTE.BORDER_ACCENT} rounded-full pl-4 pr-10 text-sm focus:ring-[#DEB887] focus:border-[#DEB887] ${PALETTE.BG_LIGHT}`}
              />
              <button
                className={`absolute right-0 top-0 mt-2 mr-3 text-gray-600 ${PALETTE.HOVER_ACCENT}`}
                aria-label="Search"
              >
                <FiSearch className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Icons (User link changed to login as requested) */}
          <Link
            href="/login"
            className={`hidden sm:block ${PALETTE.TEXT_PRIMARY} ${PALETTE.HOVER_ACCENT} transition-colors`}
            aria-label="Login/Profile"
          >
            <FiUser className="w-6 h-6" />
          </Link>
          <Link
            href="/wishlist"
            className={`hidden sm:block ${PALETTE.TEXT_PRIMARY} ${PALETTE.HOVER_ACCENT} transition-colors`}
          >
            <FiHeart className="w-6 h-6" />
          </Link>
          <Link
            href="/cart"
            className={`relative ${PALETTE.TEXT_PRIMARY} ${PALETTE.HOVER_ACCENT} transition-colors`}
          >
            {Icon.cart}
            {/* Cart Badge with Accent Color */}
            <span
              className={`absolute -top-1.5 -right-2 ${PALETTE.ACCENT_BG} text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold`}
            >
              3
            </span>
          </Link>
          {/* Search icon for Mobile */}
          <button
            className={`sm:hidden ${PALETTE.TEXT_PRIMARY} ${PALETTE.HOVER_ACCENT}`}
            aria-label="Search"
          >
            <FiSearch className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* --- SLIDING SIDEBAR DRAWER --- */}

      {/* 1. Overlay */}
      <div
        className={`fixed inset-0 ${PALETTE.OVERLAY} transition-opacity z-40 ${
          isSidebarOpen ? "opacity-40" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      ></div>

      {/* 2. Sidebar Content Panel */}
      <div
        className={`fixed top-0 left-0 w-80 sm:w-96 h-full ${
          PALETTE.BG_LIGHT
        } shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Header Section (Log in/Register) */}
        <div className={`${PALETTE.ACCENT_BG} text-white p-4`}>
          <Link
            href="/login"
            className={`flex items-center justify-between bg-white ${PALETTE.TEXT_PRIMARY} py-2 px-3 rounded-md mb-2 font-bold hover:bg-gray-100 transition`}
            onClick={handleLinkClick}
          >
            <span>Log in/Register</span>
            <FiLogIn className="w-5 h-5" />
          </Link>
          <p className="text-sm font-medium text-center">
            Shop the exclusive Men's Collection
            <span className="ml-1 text-yellow-300">🔥</span>
          </p>
        </div>

        {/* Main Navigation Links (Men's Mega Menu + Regular Links) */}
        <div className="py-2">
          {navLinks.map((link) => (
            <SidebarContent key={link.name} link={link} />
          ))}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
