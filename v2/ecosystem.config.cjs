module.exports = {
  apps: [{
    name: 'escape-the-lecture-v2',
    script: 'bun',
    args: 'run serve.ts',
    cwd: '/home/deploy/escape-the-lecture-v2',
    env: { PORT: 5075, NODE_ENV: 'production' },
    autorestart: true,
    watch: false,
  }],
};
