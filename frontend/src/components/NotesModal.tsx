import React, { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'

interface NotesModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (notes: string) => void
  initialNotes: string
}

const NotesModal: React.FC<NotesModalProps> = ({ isOpen, onClose, onSave, initialNotes }) => {
  const [notes, setNotes] = useState(initialNotes)

  useEffect(() => {
    setNotes(initialNotes)
  }, [initialNotes])

  const handleSave = () => {
    onSave(notes)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-dark-card rounded-xl p-6 max-w-2xl w-full border border-dark-border shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">הערות ובקשות</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-hover rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full h-64 bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          placeholder="הכנס הערות או בקשות..."
          autoFocus
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            שמור וסגור
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-dark-hover hover:bg-dark-border text-gray-300 rounded-lg font-medium transition-colors"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotesModal

