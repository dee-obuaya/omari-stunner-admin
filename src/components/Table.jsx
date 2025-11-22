/* eslint-disable no-unused-vars */
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, ArrowDown, ListFilter } from 'lucide-react';
import Pagination from './Pagination';
import Loader from './Loader';

const Table = ({
    columns, dataSource, pagination, loading=false,
    onSortChange, onFilterChange, onPageChange, currentSort,
    currentFilters, currentPage
}) => {

    // const handleClearFilters = () => {
    //     setSortConfig({key: null, direction: null});
    //     setFilters({});
    //     setCurrentPage(1);
    //     sessionStorage.removeItem(storageKey);
    // };


    const handleSort = (col) => {
        if (!col.sort) return;

        // setCurrentPage(1);
        let newSort = { key: col.dataId, direction: 'asc'}
        if (currentSort?.key === col.dataId) {
            if(currentSort.direction === 'asc') newSort.direction = 'desc';
            else if (currentSort.direction === 'desc') newSort = {key: null, direction: null};
        }

        onSortChange?.(newSort);
    };

    const handleFilter = (colKey, value) => {
        const updatedFilters = {...currentFilters};
        // console.log('handleFilter called with:', colKey, value);

        if (value === 'All') delete updatedFilters[colKey];
        else updatedFilters[colKey] = value

        onFilterChange?.(updatedFilters);
    };

    const handlePageChange = (page) => onPageChange?.(page);


    return (
        <div className='overflow-x-auto h-112 border border-base-content/5 rounded-box shadow-md shadow-base-300 mb-8'>
            <table className='table table-pin-rows bg-base-100 tracking-wider font-libertinus'>
                {/* head */}
                <thead className='px-1'>
                    <tr>
                        {columns?.map((column) => (
                            <th
                                key={column.dataId}
                                className={`text-nowrap text-center text-lg tracking-widest font-libertinus
                                    ${column.sort && ' cursor-pointer select-none hover:bg-base-200 transition-all duration-200 '}
                                    ${currentSort?.key === column.dataId && ' bg-base-300'} ${column.filter && ' relative'}`}
                                onClick={() => handleSort(column)}
                            >
                                <div
                                    // whileTap={{ scale:0.95 }}
                                    className='flex items-center justify-center gap-1'
                                >
                                    {column.title}
                                    {column.sort && (
                                        <>
                                            <motion.span whileTap={{ scale:0.95 }} className='flex flex-col leading-none'>
                                                <ArrowUp
                                                    size={14}
                                                    className={`transition-all duration-200 ${
                                                    currentSort?.key === column.dataId && (currentSort?.direction === 'asc')
                                                        ? 'text-warning'
                                                        : 'text-gray-400'
                                                    }`}
                                                />
                                                <ArrowDown
                                                    size={14}
                                                    className={`transition-all duration-200 -mt-1 ${
                                                    currentSort?.key === column.dataId && (currentSort?.direction === 'desc')
                                                        ? 'text-warning'
                                                        : 'text-gray-400'
                                                    }`}
                                                />
                                            </motion.span>
                                            <span className="sr-only">
                                                Sorted {
                                                    currentSort?.direction === 'asc' ? 'ascending': 'descending'
                                                }
                                            </span>
                                        </>

                                    )}
                                    {column.filter && (
                                        <div className='dropdown dropdown-end'>
                                            <motion.div whileTap={{ scale:0.95 }} tabIndex={0} role='button' className='btn btn-dash btn-xs'>
                                                <ListFilter size={14} />
                                            </motion.div>
                                            <AnimatePresence>
                                                <motion.ul
                                                    tabIndex='-1'
                                                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                                    className='dropdown-content absolute z-3 menu p-2 shadow-sm bg-base-100 rounded-box w-36'
                                                >
                                                    {column.filter.map((option) => (
                                                    <li key={option} onClick={() => document.activeElement.blur()}>
                                                        <button
                                                            onClick={() => handleFilter(column.dataId, option)}
                                                            className={`${
                                                                (currentFilters[column.dataId] === option) ? 'bg-primary text-primary-content' : ''
                                                            }`}
                                                        >
                                                            {option}
                                                        </button>
                                                    </li>
                                                    ))}
                                                </motion.ul>
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>

                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className='px-1'>
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length} className='text-center'>
                                <Loader size='md' />
                            </td>
                        </tr>
                    ) : (
                        dataSource?.length > 0 ? (
                            dataSource?.map((row, rowIndex) => (
                                <tr key={rowIndex} className='hover:bg-base-300 text-center'>
                                    {columns?.map((column, colIndex) => (
                                        <td key={colIndex} className='text-nowrap'>{column.render? column.render({ row: { original: row } }) : row[column.dataId]}</td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className='text-center py-4'>No data found.</td>
                            </tr>
                        )
                    )}
                </tbody>
                {pagination && pagination?.totalItems > pagination?.itemsPerPage && (
                    <tfoot>
                        <tr>
                            <td colSpan={columns?.length} className='text-center'>
                                <Pagination
                                    totalItems={pagination?.totalItems}
                                    itemsPerPage={pagination?.itemsPerPage}
                                    currentPage={currentPage}
                                    onPageChange={handlePageChange}
                                />
                            </td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
}

export default Table;