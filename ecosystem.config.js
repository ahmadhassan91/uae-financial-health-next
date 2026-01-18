/**
 * PM2 Ecosystem Configuration for Next.js Production Server
 * 
 * This configuration runs the production build of Next.js
 * which pre-compiles all pages for instant serving.
 * 
 * Usage:
 *   1. Build: npm run build
 *   2. Start: pm2 start ecosystem.config.js
 *   3. Restart: pm2 restart financial-clinic
 *   4. Stop: pm2 stop financial-clinic
 *   5. Logs: pm2 logs financial-clinic
 */

module.exports = {
    apps: [
        {
            name: 'financial-clinic',
            script: 'node_modules/next/dist/bin/next',
            args: 'start -p 3000',
            cwd: __dirname,
            instances: 1,            // Use 'max' for cluster mode (multiple CPUs)
            exec_mode: 'fork',       // Use 'cluster' for multi-instance
            autorestart: true,
            watch: false,            // Don't watch files in production
            max_memory_restart: '1G',

            // Environment variables
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
            },

            // Production-specific settings
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000,
            },

            // Logging
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            error_file: './logs/pm2-error.log',
            out_file: './logs/pm2-out.log',
            merge_logs: true,

            // Graceful shutdown
            kill_timeout: 5000,
            wait_ready: true,
            listen_timeout: 10000,
        },
    ],
};
