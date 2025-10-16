import React from "react";
import LoginForm from "./LoginForm";
import { useNavigate } from "react-router-dom";
import DecorativeImage from "./DecorativeImage";
import foodImg from "../../assets/food.png";
import stockImg from "../../assets/stok.png";

function Login() {
    const navigate = useNavigate();

    const handleLogin = (credentials) => {
        console.log("Login Attempt:", credentials);

        if (credentials.username && credentials.password) {
            navigate("/dashboard");
        }
    };

    return (
        <div className="w-screen h-screen bg-gray-800 overflow-y-hidden overflow-x-hidden">
            <div className="w-full h-full flex">
                {/* Left Image - Food */}
                <DecorativeImage
                    src={foodImg}
                    alt="Food decoration"
                    position="left"
                />

                {/* Center - Login Form */}
                <div className="w-full flex items-center justify-center h-full">
                    <div className="w-[80%] h-[60%] bg-gray-100/90 rounded-lg shadow-lg shadow-black">
                        <div className="flex items-center justify-center flex-col w-full h-full">
                            <h1 className="text-2xl mb-5 font-semibold relative bottom-8">
                                Welcome to{" "}
                                <span className="font-bold text-green-500">
                                    IMS Admin
                                </span>
                            </h1>

                            <LoginForm onSubmit={handleLogin} />
                        </div>
                    </div>
                </div>

                {/* Right Image - Stock */}
                <DecorativeImage
                    src={stockImg}
                    alt="Stock decoration"
                    position="right"
                />
            </div>
        </div>
    );
}

export default Login;
