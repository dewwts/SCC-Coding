import SeedDatabase from "@/scripts/seed-database"

export default function SeedDatabasePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Database Seeding</h1>
      <SeedDatabase />
    </div>
  )
}
