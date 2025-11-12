"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { InventoryItem } from "@/types/inventory"

export default function InventoryTable({
  items,
  searchTerm,
  onSearchChange,
  onDeleteItem,
  onClearAll,
  onExportCSV,
}: {
  items: InventoryItem[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onDeleteItem: (id: string) => void
  onClearAll: () => void
  onExportCSV: () => void
}) {
  const getRowColor = (daysRemaining: number) => {
    if (daysRemaining <= 21) return "#fee2e2" // Red - urgent
    if (daysRemaining <= 30) return "#fce7f3" // Pink - soon
    if (daysRemaining <= 60) return "#fef3c7" // Yellow - moderate
    return "#dcfce7" // Green - safe
  }

  const getStatusBadge = (daysRemaining: number) => {
    if (daysRemaining <= 21) return { label: "🔴 CRÍTICO", color: "text-red-700", bg: "bg-red-100" }
    if (daysRemaining <= 30) return { label: "🌸 PRÓXIMO", color: "text-pink-700", bg: "bg-pink-100" }
    if (daysRemaining <= 60) return { label: "🟨 MODERADO", color: "text-amber-700", bg: "bg-amber-100" }
    return { label: "🟩 NORMAL", color: "text-green-700", bg: "bg-green-100" }
  }

  const sortedItems = [...items].sort((a, b) => a.daysRemaining - b.daysRemaining)

  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-3 flex-col sm:flex-row">
        <div className="flex-1 w-full">
          <Input
            type="text"
            placeholder="🔍 Buscar por producto..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="border-slate-300 focus:ring-orange-400 focus:border-orange-400"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={onExportCSV}
            variant="outline"
            className="flex-1 sm:flex-initial bg-transparent"
            disabled={items.length === 0}
          >
            📥 Exportar CSV
          </Button>
          <Button
            onClick={onClearAll}
            variant="destructive"
            className="flex-1 sm:flex-initial"
            disabled={items.length === 0}
          >
            🗑️ Limpiar
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg">No hay productos aún.</p>
          <p className="text-sm">Agrega productos usando el formulario superior.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50">
                <th className="text-left p-3 font-semibold text-slate-700">Producto</th>
                <th className="text-center p-3 font-semibold text-slate-700">Cantidad</th>
                <th className="text-center p-3 font-semibold text-slate-700">Vencimiento</th>
                <th className="text-center p-3 font-semibold text-slate-700">Días</th>
                <th className="text-center p-3 font-semibold text-slate-700">Estado</th>
                <th className="text-center p-3 font-semibold text-slate-700">Acción</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => {
                const status = getStatusBadge(item.daysRemaining)
                const rowColor = getRowColor(item.daysRemaining)
                const isUrgent = item.daysRemaining <= 15
                return (
                  <tr
                    key={item.id}
                    className={`border-b border-slate-200 transition-colors hover:opacity-80 ${
                      isUrgent ? "animate-pulse" : ""
                    }`}
                    style={{
                      backgroundColor: rowColor,
                      borderLeft: isUrgent ? "4px solid #dc2626" : "4px solid transparent",
                    }}
                  >
                    <td className="p-3 font-medium text-slate-900">{item.productName}</td>
                    <td className="p-3 text-center text-slate-700">
                      {item.totalQuantity.toLocaleString("es-AR")} unidades
                    </td>
                    <td className="p-3 text-center text-slate-700">
                      {new Date(item.expiryDate).toLocaleDateString("es-AR")}
                    </td>
                    <td className="p-3 text-center font-semibold text-slate-900">{item.daysRemaining}d</td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-800 font-semibold text-sm"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {items.length > 0 && (
        <div className="pt-4 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
          <div className="p-2 bg-red-50 rounded">
            <p className="text-red-700 font-semibold">🔴 Crítico</p>
            <p className="text-red-600 text-xs">≤ 3 semanas</p>
          </div>
          <div className="p-2 bg-pink-50 rounded">
            <p className="text-pink-700 font-semibold">🌸 Próximo</p>
            <p className="text-pink-600 text-xs">1 mes</p>
          </div>
          <div className="p-2 bg-amber-50 rounded">
            <p className="text-amber-700 font-semibold">🟨 Moderado</p>
            <p className="text-amber-600 text-xs">2 meses</p>
          </div>
          <div className="p-2 bg-green-50 rounded">
            <p className="text-green-700 font-semibold">🟩 Normal</p>
            <p className="text-green-600 text-xs">3+ meses</p>
          </div>
        </div>
      )}
    </div>
  )
}
