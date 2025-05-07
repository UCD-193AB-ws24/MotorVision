const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure the resolver and transformer objects exist
config.resolver = config.resolver || {};
config.transformer = config.transformer || {};

// Add support for CommonJS modules
config.resolver.sourceExts = config.resolver.sourceExts || [];
if (!config.resolver.sourceExts.includes('cjs')) {
  config.resolver.sourceExts.push('cjs');
}

// Disable unstable package exports to prevent conflicts
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
