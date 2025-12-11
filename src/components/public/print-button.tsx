'use client'

import { Button } from '@/components/ui/button'

export function PrintButton() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <Button
      onClick={handlePrint}
      variant="outline"
      className="w-full border-brand-green text-brand-green hover:bg-brand-light h-12 rounded-xl font-semibold"
    >
      <i className="fa-solid fa-print mr-2"></i>
      Print Confirmation
    </Button>
  )
}

