import { useEffect, useState } from 'react';

export default function useTheme() {
	const localStorageTheme = localStorage.getItem('theme');
	const [theme, setTheme] = useState(localStorageTheme);

	useEffect(() => {
        updateTheme(localStorageTheme);
	}, [localStorageTheme]);

    const updateTheme = (t) => {
		setTheme(() => {
			if (t === 'omari') return 'light';
			if (t === 'omari-dark') return 'dark';
		});
    };

    // console.log('from hook: ', theme);

    return theme;
}
