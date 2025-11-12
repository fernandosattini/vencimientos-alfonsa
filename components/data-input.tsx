"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { InventoryItem } from "@/types/inventory"

export default function DataInput({
  onAddItems,
}: {
  onAddItems: (items: InventoryItem[]) => void
}) {
  const [textarea, setTextarea] = useState("")
  const [error, setError] = useState("")

  const parseInput = (input: string): InventoryItem[] => {
    const lines = input
      .trim()
      .split("\n")
      .filter((line) => line.trim())
    const items: InventoryItem[] = []

    for (const line of lines) {
      try {
        // Fixed regex: replaced $$ with proper parentheses $$ and $$
        const match = line.match(/(\d+)x(\d+)\s+(.+?)\s*\((\d{2})\/(\d{2})\/(\d{2})\)/)
        if (!match) {
          throw new Error(`Formato inválido: ${line}`)
        }

        const [, qty1, qty2, productName, day, month, year] = match
        const quantity1 = Number.parseInt(qty1)
        const quantity2 = Number.parseInt(qty2)
        const totalQuantity = quantity1 * quantity2

        // Parse date (assuming 2-digit year like 26 = 2026)
        const fullYear = 2000 + Number.parseInt(year)
        const expiryDate = new Date(fullYear, Number.parseInt(month) - 1, Number.parseInt(day))
        expiryDate.setHours(23, 59, 59, 999)

        const now = new Date()
        const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        items.push({
          id: `${Date.now()}-${Math.random()}`,
          quantity1,
          quantity2,
          totalQuantity,
          productName: productName.trim(),
          speed: undefined,
          expiryDate: expiryDate.toISOString(),
          daysRemaining: Math.max(0, daysRemaining),
          createdAt: new Date().toISOString(),
        })
      } catch (err) {
        setError(`Error en línea "${line}": ${err instanceof Error ? err.message : "Error desconocido"}`)
        return []
      }
    }

    return items
  }

  const handleSubmit = () => {
    setError("")

    if (!textarea.trim()) {
      setError("Por favor, pega datos en el textarea")
      return
    }

    const parsedItems = parseInput(textarea)

    if (parsedItems.length === 0) {
      return
    }

    onAddItems(parsedItems)
    setTextarea("")
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
      <h2 className="text-xl font-semibold mb-4 text-slate-900">Agregar Productos</h2>

      <div className="space-y-3 mb-4">
        <p className="text-sm text-slate-600">
          Pega líneas con el formato:{" "}
          <code className="bg-slate-100 px-2 py-1 rounded text-xs">130x24 speed 250 (02/06/26)</code>
        </p>
        <textarea
          value={textarea}
          onChange={(e) => setTextarea(e.target.value)}
          placeholder="Ejemplo:&#10;130x24 speed 250 (02/06/26)&#10;5x12 speed 473 (14/08/26)"
          className="w-full h-32 p-3 border border-slate-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
        />
      </div>

      {error && <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg">{error}</div>}

      <Button
        onClick={handleSubmit}
        className="w-full bg-orange-500 hover:bg-orange-600"
        style={{
          backgroundColor: "#e47c00",
        }}
      >
        ✨ Generar Tabla
      </Button>
    </div>
  )
}
