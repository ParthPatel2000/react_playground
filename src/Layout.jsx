// Layout.jsx
import React, { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function Layout({ children }) {
    const particlesInit = useCallback(async (engine) => {
        await loadFull(engine);
    }, []);

    return (
        <div className="relative w-full min-h-screen">
            {/* Full page particles */}
            {/* Dots */}
            {/* <Particles
        className="absolute inset-0 w-full h-full z-0"
        init={particlesInit}
        options={{
          background: { color: "#0f0f0f" },
          fpsLimit: 60,
          interactivity: {
            events: { onHover: { enable: true, mode: "bubble" } },
            modes: { bubble: { distance: 100, size: 3, opacity: 1, duration: 0.2 } },
          },
          particles: {
            number: { value: 200, density: { enable: true, area: 800 } },
            color: { value: ["#ff00cc", "#00ffff", "#ffff00", "#ffffff"] },
            shape: { type: "circle" },
            size: { value: 2 },
            opacity: { value: 0.3 },
            move: { enable: false },
          },
        }}
      /> */}

            {/* Fractals */}
            <Particles
                className="absolute inset-0 w-full h-full z-0"
                init={particlesInit}
                options={{
                    background: { color: "#0f0f0f" },
                    fpsLimit: 60,
                    interactivity: {
                        events: {
                            onHover: { enable: true, mode: "repulse" },
                            onClick: { enable: true, mode: "push" },
                        },
                    },
                    particles: {
                        number: { value: 20, limit: 20, density: { enable: true, area: 800 } },
                        color: { value: ["#ff00cc", "#00ffff",] },
                        links: {
                            enable: true,
                            distance: 150,
                            color: "#a9aaab",
                            opacity: 0.5,
                            width: 1.5,
                        },
                        move: { enable: true, speed: 1, outModes: "bounce" },
                        size: { value: { min: 2, max: 5 } },
                        opacity: { value: 0.9 },
                    },
                }}
            />

            {/* Page content */}
            <div className="relative z-10">{children}</div>
        </div>
    );
}
