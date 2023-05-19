interface I_genres {
  id: number
  name: string
}

export class MovieDB {
  key = 'd1260fb3d8c64bb401d038124a2cc72e'

  getResource = async (url: string) => {
    const responce = await fetch(url)
    if (!responce.ok) {
      throw new Error(`Could not fetch ${url}; status: ${responce.status}`)
    }
    return responce.json()
  }

  sendQuery = async (str: string, page: number) => {
    const URL = `https://api.themoviedb.org/3/search/movie?api_key=${this.key}&language=en-US&query=${str}&page=${page}&include_adult=false`
    const responce = await this.getResource(URL)
    return responce
  }

  getRatedMovies = async (ids: number[]) =>
    ids.map(async (ID) => {
      const URL = `https://api.themoviedb.org/3/movie/${ID}?api_key=${this.key}&language=en-US`
      let responceQuery
      try {
        responceQuery = await fetch(URL)
      } catch (e) {
        return null
      }

      if (!responceQuery.ok) {
        throw new Error(`Could not fetch ${URL}; status: ${responceQuery.status}`)
      }

      const responce = await responceQuery.json()

      let id
      let title
      let releaseDate
      let overview
      let path
      let voteRating
      let genres = responce.genres.map((g: I_genres) => g.id)
      ;({ id, title, release_date: releaseDate, overview, poster_path: path, vote_average: voteRating } = responce)
      return [id, title, releaseDate, overview, path, voteRating, genres]
    })

  getGenres = async () => {
    const responce = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${this.key}&language=en-US`)
    return responce.json()
  }
}
