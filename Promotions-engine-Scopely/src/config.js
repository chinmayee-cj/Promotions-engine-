import 'dotenv/config';

export const config = {
  port: process.env.PORT || 8085, // Changed default port to 8085
  nodeEnv: process.env.NODE_ENV || 'development',
  rulesFile: process.env.RULES_FILE || './rules.yml'
};
