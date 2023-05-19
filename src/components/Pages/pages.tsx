import React, { useEffect, useState } from 'react'
import { Pagination } from 'antd'
import './pages.css'

interface I_pages {
  currentPage: number
  totalPages: number
  setCurrentPage: (page: number) => void
  moviesDataLength: number
  uploadStateLoading: boolean
}

export function Pages({ currentPage, totalPages, setCurrentPage, moviesDataLength, uploadStateLoading }: I_pages) {
  const [showPagination, setShowPagination] = useState<string>('')

  useEffect(() => {
    moviesDataLength === 0 || uploadStateLoading === true ? setShowPagination('hidden') : setShowPagination('')
  }, [moviesDataLength, uploadStateLoading])

  function changePage(page: number) {
    setCurrentPage(page)
  }

  return (
    <div className="pagination-wrapper">
      <Pagination
        defaultCurrent={1}
        current={currentPage}
        total={totalPages >= 10 ? 100 : totalPages * 10}
        showSizeChanger={false}
        onChange={(page) => changePage(page)}
        className={showPagination}
      />
    </div>
  )
}
