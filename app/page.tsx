"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowRightIcon,
  Users2Icon,
  BarChart3Icon,
  BrainCircuitIcon,
  UserPlusIcon,
  CheckCircle2,
  Sparkles,
} from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Demo by SCCret Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 text-center font-medium">
        Demo by SCCret
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/abstract-digital-network-purple.png')] bg-cover bg-center opacity-5 z-0"></div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center space-y-8"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="mb-4">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/banpu-ZHnhto7UWbwdZW4pIEXDDNaPHBbi6r.png"
                alt="Banpu Logo"
                width={180}
                height={40}
                className="mx-auto mb-6"
              />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 text-transparent bg-clip-text">
                Made for <span className="text-purple-600">teams</span>,<br />
                designed to <span className="text-indigo-600">excel</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                สร้างทีมที่มีประสิทธิภาพสูงด้วยการจับคู่ทักษะและบุคลิกภาพที่เหมาะสมด้วย AI เพื่อการตัดสินใจที่ชาญฉลาดและผลลัพธ์ที่ยอดเยี่ยม
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/skill-matching">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all duration-300 px-8 py-6 text-lg rounded-full"
                >
                  เริ่มต้นใช้งาน
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="text-sm text-gray-500 mt-4">ไม่ต้องใช้บัตรเครดิต + ใช้งานได้ไม่จำกัดในแผนฟรี</div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <div className="container mx-auto px-4 pb-16">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-gray-600">พนักงาน</div>
            </motion.div>
            <motion.div variants={fadeIn} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-indigo-600 mb-2">95%</div>
              <div className="text-gray-600">ความแม่นยำ</div>
            </motion.div>
            <motion.div variants={fadeIn} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-gray-600">ทีมที่สร้าง</div>
            </motion.div>
            <motion.div variants={fadeIn} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-indigo-600 mb-2">30%</div>
              <div className="text-gray-600">เพิ่มประสิทธิภาพ</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center gap-2 mb-4 bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">คุณสมบัติหลัก</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">คุณต้องการจัดการอะไร?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              แพลตฟอร์มของเราช่วยให้คุณสร้างทีมที่มีประสิทธิภาพสูงโดยใช้ AI เพื่อจับคู่ทักษะและบุคลิกภาพที่เหมาะสม
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link href="/skill-matching">
              <Card className="border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 cursor-pointer h-full group overflow-hidden rounded-xl">
                <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="mb-4 text-purple-600 bg-purple-100 p-3 rounded-full group-hover:bg-purple-200 transition-colors">
                    <BrainCircuitIcon className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-700 transition-colors">
                    AI Skill Matching
                  </h3>
                  <p className="text-gray-600 text-sm">ใช้ AI เพื่อวิเคราะห์และจับคู่ทักษะที่เหมาะสมสำหรับโครงการของคุณ</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/team-builder">
              <Card className="border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 cursor-pointer h-full group overflow-hidden rounded-xl">
                <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="mb-4 text-purple-600 bg-purple-100 p-3 rounded-full group-hover:bg-purple-200 transition-colors">
                    <Users2Icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-700 transition-colors">
                    Team Builder
                  </h3>
                  <p className="text-gray-600 text-sm">สร้างทีมที่มีประสิทธิภาพสูงด้วยการเลือกสมาชิกที่เหมาะสมตามคำแนะนำของ AI</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/teams">
              <Card className="border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 cursor-pointer h-full group overflow-hidden rounded-xl">
                <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="mb-4 text-purple-600 bg-purple-100 p-3 rounded-full group-hover:bg-purple-200 transition-colors">
                    <BarChart3Icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-700 transition-colors">
                    Team Analytics
                  </h3>
                  <p className="text-gray-600 text-sm">วิเคราะห์องค์ประกอบของทีมและประสิทธิภาพด้วยแดชบอร์ดที่ครอบคลุม</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/banpu-intelligence">
              <Card className="border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 cursor-pointer h-full group overflow-hidden rounded-xl">
                <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="mb-4 text-purple-600 bg-purple-100 p-3 rounded-full group-hover:bg-purple-200 transition-colors">
                    <BrainCircuitIcon className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-700 transition-colors">
                    Banpu Intelligence
                  </h3>
                  <p className="text-gray-600 text-sm">ใช้ AI เพื่อค้นหาข้อมูลเชิงลึกเกี่ยวกับพนักงานและทีมของบ้านปู</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/skill-matching">
              <Card className="border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 cursor-pointer h-full group overflow-hidden rounded-xl">
                <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="mb-4 text-purple-600 bg-purple-100 p-3 rounded-full group-hover:bg-purple-200 transition-colors">
                    <UserPlusIcon className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-700 transition-colors">
                    Employee Profiles
                  </h3>
                  <p className="text-gray-600 text-sm">ดูข้อมูลโปรไฟล์พนักงานพร้อมทักษะและบุคลิกภาพโดยละเอียด</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/teams">
              <Card className="border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 cursor-pointer h-full group overflow-hidden rounded-xl">
                <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="mb-4 text-purple-600 bg-purple-100 p-3 rounded-full group-hover:bg-purple-200 transition-colors">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-700 transition-colors">
                    Team Projects
                  </h3>
                  <p className="text-gray-600 text-sm">จัดการโครงการและติดตามความคืบหน้าของทีมที่คุณสร้างขึ้น</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image src="/abstract-digital-network-purple.png" alt="Background Pattern" fill className="object-cover" />
        </div>
        <motion.div
          className="container mx-auto px-4 text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-6">พร้อมที่จะสร้างทีมที่มีประสิทธิภาพสูงหรือยัง?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">เริ่มต้นใช้งานแพลตฟอร์มของเราวันนี้และสร้างทีมที่มีประสิทธิภาพสูงด้วย AI</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/skill-matching">
              <Button
                size="lg"
                className="bg-white text-purple-700 hover:bg-purple-50 shadow-lg transition-all duration-300 hover:shadow-xl px-8 py-6 text-lg rounded-full"
              >
                <BrainCircuitIcon className="mr-2 h-5 w-5" />
                เริ่มต้นใช้งานฟรี
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
