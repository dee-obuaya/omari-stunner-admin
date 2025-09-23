import React from 'react';

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pageNumbers = [...Array(totalPages).keys()].map(i => i + 1);

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className='join'>
            <button
                className='join-item btn'
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                «
            </button>
            {pageNumbers.map(page => (
                <button
                key={page}
                className={`join-item btn ${currentPage === page ? 'btn-active' : ''}`}
                onClick={() => onPageChange(page)}
                >
                    {page}
                </button>
            ))}
            <button
                className='join-item btn'
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                »
            </button>
        </div>
    );
};

export default Pagination;
