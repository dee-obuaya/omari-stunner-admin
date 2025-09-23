import ThemeToggle from './ThemeToggler';

export default function Header() {
    return (
        <div className='flex items-center justify-between px-4 lg:pl-10 pt-3.5 lg:pt-4.5 bg-base-100'>
            <div>
                <h1 className='uppercase font-italiana text-3xl lg:text-4xl tracking-widest'>Omari Stunner</h1>
            </div>
            <ThemeToggle />
        </div>
    );
};