module.exports = {
  mode: "production",
  entry: {
    scripts: "./index.js",
    //user: "./src/user.js",
  },
  output: {
    filename: "dist/built.js",
  },
  target: "node",
};
