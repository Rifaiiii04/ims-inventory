import React from "react";

function DecorativeImage({ src, alt, position = "left" }) {
    const positionClasses = {
        left: "relative top-[600px] right-48 rotate-12",
        right: "relative bottom-20 left-72 -rotate-12",
    };

    return (
        <div
            className={`w-full h-full ${positionClasses[position]} drop-shadow-black drop-shadow-2xl`}
        >
            <img src={src} alt={alt} />
        </div>
    );
}

export default DecorativeImage;

