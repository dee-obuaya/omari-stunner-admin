import Pagination from './Pagination';
import Loader from './Loader';

const Table = ({columns, dataSource, pagination, loading=false}) => {
    // console.log(dataSource);
    return (
        <div className='overflow-x-auto h-96'>
            <table className='table table-pin-rows bg-base-100 tracking-wider font-libertinus'>
                {/* head */}
                <thead>
                    <tr>
                        {columns?.map((column, index) => (
                            <th key={index} className='text-nowrap text-center'>{column.title}</th>
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
                                <td colSpan={columns.length} className='text-center'>No data found.</td>
                            </tr>
                        )
                    )}
                </tbody>
                {pagination && dataSource?.length > pagination?.itemsPerPage && (
                    <tfoot>
                        <tr>
                            <td colSpan={columns?.length} className='text-center'>
                                <Pagination
                                    totalItems={pagination?.totalItems}
                                    itemsPerPage={pagination?.itemsPerPage}
                                    currentPage={pagination?.currentPage}
                                    onPageChange={pagination?.onPageChange}
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