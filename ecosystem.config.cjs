module.exports = {
  apps: [
    {
      name: "my-bun-app",
      script: "index.ts", // Replace with your entry file
      instances: 4, // Number of instances to run
      exec_mode: "fork", // 'cluster' for clustering
      env: {
        PORT: 3000,
      },
    },
  ],
};
