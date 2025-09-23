export default function Footer() {
    return (
        <footer className='footer footer-horizontal footer-center w-full text-neutral p-4 justify-self-end text-xs content-center'>
            <aside>
                <p>Copyright © {new Date().getFullYear()} - Omari Stunner</p>
            </aside>
        </footer>
    );
};