module.exports = function(app) {
    var submission = require('../controllers/SubmissionController');

    app.route('/submissions')
        .get(submission.list_all_submissions)
        .post(submission.create_a_submission);
};