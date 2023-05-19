import React, { useEffect, useState } from 'react'
import { Row, Col, Spin, Alert, Tabs } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'

import { SearchInput } from '../Search-input/search-input'
import { MovieCard } from '../Movie-card/movie-card'
import { Pages } from '../Pages/pages'
import { Context } from '../Context/context'
import { MovieDB } from '../../services/movie-db/movie-db'
import { RatedTab } from '../Rated-tab/rated-tab'
import './app.css'

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('')

  const [moviesData, setMoviesData] = useState<string[][]>([])
  const [moviesGenres, setMoviesGenres] = useState<objGenres>({})

  const [inputValue, setInputValue] = useState<string>('')
  const [isFound, setIsFound] = useState<boolean>(true)

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(5)

  interface I_loading {
    loading: boolean
    error: boolean
    errorMessage?: string
  }

  interface I_movieItem {
    id: number
    title: 'string'
    release_date: 'string'
    overview: 'string'
    poster_path: 'string'
    vote_average: number
    genre_ids: number[]
  }

  interface I_movieGenre {
    id: number
    name: 'string'
  }

  type objGenres = {
    [key: number]: string
  }

  const [uploadState, setUploadState] = useState<I_loading>({ loading: true, error: false })
  const antIcon = (
    <LoadingOutlined
      style={{
        color: 'yellow',
        fontSize: 100,
      }}
      spin
    />
  )

  useEffect(() => {
    const api = new MovieDB()
    api
      .getGenres()
      .then((result) => {
        const obj: objGenres = {}
        result.genres.map((item: I_movieGenre) => {
          obj[item.id] = item.name
          return item
        })
        setMoviesGenres(obj)
      })
      .catch((e: Error) =>
        setUploadState({
          loading: false,
          error: false,
          errorMessage: ` Не удалось отправить запрос. \n ${e.toString()}`,
        })
      )
  }, [])

  useEffect(() => {
    const api = new MovieDB()
    const uploadData = () => {
      if (!uploadState.error) {
        setUploadState({ ...uploadState, loading: true })
      } else {
        setUploadState({ ...uploadState, loading: false })
      }

      api
        .sendQuery(inputValue, currentPage)
        .then((result) => {
          setTotalPages(result.total_pages)
          const array = result.results.map((item: I_movieItem): (string | number | number[])[] => {
            let id
            let title
            let releaseDate
            let overview
            let path
            let voteRating
            let genres: number[]
            ;({
              id,
              title,
              release_date: releaseDate,
              overview,
              poster_path: path,
              vote_average: voteRating,
              genre_ids: genres,
            } = item)
            return [id, title, releaseDate, overview, path, voteRating, genres]
          })

          setMoviesData(array)
          setUploadState({ loading: false, error: false })

          array.length === 0 ? setIsFound(false) : setIsFound(true)
          inputValue === '' && setIsFound(true)
        })
        .catch((e: Error) =>
          setUploadState({
            loading: false,
            error: true,
            errorMessage: ` Не удалось отправить запрос. \n ${e.toString()}`,
          })
        )
    }

    const debouncing = debounce(uploadData, 500)
    debouncing()
    return () => debouncing.cancel()
    // eslint-disable-next-line
  }, [inputValue, currentPage])

  function createMovieCard() {
    const generateKey = () => Math.random().toString(36).substring(2)
    if (uploadState.loading === true) {
      return null
    }
    return moviesData.map((film) => {
      let id
      let title = 'return'
      let date
      let description
      let path
      let voteRating
      let genres
      ;[id, title, date, description, path, voteRating, genres] = film
      return (
        <Col key={generateKey()} sm={24} xs={24} md={24} lg={12}>
          <MovieCard
            id={Number(id)}
            title={title}
            date={date}
            description={description}
            path={path}
            vote={voteRating}
            genres={genres}
            handleRating={handleRating}
            setUploadState={setUploadState}
          />
        </Col>
      )
    })
  }

  function showLoading() {
    if (uploadState.loading) {
      return <Spin indicator={antIcon} style={{ display: 'block', margin: '40px auto 0 auto' }} />
    }
    return null
  }
  function showError() {
    if (uploadState.error) {
      return <Alert type="error" message={uploadState.errorMessage} banner style={{ whiteSpace: 'pre-wrap' }} />
    }
    return null
  }

  function showContent() {
    if (!uploadState.loading && !uploadState.error) {
      return (
        <>
          <Row gutter={[36, 32]} justify="space-between">
            {createMovieCard()}
          </Row>
          <Pages
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            moviesDataLength={moviesData.length}
            uploadStateLoading={uploadState.loading}
          />
        </>
      )
    }
    return null
  }
  function handleRating(stars: number, id: number) {
    if (localStorage.getItem('rated') === null) {
      localStorage.setItem('rated', JSON.stringify([[id, stars]]))
    } else {
      let ids = JSON.parse(localStorage.getItem('rated') || '[]')
      ids.push([id, stars])
      localStorage.setItem('rated', JSON.stringify(ids))
    }
  }

  function renderTabContent(id: string) {
    if (id === '1') {
      return (
        <Context.Provider value={moviesGenres}>
          <SearchInput inputValue={inputValue} setInputValue={setInputValue} setCurrentPage={setCurrentPage} />
          <section className="movies-content">
            {!isFound ? <Alert type="info" message="По вашему запросу ничего не найдено!" banner /> : null}
            {showLoading()}
            {showError()}
            {showContent()}
          </section>
        </Context.Provider>
      )
    }

    return (
      <Context.Provider value={moviesGenres}>
        <RatedTab uploadState={uploadState} setUploadState={setUploadState} currentTab={currentTab} />
      </Context.Provider>
    )
  }

  return (
    <div className="App">
      <Tabs
        defaultActiveKey="1"
        centered
        items={new Array(2).fill(null).map((_, i) => {
          const id = String(i + 1)
          return {
            label: id === '1' ? 'Search' : 'Rated',
            key: id,
            children: renderTabContent(id),
          }
        })}
        onChange={(id) => setCurrentTab(id)}
      />
    </div>
  )
}
