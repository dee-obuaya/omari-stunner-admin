const InlineError = ({ message = 'Something went wrong.' }) => {
    return (
        <div className='flex flex-col items-center justify-center h-full text-center text-gray-600 p-8'>
            <h2 className='text-2xl font-semibold mb-2'>⚠️ Error</h2>
            <p>{message}</p>
        </div>
    );
};

export default InlineError;