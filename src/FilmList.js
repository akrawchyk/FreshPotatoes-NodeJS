import React from 'react';
import Film from './Film';

function FilmList(props) {
  let list = null;

  if (props.films) {
    list = (
      <ul className="FilmList-films">
        {props.films.map(film => {
          return (
            <li key={film.id}>
              <Film title={film.title} averageRating={film.averageRating} releaseDate={film.releaseDate} />
            </li>)
        })}
      </ul>);
  }

  return (
    <div className="FilmList">
      {list}
    </div>
  )
}

export default FilmList;
