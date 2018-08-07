var mongoose = require('mongoose'),
    Submission = mongoose.model('Submission');

    exports.create_a_submission = function(req, res) {
        var newSubmission = new Submission(req.body);
        newSubmission.save(function(err, sub) {
            if(err)
                res.send(err);

            res.json(sub);
        });
    };

    exports.list_all_submissions = function(req, res) {
        Submission.find({}, function(err, sub) {
            if(err)
                res.send(err);

            res.json(sub);
        });
    };