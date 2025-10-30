import { useEffect, useState } from "react";

// Helper: safely resolve a DaisyUI variable to an absolute color
function getAllThemeColors() {
    const el = document.documentElement;
    const computed = getComputedStyle(el);

    const vars = [
        'primary', 'secondary', 'accent', 'neutral',
        'base-100', 'base-200', 'base-300', 'base-content',
        'info', 'success', 'warning', 'error'
    ];

    const colorMap = {};
    vars.forEach(v => {
        const val = computed.getPropertyValue(`--color-${v}`).trim();
        colorMap[v] = val;
    });
    return colorMap;
};

// 🧠 Custom Hook
export default function useDaisyUIThemeColors() {
    const [colors, setColors] = useState({});

    useEffect(() => {
        setColors(getAllThemeColors);

        const observer = new MutationObserver(mutations => {
            for (const m of mutations) {
                if (m.attributeName === 'data-theme') {
                    setColors(getAllThemeColors());
                }
            }
        });

        observer.observe(document.documentElement, {
            attributes: true,
        });

        return () => observer.disconnect();
    }, []);

    // console.log('colors: ', colors)

    return colors;
};