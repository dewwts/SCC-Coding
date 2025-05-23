"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SendIcon, BrainCircuitIcon, UserIcon, Bot, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function BanpuIntelligencePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "สวัสดีครับ ผมคือ Banpu Intelligence ผมสามารถช่วยคุณค้นหาข้อมูลเชิงลึกเกี่ยวกับพนักงานและทีมต่างๆ ของบ้านปูได้ คุณต้องการทราบอะไรเกี่ยวกับพนักงาน ทีม ทักษะ หรือบุคลิกภาพของบุคลากรในองค์กรครับ?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // ส่งคำถามไปยัง API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages.slice(-3), // ส่งเฉพาะ 3 ข้อความล่าสุดเพื่อลดขนาด
            {
              role: "user",
              content: input,
            },
          ],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API Error:", errorData)
        throw new Error(`API returned status: ${response.status}. ${errorData.details || ""}`)
      }

      const data = await response.json()

      // สร้างข้อความตอบกลับจาก AI
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.text || "ขออภัย ฉันไม่สามารถประมวลผลคำตอบได้ในขณะนี้",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error generating response:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถเชื่อมต่อกับ AI ได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })

      // Fallback response
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "ขออภัยครับ ระบบมีปัญหาในการประมวลผลคำตอบ กรุณาลองใหม่อีกครั้งในภายหลัง",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, fallbackMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // คำถามแนะนำ
  const suggestedQuestions = [
    "ทักษะอะไรที่พบมากที่สุดในพนักงานบ้านปู?",
    "บุคลิกภาพแบบไหนที่พบบ่อยในทีมของบ้านปู?",
    "ทีมไหนที่มีขนาดใหญ่ที่สุดในบ้านปู?",
    "แผนกไหนที่มีพนักงานมากที่สุด?",
  ]

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full">
            <Bot className="h-5 w-5" />
            <h1 className="text-xl font-medium">Banpu Intelligence</h1>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">ค้นหาข้อมูลเชิงลึกด้วย AI</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            ระบบ AI อัจฉริยะที่ช่วยให้คุณเข้าถึงข้อมูลเชิงลึกเกี่ยวกับพนักงานและทีมของบ้านปู เพื่อการตัดสินใจที่ชาญฉลาดและมีประสิทธิภาพ
          </p>
        </div>

        <Card className="border-gray-200 shadow-lg overflow-hidden rounded-xl">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                  <AvatarImage src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Heading-3-099wtkj9SbhbMJ2k9QBpf1PuPMP4l8.png" />
                  <AvatarFallback className="bg-purple-100">
                    <BrainCircuitIcon className="h-5 w-5 text-purple-600" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">Banpu AI Assistant</h3>
                  <div className="flex items-center text-xs text-purple-100">
                    <span className="flex h-2 w-2 mr-1.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    ออนไลน์
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-6 h-[60vh] overflow-y-auto p-6 bg-white">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex items-start space-x-3 max-w-[85%] ${
                        message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      <Avatar
                        className={`${
                          message.role === "assistant"
                            ? "bg-gradient-to-r from-purple-500 to-indigo-600 border-2 border-white shadow-sm"
                            : "bg-gray-100"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <AvatarImage src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Heading-3-099wtkj9SbhbMJ2k9QBpf1PuPMP4l8.png" />
                        ) : null}
                        <AvatarFallback>
                          {message.role === "assistant" ? (
                            <BrainCircuitIcon className="h-5 w-5 text-white" />
                          ) : (
                            <UserIcon className="h-5 w-5 text-gray-600" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`rounded-2xl p-4 ${
                          message.role === "user"
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-800 border border-gray-200"
                        }`}
                      >
                        <div className="whitespace-pre-line">{message.content}</div>
                        <div
                          className={`text-xs mt-2 ${message.role === "user" ? "text-purple-200" : "text-gray-500"}`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start space-x-3 max-w-[85%]">
                      <Avatar className="bg-gradient-to-r from-purple-500 to-indigo-600 border-2 border-white shadow-sm">
                        <AvatarImage src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Heading-3-099wtkj9SbhbMJ2k9QBpf1PuPMP4l8.png" />
                        <AvatarFallback>
                          <BrainCircuitIcon className="h-5 w-5 text-white" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="rounded-2xl p-4 bg-gray-100 text-gray-800 border border-gray-200">
                        <div className="flex space-x-2">
                          <div
                            className="h-2 w-2 bg-purple-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="h-2 w-2 bg-purple-500 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="h-2 w-2 bg-purple-600 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* คำถามแนะนำ */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <p className="text-sm text-gray-500 mb-2">คำถามแนะนำ:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-600 hover:bg-purple-50 hover:border-purple-200 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 p-4 bg-white">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="พิมพ์คำถามของคุณที่นี่..."
                  className="flex-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
                  <span className="sr-only">ส่ง</span>
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500 mt-4">
          <p>
            Banpu Intelligence ใช้ข้อมูลจากฐานข้อมูลของบ้านปูเพื่อให้ข้อมูลที่ถูกต้องและเป็นประโยชน์
            <br />
            คุณสามารถถามคำถามเกี่ยวกับพนักงาน ทีม ทักษะ และบุคลิกภาพได้
          </p>
        </div>
      </div>
    </div>
  )
}
