/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef } from 'react';

export default function useDeviceType () {
    const deviceRef = useRef(null);

    const getDeviceType = () => {
        const userAgent = navigator.userAgent;
        const width = window.innerWidth;
        if (/Mobi|Android/i.test(userAgent) || width <= 768) {
            return "mobile";
        } else if (/Tablet|iPad/i.test(userAgent) || (width > 768 && width <= 1024)) {
            return "tablet";
        } else {
            return "desktop";
        }
    };

    deviceRef.current = getDeviceType();

    return { deviceType: deviceRef.current };
}