import React from "react";

function TopProductCard({ product }) {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-5 bg-white rounded-xl border-2 border-gray-100 hover:border-green-500 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto mb-3 md:mb-0">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center border-2 border-green-200 group-hover:scale-110 transition-transform duration-300">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="size-6 md:size-7 text-green-600"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                        />
                    </svg>
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 text-sm md:text-base truncate group-hover:text-green-600 transition-colors">
                        {product.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="size-3 md:size-4 text-gray-400"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                />
                            </svg>
                            <p className="text-xs md:text-sm text-gray-600 font-medium">
                                {product.sold} terjual
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="text-left md:text-right w-full md:w-auto pl-16 md:pl-0">
                <p className="text-base md:text-lg font-bold text-green-600">
                    Rp {product.revenue.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-gray-500 font-medium">Revenue</p>
            </div>
        </div>
    );
}

export default TopProductCard;
