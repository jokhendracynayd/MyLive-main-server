const winston = require("winston");
const mongoose = require("mongoose");
const { createLogger, transports, format } = winston;
const errorLogSchema = new mongoose.Schema({
  timestamp: Date,
  level: String,
  message: String,
});

const ErrorLogModel = mongoose.model('ErrorLog', errorLogSchema);

// Define a custom Winston transport for MongoDB
class MongoDBTransport extends winston.Transport {
  constructor() {
    super();
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);

      // Store log entry in MongoDB
      const errorLog = new ErrorLogModel({
        timestamp: new Date(),
        level: info.level,
        message: info.message,
      });

      errorLog.save().then(() => {
        this.emit('logged', info);
      });

      callback();
    });
  }
}

let logger = null;

if(process.env.MODE==='development'){
  logger = createLogger({
    transports: [
      new transports.Console(), // You can keep the console transport for immediate output
      new MongoDBTransport(),
    ],
    level: 'debug',
    format: format.combine(
      format.timestamp(),
      format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level}: ${message}`;
      })
    ),
  });
}
if(process.env.MODE==='production'){
  logger = createLogger({
    transports: [
      // new transports.Console(), // You can keep the console transport for immediate output
      new MongoDBTransport(),
    ],
    level: 'debug',
    format: format.combine(
      format.timestamp(),
      format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level}: ${message}`;
      })
    ),
  });
}


module.exports = logger;