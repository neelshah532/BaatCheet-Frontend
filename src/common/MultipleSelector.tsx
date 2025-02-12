import React, { useState } from 'react'
import { IoClose } from 'react-icons/io5'
import { ContactOption } from '../types'

interface MultipleSelectorProps {
  className?: string
  defaultOption: ContactOption[]
  placeholder?: string
  value: ContactOption[]
  onChange: (selected: ContactOption[]) => void
  emptyIndicator?: React.ReactNode
}

const MultipleSelector: React.FC<MultipleSelectorProps> = ({
  className = '',
  defaultOption,
  placeholder = 'Search contacts...',
  value,
  onChange,
  emptyIndicator = <p className="text-center text-gray-500">No contacts found</p>,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<ContactOption[]>(value)
  const [searchTerm, setSearchTerm] = useState<string>('')

  const handleSelect = (option: ContactOption) => {
    if (!selectedOptions.some((item) => item.value === option.value)) {
      const updatedOptions = [...selectedOptions, option]
      setSelectedOptions(updatedOptions)
      onChange(updatedOptions)
    }
  }

  const handleRemove = (option: ContactOption) => {
    const updatedOptions = selectedOptions.filter((item) => item.value !== option.value)
    setSelectedOptions(updatedOptions)
    onChange(updatedOptions)
  }

  const filteredOptions = defaultOption.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className={`relative ${className}`}>
      {/* Selected Contacts Display */}
      <div className="w-full bg-[#1C1C24] p-3 rounded-lg border border-white/[0.05] text-white flex flex-wrap gap-2 min-h-[50px]">
        {selectedOptions.map((option) => (
          <div key={option.value} className="flex items-center bg-gray-700 px-3 py-1 rounded-md text-sm">
            {option.label}
            <IoClose className="ml-2 cursor-pointer" onClick={() => handleRemove(option)} />
          </div>
        ))}
        <input type="text" placeholder={placeholder} className="bg-transparent outline-none text-white flex-1" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {/* Contact List Dropdown */}
      {searchTerm && (
        <div className="absolute w-full bg-[#1C1C24] mt-2 rounded-lg border border-white/[0.05] max-h-48 overflow-y-auto z-10">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div key={option.value} className="p-3 hover:bg-gray-700 cursor-pointer text-white" onClick={() => handleSelect(option)}>
                {option.label}
              </div>
            ))
          ) : (
            <div className="p-3 text-gray-500">{emptyIndicator}</div>
          )}
        </div>
      )}
    </div>
  )
}

export default MultipleSelector
