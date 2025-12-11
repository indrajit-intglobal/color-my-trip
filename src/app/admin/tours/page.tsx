import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ToursTable } from '@/components/admin/tours-table'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function AdminToursPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tours Management</h1>
        <Link href="/admin/tours/new">
          <Button>Create New Tour</Button>
        </Link>
      </div>
      <ToursTable />
    </div>
  )
}

