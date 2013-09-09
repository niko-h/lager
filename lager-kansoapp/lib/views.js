/**
 * Show functions to be exported from the design doc.
 */

exports.all_docs_by_db = {
    map: function(doc) {
      if (doc.type === 'datenbank') {
        emit(doc.title, doc);
      } else if (doc.type === 'layout') {
        emit(doc.datenbank, doc);
      } else if(doc.type==="doc"){
        emit(doc.datenbank, null);
      }
    }
}

exports.docs_by_db = {
    map: function(doc) {
      if(doc.type==="doc"){
        emit(doc.datenbank, null);
      }
    }
}

// exports.search_by_prop = {
//     map: function( doc ){
//       if(doc.type==="doc"){
//         emit([doc.datenbank, doc.data, doc.data[]], null);
//       }
//     }
// }

exports.db_by_name = {
    map: function(doc) {
      if (doc.type === 'datenbank') {
        emit(doc.title, null);
      }
    }
}

exports.layout_by_dbname = {
    map: function(doc) {
      if (doc.type === 'layout') {
        emit(doc.datenbank, null);
      }
    }
}