'use client'

import { useState } from 'react'

export default function PrevisionsInput({ defaultValue = [] }: { defaultValue?: string[] }) {
  const [items, setItems] = useState<string[]>(
    defaultValue.length > 0 ? defaultValue : ['']
  )

  function add() {
    setItems([...items, ''])
  }

  function remove(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function update(index: number, value: string) {
    const updated = [...items]
    updated[index] = value
    setItems(updated)
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name="previsions" value={JSON.stringify(items)} />
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Prévision..."
            value={item}
            onChange={e => update(i, e.target.value)}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="btn btn-danger btn-sm"
          >
            &times;
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="btn btn-ghost btn-sm">
        + Ajouter
      </button>
    </div>
  )
}
