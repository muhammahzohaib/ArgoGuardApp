const fs = require('fs');
const path = require('path');

// Ensure target logs directory exists
const logDir = path.join(__dirname, '../../../logs');
const logFile = path.join(logDir, 'argoguard.log');

try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
} catch (err) {
  console.error('Failed to create logs directory:', err.message);
}

const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const metaString = meta ? ` | Meta: ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
};

const writeToLogFile = (formattedMessage) => {
  try {
    fs.appendFileSync(logFile, formattedMessage + '\n', 'utf8');
  } catch (err) {
    console.error('Failed to write log to file:', err.message);
  }
};

const logger = {
  info: (message, meta) => {
    const formatted = formatMessage('info', message, meta);
    console.log(formatted);
    writeToLogFile(formatted);
  },
  warn: (message, meta) => {
    const formatted = formatMessage('warn', message, meta);
    console.warn(formatted);
    writeToLogFile(formatted);
  },
  error: (message, meta) => {
    const formatted = formatMessage('error', message, meta);
    console.error(formatted);
    writeToLogFile(formatted);
  },
  debug: (message, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      const formatted = formatMessage('debug', message, meta);
      console.log(formatted);
      writeToLogFile(formatted);
    }
  }
};

module.exports = logger;

