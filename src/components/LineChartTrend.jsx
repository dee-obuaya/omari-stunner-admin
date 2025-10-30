/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useRef, useState } from 'react';
import useDaisyUIThemeColors from '../hooks/useDaisyUIThemeColors';
import useTheme from '../hooks/useTheme';
import { color, motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const LineChartTrend = ({title, data}) => {
    const themeColors = useDaisyUIThemeColors();
    const [colors, setColors] = useState(themeColors);
    const [hoveredLegend, setHoveredLegend] = useState(null);
    const themeType = useTheme();


    useEffect(() => {
        setColors(themeColors);
    }, [themeColors, data]);

    // Smoothly pick theme colors (fallbacks included)
    const chartColors = useMemo(() => ({
        primary: colors["primary"] || colors["p"] || "#f000b8",
        secondary: colors['secondary'] || colors['s'] || '#9d6a3e',
        accent: colors["accent"] || colors["a"] || "#37cdbe",
        background: colors["base-200"] || colors["b2"] || "#ffffff",
        background100 : colors['base-100'] || colors['b1'],
        grid: colors["base-300"] || colors["b3"] || "#d1d5db",
        info: colors["info"] || colors["in"] || "#570df8",
        warning: colors['warning'] || colors['wa'] || '#eab712',
        success: colors['success'] || colors['su'] || '#118d24',
        error: colors['error'] || colors['er'] || '#a40b16',
        text: colors["base-content"] || "#1f2937",
    }), [colors]);

    return(
        <motion.div
            // className='card bg-base-200/35 shadow-xl p-6'
            className="relative w-full h-full bg-base-200/35 max-w-3xl backdrop-blur-md mx-auto p-4 rounded-2xl shadow-md"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <h2 className='text-lg font-bold mb-4 text-center font-italiana tracking-widest uppercase'>
                {title}
            </h2>

            <div
                style={{ flex: 1, height: '300px' }}
                // className='w-full h-64'
            >
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        {themeType === 'dark' ? (
                            <defs>
                                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={chartColors.error} stopOpacity={0.75}/>
                                    <stop offset="100%" stopColor={chartColors.primary} stopOpacity={0.55}/>
                                </linearGradient>
                            </defs>
                        ) : (
                            <defs>
                                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor='#f52176' stopOpacity={0.75}/>
                                    <stop offset="100%" stopColor={chartColors.secondary} stopOpacity={0.55}/>
                                </linearGradient>
                            </defs>
                        )}

                        <CartesianGrid
                            strokeDasharray='5 5'
                            stroke={`${chartColors.grid}`}
                            opacity={0.4}
                            vertical={false}
                        />

                        <XAxis
                            dataKey='month'
                            tick={{ fill: chartColors.text }}
                            tickLine={false}
                            axisLine={{ stroke: chartColors.grid }}
                        />
                        <YAxis
                            tick={{ fill: chartColors.text }}
                            tickLine={false}
                            axisLine={{ stroke: chartColors.grid }}
                            allowDecimals={false}
                        />
                        <Tooltip
                            cursor={{ fill: "rgba(0,0,0,0.05)" }}
                            contentStyle={{
                                backgroundColor: chartColors.background100,
                                border: `0.3px solid ${chartColors.grid}`,
                                borderRadius: '0.5rem',
                            }}
                        />

                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            wrapperStyle={{
                                color: chartColors.text,
                                fontSize: "0.85rem",
                            }}
                            onMouseEnter={() => setHoveredLegend(true)}
                            onMouseLeave={() => setHoveredLegend(null)}
                        />

                        <Line
                            name='Bookings'
                            type='monotone'
                            dataKey='bookings'
                            stroke={`url(#lineGradient)`}
                            strokeWidth={2}
                            dot={false}
                            activeDot={false}
                            isAnimationActive={true}
                            animationDuration={1200}
                            animationEasing='ease-in-out'
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}

export default LineChartTrend;