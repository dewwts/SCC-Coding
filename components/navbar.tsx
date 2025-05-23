"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MenuIcon } from "lucide-react"
import Image from "next/image"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-8 w-28">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/banpu-ZHnhto7UWbwdZW4pIEXDDNaPHBbi6r.png"
                alt="Banpu Logo"
                fill
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>หน้าหลัก</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/skill-matching" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>AI Skill Matching</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/team-builder" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>Team Builder</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/teams" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>Teams</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/banpu-intelligence" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>Banpu Intelligence</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Banpu Team Matching</SheetTitle>
              <SheetDescription>AI-Powered Team Matching Platform</SheetDescription>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-8">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100"
              >
                <span>หน้าหลัก</span>
              </Link>
              <Link
                href="/skill-matching"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100"
              >
                <span>AI Skill Matching</span>
              </Link>
              <Link
                href="/team-builder"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100"
              >
                <span>Team Builder</span>
              </Link>
              <Link
                href="/teams"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100"
              >
                <span>Teams</span>
              </Link>
              <Link
                href="/banpu-intelligence"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100"
              >
                <span>Banpu Intelligence</span>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
