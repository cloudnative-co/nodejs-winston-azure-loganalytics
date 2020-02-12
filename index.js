const Transport = require('winston-transport')
const { LEVEL, MESSAGE } = require('triple-beam');
const LogAnalytics  = require('loganalytics');


class LogAnalyticsTransport extends Transport {
    constructor (options, workspaceId, sharedKey, logType, timeGeneratedField="TimeGenerated [UTC]", apiVersion = '2016-04-01', timeout=1000) {
        super(options)
        this._logType = logType;
        this._timeGeneratedField = timeGeneratedField;
        this._loganalystics = new LogAnalytics(workspaceId, sharedKey, apiVersion)
        this._timeout = timeout;
    }
    log (info, callback) {
        var message = JSON.parse(info[MESSAGE])
        message[this._timeGeneratedField] = new Date().toISOString();
        setTimeout(() => {
            this._loganalystics.postLog(
                message,
                this._logType,
                this._timeGeneratedField
            )
            .then(result => {
                this.last_result = result;
                callback(null);
            })
            .catch(err => {
                console.error(err);
                this.last_result = err;
            })
        }, this._timeout);
    }

}
module.exports = LogAnalyticsTransport
