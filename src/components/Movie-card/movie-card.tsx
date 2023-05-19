import { useContext } from 'react'
import { Space, Tag, Rate } from 'antd'
import './movie-card.css'
import { format } from 'date-fns'
import enGB from 'date-fns/locale/en-GB'

import { Context } from '../Context/context'
import noImage from '../../no-image.png'

interface I_cardProps {
  id: number
  title: string
  date: string
  description: string
  path: string
  vote: string
  genres: any
  handleRating?: (stars: number, id: number) => void
  userRating?: number
  setUploadState: (obj: I_loading) => void
}

interface I_loading {
  loading: boolean
  error: boolean
  errorMessage?: string
}

export function MovieCard({
  id,
  title,
  date,
  description,
  path,
  vote,
  genres,
  handleRating,
  userRating,
  setUploadState,
}: I_cardProps) {
  const allGenres = useContext(Context)

  let newDate: string
  if (date) {
    newDate = format(new Date(date), 'MMMM dd, yyyy', { locale: enGB })
  } else {
    newDate = 'No release date information'
  }

  function descriptionSlice() {
    let shortDescription = ''

    title.length < 20 ? (shortDescription = description.slice(0, 160)) : null
    title.length >= 20 && title.length < 36 ? (shortDescription = description.slice(0, 100)) : null
    title.length >= 36 && title.length < 52 ? (shortDescription = description.slice(0, 70)) : null
    title.length >= 52 && title.length < 60 ? (shortDescription = description.slice(0, 50)) : null
    title.length >= 60 ? (shortDescription = description.slice(0, 30)) : null

    let i = shortDescription.length - 1
    if (description.length > 100) {
      while (shortDescription[i]) {
        i--
        if (shortDescription[i] === ' ') {
          shortDescription = `${shortDescription.slice(0, i)} ...`
          break
        }
      }
    }
    return shortDescription
  }
  const setImage = () => {
    if (!path) {
      return noImage
    }
    return `https://image.tmdb.org/t/p/w500/${path}`
  }

  const setVoteRating = () => {
    const rating = Number(Number(vote).toFixed(1))

    if (rating >= 0 && rating <= 3) {
      return (
        <div className="movie-card__info-head-rating" style={{ borderColor: '#E90000' }}>
          <p>{rating}</p>
        </div>
      )
    }

    if (rating > 3 && rating <= 5) {
      return (
        <div className="movie-card__info-head-rating" style={{ borderColor: '#E97E00' }}>
          <p>{rating}</p>
        </div>
      )
    }

    if (rating > 5 && rating <= 7) {
      return (
        <div className="movie-card__info-head-rating" style={{ borderColor: '#E9D100' }}>
          <p>{rating}</p>
        </div>
      )
    }

    return (
      <div className="movie-card__info-head-rating" style={{ borderColor: '#66E900' }}>
        <p>{rating}</p>
      </div>
    )
  }

  function setGenres() {
    /* eslint-disable */
    try {
      return genres.map((num: number) => {
        return (
          <Tag className="movie-card__genre-item" key={'g-' + Math.random().toString(36).substring(2).toString()}>
            {allGenres[num]}
          </Tag>
        )
      })
    } catch (e: any) {
      setUploadState({ loading: false, error: true, errorMessage: e.toString() })
      return
    }

    /* eslint-enable */
  }
  return (
    <div className="movie-card">
      <div className="movie-card__img-wrapper">
        <img src={setImage()} alt="Обложка отсутствует" />
      </div>
      <div className="movie-card__info-wrapper">
        <div>
          <div className="movie-card__info-head">
            <h3>{title}</h3>
            {setVoteRating()}
          </div>
          <p className="movie-card__date">{newDate}</p>
          <div className="movie-card__genres-wrapper">
            <Space size={[0, 8]} wrap>
              {setGenres()}
            </Space>
          </div>
          <p className="description">{descriptionSlice()}</p>
        </div>
        <div className="movie-card__stars-wrapper">
          <Rate
            defaultValue={userRating || 0}
            disabled={!!userRating}
            count={10}
            style={{ fontSize: '15px' }}
            onChange={(stars) => handleRating?.(stars, id)}
          />
        </div>
      </div>
    </div>
  )
}

MovieCard.defaultProps = {
  handleRating: null,
  userRating: 0,
}
