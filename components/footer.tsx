import Link from "next/link"
import { BrainCircuitIcon, Users2Icon, UserPlusIcon, GithubIcon, TwitterIcon, LinkedinIcon } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Banpu Team Matching</h3>
            <p className="text-sm text-gray-600">AI-Powered Team Matching Platform สำหรับการสร้างทีมที่มีประสิทธิภาพสูงด้วย AI</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-purple-600">
                <GithubIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-purple-600">
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-purple-600">
                <LinkedinIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/skill-matching" className="text-gray-600 hover:text-purple-600 text-sm flex items-center">
                  <BrainCircuitIcon className="h-4 w-4 mr-2" />
                  AI Skill Matching
                </Link>
              </li>
              <li>
                <Link href="/team-builder" className="text-gray-600 hover:text-purple-600 text-sm flex items-center">
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  Team Builder
                </Link>
              </li>
              <li>
                <Link href="/teams" className="text-gray-600 hover:text-purple-600 text-sm flex items-center">
                  <Users2Icon className="h-4 w-4 mr-2" />
                  Teams
                </Link>
              </li>
              <li>
                <Link
                  href="/banpu-intelligence"
                  className="text-gray-600 hover:text-purple-600 text-sm flex items-center"
                >
                  <BrainCircuitIcon className="h-4 w-4 mr-2" />
                  Banpu Intelligence
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-600 hover:text-purple-600 text-sm">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-purple-600 text-sm">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-purple-600 text-sm">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-600 hover:text-purple-600 text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-purple-600 text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-purple-600 text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Banpu Team Matching. All rights reserved.
          </p>
          <p className="text-sm text-gray-600 mt-2 md:mt-0">Demo by SCCret</p>
        </div>
      </div>
    </footer>
  )
}
