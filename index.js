const Transport = require('winston-transport')
const LogAnalytics  = require('loganalytics');


class LogAnalyticsTransport extends Transport {
    constructor (options) {
        super(options)
        this._apiVersion = options.apiVersion || "2016-04-01";
        this._timeGeneratedField = options.timeGeneratedField || "TimeGenerated [UTC]";
        this._timeout = options.timeout || 1000;
        this._logType = options.logType;
        this._loganalystics = new LogAnalytics(
            options.workspaceID,
            options.sharedKey,
            this._apiVersion
        )
    }
    log (info, callback) {
        callback = callback || function(){};
        if (this.silent) {
            return callback(null, true);
        }
        var message = JSON.parse(info.message)
        message[this._timeGeneratedField] = info.timestamp;
        setTimeout(() => {
            this._loganalystics.postLog(
                message,
                this._logType,
                this._timeGeneratedField
            )
            .then(result => {
                this.emit('logged', info);
            })
            .catch(err => {
                this.emit('warn', err);
            })
            .finally(() => {
                setImmediate(callback);
            })
        }  , this._timeout);
    }
}
module.exports = LogAnalyticsTransport
