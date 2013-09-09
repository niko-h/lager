/**
 * Show functions to be exported from the design doc.
 */

var templates = require('duality/templates');

exports.dblist = function (doc, req) {
    return {
        title: 'Datenbankenübersicht',
        content: templates.render('dblist.html', req, {})
    };
};

exports.show = function (doc, req) {
    // return {
    //   "code": 200,
    //   "body": JSON.stringify(req.query)
    // };
    return {
        title: 'Datenbank betrachten',
        content: templates.render('edit.html', req, {db: req.query.db})
    };
};

exports.not_found = function (doc, req) {
    return {
        title: '404 - Not Found',
        content: templates.render('404.html', req, {})
    };
};

