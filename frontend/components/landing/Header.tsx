"use client";
import Link from "next/link";
import { BarChart2, Phone, Smartphone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import logo from "@/public/images/simupos-primary.png";
// import { DownloadButton } from "../DownloadButton";;
export function Header() {
  const navLinks = [
    {
      name: "Features",
      href: "#features",
      icon: <Smartphone className="h-4 w-4" />,
    },
    {
      name: "Pricing",
      href: "#pricing",
      icon: <BarChart2 className="h-4 w-4" />,
    },
    {
      name: "Business Types",
      href: "#business-types",
      icon: <Users className="h-4 w-4" />,
    },
    { name: "Contact", href: "#contact", icon: <Phone className="h-4 w-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur px-4">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-32 h-10">
            {" "}
            {/* Container for image */}
            <Image
              src={logo}
              alt="SimuPOS Logo"
              fill // Makes image fill container
              style={{ objectFit: "contain" }} // Maintain aspect ratio
              priority // Preload important image
            />
          </div>
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Button
              key={link.name}
              asChild
              variant="ghost"
              className="text-gray-700 hover:text-[#41A5A5]"
            >
              <Link href={link.href}>
                {link.icon}
                <span className="ml-2">{link.name}</span>
              </Link>
            </Button>
          ))}
        </nav>

        {/* Get Started Button */}
        {/* Download Button - Visible on all screens */}
        {/* <DownloadButton /> */}
        <Link href="/auth/login">
          <Button className="bg-[#41A5A5] hover:bg-[#2E8B8B] text-white">
            Get Started
          </Button>
        </Link>
      </div>
    </header>
  );
}
