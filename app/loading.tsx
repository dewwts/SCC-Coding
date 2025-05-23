export default function Loading() {
  return (
    <div className="container mx-auto py-16 px-4 flex flex-col items-center">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  )
}
