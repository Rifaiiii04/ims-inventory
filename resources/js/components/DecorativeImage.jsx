import React from "react";

function DecorativeImage({ src, alt, position = "left" }) {
    const positionClasses = {
        left: "absolute top-20 left-20 rotate-12 opacity-20 hover:opacity-30 transition-opacity duration-300",
        right: "absolute bottom-20 right-20 -rotate-12 opacity-20 hover:opacity-30 transition-opacity duration-300",
    };

    return (
        <div className={`w-32 h-32 lg:w-48 lg:h-48 ${positionClasses[position]} drop-shadow-2xl`}>
            <img 
                src={src} 
                alt={alt} 
                className="w-full h-full object-contain filter drop-shadow-lg"
            />
        </div>
    );
}

export default DecorativeImage;

