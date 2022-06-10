module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            transitionTimingFunction: {
                "in-expo": "cubic-bezier(0.2, 0, 0, 1)",
            }
        },
    },
    plugins: [],
}
