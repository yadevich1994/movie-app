import React from 'react'
import { Input } from 'antd'
import './search-input.css'

interface I_search {
  inputValue: string
  setInputValue: (value: string) => void
  setCurrentPage: (page: number) => void
}

export function SearchInput({ inputValue, setInputValue, setCurrentPage }: I_search) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div className="search-input-wrapper">
      <Input
        placeholder="Type to search..."
        className="search-input"
        onChange={(e) => handleChange(e)}
        value={inputValue}
      />
    </div>
  )
}
