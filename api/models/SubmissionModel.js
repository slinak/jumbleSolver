var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SubmissionSchema = new Schema ({
    Text : {
        type: String,
        required: "Must submit text"
    },
    SubmissionDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Submission', SubmissionSchema);