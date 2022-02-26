import React from 'react';

const Pagination = ({ videosPerPage, totalVideos, paginate ,username ,currentPage}) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalVideos / videosPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className='pagination'>
        {pageNumbers.map(number => (
          <li key={number} className={"page-item"}>
            <a onClick={() => paginate(number)} href={username} 
            className={"page-link " + (currentPage === number ? 'text-white bg-info' : '')}>
              {number}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Pagination;