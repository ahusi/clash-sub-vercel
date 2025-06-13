// 文件路径: postcss.config.mjs
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // 明确地告诉 PostCSS 使用新的插件
    '@tailwindcss/postcss': {}, 
    autoprefixer: {},
  },
};

export default config;