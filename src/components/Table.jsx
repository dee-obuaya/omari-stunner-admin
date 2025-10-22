/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, ArrowDown, ListFilter } from 'lucide-react';
import Pagination from './Pagination';
import Loader from './Loader';

const Table = ({columns, dataSource, pagination, loading=false}) => {
    // console.log(dataSource);
    const [sortConfig, setSortConfig] = useState({key: null, direction: null});
    const [filters, setFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = pagination.itemsPerPage || 10;


    const handleSort = (col) => {
        if (!col.sort) return;

        setCurrentPage(1);

        setSortConfig((prev) => {
            if (prev.key === col.dataId) {
                // Toggle between asc -> desc -> of'
                if (prev.direction === 'asc') return { key: col.dataId, direction: 'desc' };
                if (prev.direction === 'desc') return { key: null, direction: null };
            }
            return { key: col.dataId, direction: 'asc' };
        });
    };

    const handleFilter = (colKey, value) => {
        setCurrentPage(1);

        setFilters((prev) => {
            if (value === 'All') {
                // remove filter for that column
                const updated = {...prev};
                delete updated[colKey];
                return updated;
            }

            return {...prev, [colKey]: value};
        })
    }

    const sortedData = useMemo(() => {
        // if (!Array.isArray(dataSource)) return [];
        if (!sortConfig.key) return dataSource;

        // const col = columns.find((c) => c.sort?.key === sortConfig.key);
        // if (!col) return dataSource;

        // const {key, order} = col.sort;
        // const {direction} = sortConfig;

        // let sorted;

        // if (['latest', 'oldest'].includes(direction)) {
        //     sorted = [...dataSource].sort((a,b) => {
        //         const dateA = new Date(a[key]);
        //         const dateB = new Date(b[key]);
        //         return direction === 'latest' ? dateB - dateA : dateA - dateB;
        //     });

        //     return sorted;
        // };

        // standard ascending/descending
        const sorted = [...dataSource].sort((a,b) => {
            // if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            // if (a[key] > b[key]) return direction === 'asc' ? 1: -1;
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [dataSource, sortConfig]);

    const filteredData = useMemo(() => {
        let result = sortedData;

        Object.entries(filters).forEach(([colKey, value]) => {
            result = result.filter((item) => {
                const cellValue = String(item[colKey] ?? '').toLowerCase().trim();
                const filterValue = value.toLowerCase().trim();

                return cellValue === filterValue;
            });
        });

        return result;
    }, [sortedData, filters])

    const paginatedData = useMemo(() => {
        // if (!Array.isArray(filteredData)) return [];

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        return filteredData.slice(startIndex, endIndex);
    }, [filteredData, currentPage, itemsPerPage]);


    // console.log('data length: ', dataSource?.length)
    // console.log(dataSource)
    // console.log('sortedData length: ', sortedData?.length)
    // console.log('paginateData length: ', paginatedData?.length)

    return (
        <div className='overflow-x-auto h-96'>
            <table className='table table-pin-rows bg-base-100 tracking-wider font-libertinus'>
                {/* head */}
                <thead>
                    <tr>
                        {columns?.map((column) => (
                            <th
                                key={column.dataId}
                                className={`text-nowrap text-center ${column.sort && 'cursor-pointer select-none hover:bg-base-200 transition-all duration-200 '} ${sortConfig.key === column.dataId && 'bg-base-300'} ${column.filter && ' relative'}`}
                                onClick={() => handleSort(column)}
                            >
                                <div
                                    // whileTap={{ scale:0.95 }}
                                    className='flex items-center gap-1'
                                >
                                    {column.title}
                                    {column.sort && (
                                        <>
                                            <motion.span whileTap={{ scale:0.95 }} className='flex flex-col leading-none'>
                                                <ArrowUp
                                                    size={14}
                                                    className={`transition-all duration-200 ${
                                                    sortConfig.key === column.dataId && (sortConfig.direction === 'asc')
                                                        ? 'text-warning'
                                                        : 'text-gray-400'
                                                    }`}
                                                />
                                                <ArrowDown
                                                    size={14}
                                                    className={`transition-all duration-200 -mt-1 ${
                                                    sortConfig.key === column.dataId && (sortConfig.direction === 'desc')
                                                        ? 'text-warning'
                                                        : 'text-gray-400'
                                                    }`}
                                                />
                                            </motion.span>
                                            <span className="sr-only">
                                                Sorted {
                                                    sortConfig.direction === 'asc' ? 'ascending': 'descending'
                                                }
                                            </span>
                                        </>

                                    )}
                                    {column.filter && (
                                        <div className='dropdown dropdown-end'>
                                            <motion.div whileTap={{ scale:0.95 }} tabIndex={0} role='button' className='btn btn-ghost btn-xs'>
                                                <ListFilter size={14} />
                                            </motion.div>
                                            <AnimatePresence>
                                                <motion.ul
                                                    tabIndex={0}
                                                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                                    className='dropdown-content absolute z-[1] menu p-2 shadow bg-base-100 rounded-box w-36'
                                                >
                                                    {column.filter.map((option) => (
                                                    <li key={option}>
                                                        <button
                                                            onClick={() => handleFilter(column.dataId, option)}
                                                            className={`${
                                                                filters[column.dataId] === option ? 'bg-primary text-primary-content' : ''
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
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length} className='text-center'>
                                <Loader size='md' />
                            </td>
                        </tr>
                    ) : (
                        paginatedData?.length > 0 ? (
                            paginatedData?.map((row, rowIndex) => (
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
                {pagination && pagination.totalItems > itemsPerPage && (
                    <tfoot>
                        <tr>
                            <td colSpan={columns?.length} className='text-center'>
                                <Pagination
                                    totalItems={pagination?.totalItems}
                                    itemsPerPage={itemsPerPage}
                                    currentPage={currentPage}
                                    onPageChange={setCurrentPage}
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