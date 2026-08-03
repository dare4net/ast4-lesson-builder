"use client"

import { useEffect, useState } from "react"

interface SplashScreenProps {
    onFinished: () => void
    isLoading?: boolean
}

const FULL_NAME = "AFTER-SCHOOL.TECH"
// Eye animation last element lands at ~3.2s, so typewriter starts after that
const TYPEWRITER_START_MS = 2000

export function SplashScreen({ onFinished }: SplashScreenProps) {
    const [typedChars, setTypedChars] = useState(0)
    const [typingDone, setTypingDone] = useState(false)

    useEffect(() => {
        // Phase 1: wait for eye animation to finish
        const startTyping = setTimeout(() => {
            let i = 0
            const typer = setInterval(() => {
                i++
                setTypedChars(i)
                if (i >= FULL_NAME.length) {
                    clearInterval(typer)
                    setTypingDone(true)
                    // Phase 3: wait 3s then navigate
                    setTimeout(() => onFinished(), 3000)
                }
            }, 90)
            return () => clearInterval(typer)
        }, TYPEWRITER_START_MS)

        return () => clearTimeout(startTyping)
    }, [onFinished])

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: '#ffffff', fontFamily: "'Nunito', 'Inter', sans-serif",
            userSelect: 'none', overflow: 'hidden',
        }}>
            {/* Eyes — GPU-friendly: only opacity + transform animated, will-change declared */}
            <svg
                viewBox="0 0 420 260"
                width="240"
                height="149"
                style={{ overflow: 'visible', display: 'block' }}
            >
                <style>{`
                    /* Use only transform + opacity — GPU accelerated */
                    .sq {
                        opacity: 0;
                        transform-box: fill-box;
                        transform-origin: center;
                        will-change: transform, opacity;
                        animation: sqPop 0.9s cubic-bezier(.34,1.56,.64,1) forwards;
                    }
                    @keyframes sqPop {
                        0%   { opacity:0; transform: scale(0) rotate(-8deg); }
                        55%  { opacity:1; transform: scale(1.1) rotate(2deg); }
                        100% { opacity:1; transform: scale(1) rotate(0); }
                    }

                    .lin, .ol {
                        opacity: 0;
                        will-change: opacity;
                        animation: fIn 0.6s ease forwards;
                    }
                    @keyframes fIn { to { opacity: 1; } }

                    .pr, .pd, .ad, .sd {
                        opacity: 0;
                        transform-box: fill-box;
                        transform-origin: center;
                        transform: scale(0);
                        will-change: transform, opacity;
                        animation: pB 0.7s cubic-bezier(.34,1.56,.64,1) forwards;
                    }
                    @keyframes pB {
                        0%   { opacity:0; transform: scale(0); }
                        55%  { opacity:1; transform: scale(1.2); }
                        100% { opacity:1; transform: scale(1); }
                    }

                    .as {
                        opacity: 0;
                        transform-box: fill-box;
                        transform-origin: 50% 100%;
                        transform: scaleY(0);
                        will-change: transform, opacity;
                        animation: sG 0.55s ease forwards;
                    }
                    @keyframes sG { to { opacity:1; transform: scaleY(1); } }

                    .ss {
                        opacity: 0;
                        transform-box: fill-box;
                        transform-origin: 0% 50%;
                        transform: scaleX(0);
                        will-change: transform, opacity;
                        animation: sGX 0.45s ease forwards;
                    }
                    @keyframes sGX { to { opacity:1; transform: scaleX(1); } }
                `}</style>

                {/* Left eye */}
                <g>
                    <clipPath id="cL"><rect x="55" y="90" width="130" height="130" /></clipPath>
                    <g clipPath="url(#cL)">
                        <rect className="sq" x="55" y="90" width="65" height="65" fill="#4FA8DE" style={{ animationDelay: '0.3s' }} />
                        <rect className="sq" x="120" y="90" width="65" height="65" fill="#6DBE45" style={{ animationDelay: '0.5s' }} />
                        <rect className="sq" x="55" y="155" width="65" height="65" fill="#35408C" style={{ animationDelay: '0.5s' }} />
                        <rect className="sq" x="120" y="155" width="65" height="65" fill="#2E7D4F" style={{ animationDelay: '0.7s' }} />
                    </g>
                    <rect className="lin" x="117" y="90" width="6" height="130" fill="#000" style={{ animationDelay: '1.0s' }} />
                    <rect className="lin" x="55" y="152" width="130" height="6" fill="#000" style={{ animationDelay: '1.0s' }} />
                    <rect className="ol" x="55" y="90" width="130" height="130" fill="none" stroke="#000" strokeWidth="6" style={{ animationDelay: '1.0s' }} />
                    <circle className="pr" cx="120" cy="155" r="30" fill="#fff" stroke="#000" strokeWidth="6" style={{ animationDelay: '1.2s' }} />
                    <circle className="pd" cx="120" cy="155" r="13" fill="#000" style={{ animationDelay: '1.4s' }} />
                    <line className="as" x1="120" y1="90" x2="120" y2="48" stroke="#000" strokeWidth="6" style={{ animationDelay: '1.6s' }} />
                    <circle className="ad" cx="120" cy="42" r="11" fill="#D94A3D" stroke="#000" strokeWidth="4" style={{ animationDelay: '1.95s' }} />
                    <line className="ss" x1="20" y1="155" x2="55" y2="155" stroke="#000" strokeWidth="6" style={{ animationDelay: '1.8s' }} />
                    <circle className="sd" cx="15" cy="155" r="10" fill="#D94A3D" stroke="#000" strokeWidth="4" style={{ animationDelay: '2.1s' }} />
                </g>

                {/* Right eye */}
                <g>
                    <clipPath id="cR"><rect x="235" y="90" width="130" height="130" /></clipPath>
                    <g clipPath="url(#cR)">
                        <rect className="sq" x="235" y="90" width="65" height="65" fill="#4FA8DE" style={{ animationDelay: '0.4s' }} />
                        <rect className="sq" x="300" y="90" width="65" height="65" fill="#4FA8DE" style={{ animationDelay: '0.6s' }} />
                        <rect className="sq" x="235" y="155" width="65" height="65" fill="#6DBE45" style={{ animationDelay: '0.6s' }} />
                        <rect className="sq" x="300" y="155" width="65" height="65" fill="#E85B3A" style={{ animationDelay: '0.8s' }} />
                    </g>
                    <rect className="lin" x="297" y="90" width="6" height="130" fill="#000" style={{ animationDelay: '1.1s' }} />
                    <rect className="lin" x="235" y="152" width="130" height="6" fill="#000" style={{ animationDelay: '1.1s' }} />
                    <rect className="ol" x="235" y="90" width="130" height="130" fill="none" stroke="#000" strokeWidth="6" style={{ animationDelay: '1.1s' }} />
                    <circle className="pr" cx="300" cy="155" r="30" fill="#fff" stroke="#000" strokeWidth="6" style={{ animationDelay: '1.3s' }} />
                    <circle className="pd" cx="300" cy="155" r="13" fill="#000" style={{ animationDelay: '1.5s' }} />
                    <line className="as" x1="300" y1="90" x2="300" y2="48" stroke="#000" strokeWidth="6" style={{ animationDelay: '1.7s' }} />
                    <circle className="ad" cx="300" cy="42" r="11" fill="#F4B942" stroke="#000" strokeWidth="4" style={{ animationDelay: '2.05s' }} />
                    <line className="ss" x1="365" y1="155" x2="400" y2="155" stroke="#000" strokeWidth="6" style={{ animationDelay: '1.9s' }} />
                    <circle className="sd" cx="405" cy="155" r="10" fill="#F4B942" stroke="#000" strokeWidth="4" style={{ animationDelay: '2.2s' }} />
                </g>
            </svg>

            {/* Typewriter name — fades in as a block, text grows character by character */}
            <div style={{
                marginTop: 32,
                minHeight: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                letterSpacing: '0.22em',
                fontSize: 15,
                fontWeight: 900,
                color: '#16161B',
                textTransform: 'uppercase',
                fontFamily: "'Nunito', 'Inter', monospace",
                opacity: typedChars > 0 ? 1 : 0,
                transition: 'opacity 0.2s ease',
            }}>
                {FULL_NAME.slice(0, typedChars)}
                {/* Blinking cursor while typing */}
                {!typingDone && (
                    <span style={{
                        display: 'inline-block',
                        width: 2,
                        height: '1em',
                        background: '#35408C',
                        marginLeft: 2,
                        verticalAlign: 'middle',
                        animation: 'blink 0.7s step-end infinite',
                    }} />
                )}
                <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
            </div>
        </div>
    )
}
