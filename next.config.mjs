/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config, { dev }) => {
		// OneDrive can race on webpack cache file renames and corrupt dev chunks.
		if (dev) {
			config.cache = false;
		}

		return config;
	},
};

export default nextConfig;
