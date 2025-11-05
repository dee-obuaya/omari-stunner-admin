export default function Loader ({ size, tip }) {

    const getLoader = loaderSize => {
        switch (loaderSize) {
            case 'sm':
                return <span className="loading loading-ring loading-sm"></span>;
            case 'md':
                return <span className="loading loading-ring loading-md"></span>;
            case 'lg':
                return <span className="loading loading-ring loading-lg"></span>;
            case 'xl':
                return <span className="loading loading-ring loading-xl"></span>;
            default:
                return <span className="loading loading-ring loading-xs"></span>;
        };
    };

    return (
        <div className="flex flex-col items-center justify-center justify-self-center h-96 space-y-0.5">
            {getLoader(size)}
            {tip && <p className="text-base text-base-content font-niconne tracking-wider animate-pulse">{tip.message}</p>}
        </div>
    );
}