import { useState, useEffect } from 'react'
import { Row, Col, Spin, Alert } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import { MovieCard } from '../Movie-card/movie-card'
import { MovieDB } from '../../services/movie-db/movie-db'

type dataTemplate = (number | string | number[] | null)[]

interface I_RatedProps {
  uploadState: I_loading
  setUploadState: (obj: I_loading) => void
  currentTab: string
}

interface I_loading {
  loading: boolean
  error: boolean
  errorMessage?: string
}

export function RatedTab({ uploadState, setUploadState, currentTab }: I_RatedProps) {
  const [ratedData, setRatedData] = useState<dataTemplate>([])
  const [isEmpty, setIsEmpty] = useState<boolean>(false)

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
    const array = JSON.parse(localStorage.getItem('rated') || '[]')
    if (array.length !== 0) {
      setIsEmpty(false)
    }
    if (currentTab === '2' && !uploadState.error && array.length !== 0) {
      setUploadState({ loading: true, error: false })
      const getMovies = async () => {
        const api = new MovieDB()
        const ids = array.map((item: number[]) => item[0])
        const promisesArray = await api.getRatedMovies(ids).then()
        let newState = await Promise.all(promisesArray)
        newState = newState.filter((item) => item !== null)
        if (promisesArray.length !== newState.length) {
          setUploadState({
            loading: false,
            error: true,
            errorMessage: 'Не удалось обработать запрос. Проверьте подключение к сети или перезагрузите страницу',
          })
        } else {
          setRatedData(newState)
        }
      }
      getMovies()
    }
    if (array.length === 0) {
      setIsEmpty(true)
    }
  }, [currentTab, setUploadState, uploadState.error, isEmpty])

  useEffect(() => {
    if (ratedData.length !== 0 && !uploadState.error) {
      setUploadState({ loading: false, error: false })
    }
  }, [currentTab, ratedData, setUploadState, uploadState.error])

  function createMovieCard() {
    const generateKey = () => Math.random().toString(36).substring(2)
    const array = JSON.parse(localStorage.getItem('rated') || '[]')
    const stars = array.map((item: number[]) => item[1])
    const x = ratedData.map((film: any, index: number) => {
      let id
      let title
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
            userRating={stars[index]}
            setUploadState={setUploadState}
          />
        </Col>
      )
    })
    return x
  }

  if (uploadState.error) {
    return <Alert type="error" message={uploadState.errorMessage} banner style={{ whiteSpace: 'pre-wrap' }} />
  }
  if (uploadState.loading) {
    return <Spin indicator={antIcon} style={{ display: 'block', margin: '40px auto 0 auto' }} />
  }

  function showContent() {
    return (
      <Row gutter={[36, 32]} justify="space-between">
        {currentTab === '2' ? createMovieCard() : null}
      </Row>
    )
  }

  return isEmpty ? <Alert type="info" message="Вы не оценили ни один фильм" banner /> : showContent()
}
