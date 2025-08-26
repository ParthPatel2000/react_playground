import React, { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function LandingPage() {
    const particlesInit = useCallback(async (engine) => {
        await loadFull(engine);
    }, []);

    return (
        <div className="w-full h-screen relative overflow-hidden">

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 px-4">
                {/* Header */}
                <motion.h1
                    className="text-5xl md:text-6xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    Welcome to React Playground
                </motion.h1>

                {/* Buttons */}
                <motion.div
                    className="flex flex-col md:flex-row gap-4 mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                >
                    {["Tic Tac Toe", "Tower Defense", "2048"].map((game) => (
                        <Link
                            key={game}
                            to={`/${game.toLowerCase().split(" ").join("")}`}
                            className="relative px-6 py-3 font-semibold text-purple-600 rounded-lg shadow-lg overflow-hidden group"
                        >
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                            <span className="relative z-10">{game}</span>
                        </Link>
                    ))}
                </motion.div>

                {/* Footer */}
                <motion.div
                    className="mt-20 text-sm opacity-80"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.8 }}
                >
                    Built with ❤️ and React
                </motion.div>
            </div>
        </div>
    );
}


// import React, { useCallback } from "react";
// import Particles from "react-tsparticles";
// import { loadFull } from "tsparticles";

// export default function LandingPage() {
//     const particlesInit = useCallback(async (engine) => {
//         await loadFull(engine);
//     }, []);

//     return (
//         <div className="w-full h-screen relative bg-black">
//             <Particles
//                 className="absolute inset-0 w-full h-full z-0"
//                 init={particlesInit}
//                 options={{
//                     background: { color: "#0f0f0f" },
//                     fpsLimit: 60,
//                     interactivity: {
//                         events: {
//                             onHover: { enable: true, mode: "bubble" }, // brighten dots near cursor
//                         },
//                         modes: {
//                             bubble: {
//                                 distance: 100, // radius around cursor
//                                 size: 3,       // make them slightly bigger
//                                 opacity: 1,
//                                 duration: 0.2,
//                             },
//                         },
//                     },
//                     particles: {
//                         number: {
//                             value: 200,
//                             density: { enable: true, area: 800 },
//                         },
//                         color: { value: ["#ff00cc", "#00ffff", "#ffff00", "#ffffff"] },
//                         shape: { type: "circle" },
//                         size: { value: 2 },
//                         opacity: { value: 0.3 },
//                         move: { enable: false }, // static grid-like particles
//                     },
//                 }}
//             />
//         </div>
//     );
// }
