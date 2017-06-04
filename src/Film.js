import React from 'react';

function Film(props) {
  return (
    <div className="Film">
      <p><strong>{props.title}</strong></p>
      <p>{props.averageRating}</p>
      <p>{props.releaseDate}</p>
    </div>
  )
}

export default Film;
