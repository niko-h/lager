/**
 * List functions to be exported from the design doc.
 */

var templates = require('duality/templates');


// exports.datenbanken = function (head, req) {

//     log('calling datenbanken list');
//     log(head);

//     start({code: 200, headers: {'Content-Type': 'text/html'}});

//     // fetch all the rows
//     var datenbank, datenbanken= [];

//     while (datenbank = getRow()) {
//         datenbanken.push(datenbank);
//     }

//     // generate the markup for a list of pages
//     var content = templates.render('dblist.html', req, {
//         datenbanken: datenbanken
//     });

//     return {title: 'BA Datenbanken Index', content: content};

// };

// exports.page = function (head, req) {

//     start({code: 200, headers: {'Content-Type': 'text/html'}});
    
//     // fetch row and set page.
//     var row = [];
//     var page;
//     if (row = getRow()) {
//     	page = row.doc
//     }
//     else {
//         return {
//     	    title: '404 - Not Found',
// 	        content: templates.render('404.html', req, {})
//     	};
//     }

//     // generate the markup for the pages
//     var content = templates.render(page.template, req, {
//         page: page
//     });

//     return {title: page.title, content: content};

// };
