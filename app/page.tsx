"use client"

import { useState, useEffect } from "react"
import InventoryHeader from "@/components/inventory-header"
import DataInput from "@/components/data-input"
import InventoryTable from "@/components/inventory-table"
import type { InventoryItem } from "@/types/inventory"

export default function Home() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  // Load items from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem("inventoryItems")
    if (savedItems) {
      const parsed = JSON.parse(savedItems)
      setItems(parsed)
      setFilteredItems(parsed)
    }
  }, [])

  // Save items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("inventoryItems", JSON.stringify(items))
  }, [items])

  // Filter items based on search term
  useEffect(() => {
    const filtered = items.filter((item) => item.productName.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredItems(filtered)
  }, [searchTerm, items])

  const handleAddItems = (newItems: InventoryItem[]) => {
    const combined = [...items, ...newItems]
    setItems(combined)
  }

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleClearAll = () => {
    if (window.confirm("¿Estás seguro de que deseas limpiar toda la lista?")) {
      setItems([])
    }
  }

  const handleExportCSV = () => {
    if (filteredItems.length === 0) {
      alert("No hay datos para exportar")
      return
    }

    const headers = ["Producto", "Cantidad Total", "Vencimiento", "Días Restantes", "Estado"]
    const rows = filteredItems.map((item) => [
      item.productName,
      item.totalQuantity,
      new Date(item.expiryDate).toLocaleDateString("es-AR"),
      item.daysRemaining,
      getStatusLabel(item.daysRemaining),
    ])

    const csv = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `inventario-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <InventoryHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <DataInput onAddItems={handleAddItems} />
          <InventoryTable
            items={filteredItems}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onDeleteItem={handleDeleteItem}
            onClearAll={handleClearAll}
            onExportCSV={handleExportCSV}
          />
        </div>
      </main>
    </div>
  )
}

function getStatusLabel(daysRemaining: number): string {
  if (daysRemaining <= 21) return "Crítico"
  if (daysRemaining <= 30) return "Próximo"
  if (daysRemaining <= 60) return "Moderado"
  return "Normal"
}
