/***********************************
  *
  * JS file for the dblist interface
  *
  **********************************/


/************
  * Variables
  ************/

  //$.couch.urlPrefix = "http://admin:admin@localhost:5984";
  var appdb = "ba";
  var searchresults = {"rows":[]};
  var docstemp = [];
  var tries = 0;


$(document).ready(function () {

  $('#createdbview').hide();             // hide layoutform
  getSammlungen()

/*******************
  * Action Listeners
  ******************/

  $('#dblv-newdbbtn').click(dblvNewdb);
  $('#dblv-newdbsubmitbtn').click(function() {
    var dbi = $('#dblv-newdbval').val();
    if(dbi != "" && dbi != " ") {
      getDb_by_name(dbi, addSammlung);  
    } else {
      alert("Der Name sollte mindestens eine Zahl oder einen Buchstaben enthalten.");
    }
    
  });
  $('#deletebtn').live('click',function(e){       // is done in list-renderfunction
    e.preventDefault();
    console.log('deletebtn: '+$(this).attr("name"))
    getDocs_by_db($(this).attr("name"));
  });
  $('#dbsearchbtn').click(search);  
  $('#resetsearch').live('click',function(e){       // is done in list-renderfunction
    e.preventDefault();
    resetsearch();
  });


});


/*******************
  * Layout functions
  ******************/


function dblvNewdb() {
  $('#dblv-newdbval').val('');
  $('#createdbview').show();
  return false;
};

function deletebutton(docs, dbi) {
  var amount = docs.length>=3 ? (docs.length-2) : 0;
  if(confirm('[OK] drücken um den Katalog "'+dbi+'" mit '+amount+' Einträgen zu löschen.')) {
    deleteSammlungDocs(docs);
    return false;
  }  
};

function search() {
  var searchstring = $('#dbsearch').val();
  searchresults.rows = docstemp.rows.slice(0);
  searchresults.rows = searchresults.rows.filter(function(obj) {
    if (obj.doc.title.indexOf(searchstring)!== -1) {
      return true;
    } else {
      return false;
    }

  });
  $('#dblist fieldset legend').html('Suchergebnisse für "'+searchstring+'"')
  renderList(searchresults);
  $('#resetsearch').show();
  return false;
}

function resetsearch() {
  $('#dblist fieldset legend').text('Kataloge')
  $('#resetsearch').hide();
  $('#dbsearch').val('');
  renderList(docstemp);
  return false;
}

function popup(text, color) {
  $('#popup').val('');
  $('#popup').text(text);
  $('#popup').css('color',color);
  $('#popup').fadeIn(300).delay(1000).fadeOut(300);
}


/*****************
  * Call functions
  ****************/

function getSammlungen() {
  $.couch.db(appdb).view(appdb+'/db_by_name?include_docs=true', {
      success: function(data){
        docstemp = data;
        renderList(docstemp);
      },
      error: function( jqXHR, textStatus, errorThrown ) {
        console.log('getSammlungen fail: '+ textStatus);
      }
    });
}

function getDocs_by_db(dbi) {
  $.couch.db(appdb).view(appdb+'/all_docs_by_db?include_docs=true&key="'+dbi+'"', {
    success: function(data){
      console.log(data);
      var docstemp = [];
      $.each(data.rows, function(index, doc) {
        docstemp.push(doc.doc);
      });
      console.log(docstemp);
      deletebutton(docstemp, dbi);
    },
    error: function( jqXHR, textStatus, errorThrown ) {
      
      console.log('getDocsByID fail: '+ textStatus);
    }
  });
}

function getDb_by_name(dbi, functionname) {
  $.couch.db(appdb).view(appdb+'/db_by_name?include_docs=true&key="'+dbi+'"', {
    success: function(data){
      var temp = data.rows;
      console.log(temp);
      functionname(temp);
    },
    error: function( jqXHR, textStatus, errorThrown ) {
      console.log('getDocsByID fail: '+ textStatus);
    }
  });
}

function addSammlung(dupl) {
  var doc = $.parseJSON(newSammlungToJSON());
  if(dupl.length == 0) {
    console.log(doc);
    $.couch.db(appdb).saveDoc(doc, {
      success: function() {
        console.log("db created");
        $('#createdbview').hide(); 
        getSammlungen();
        popup("Gespeichert", "#3CFF00");
      },
      error: function(jqXHR, textStatus, errorThrown){
        console.log('create db error: '+errorThrown);
      }
    })
  } else {alert("Einen Katalog mit diesem Namen gibt es schon!");}
}

function deleteSammlungDocs(docs) {
  console.log('deleteDocs');

  $.couch.db(appdb).bulkRemove({"docs": docs}, {
    success: function() {
      console.log("docs deleted");
      getSammlungen();
      popup("Gelöscht", "#FF8383");
      tries = 0;
    },
    error: function(jqXHR, textStatus, errorThrown){
      if (tries<1) {deleteSammlungDocs(docs);};
      tries = 1;
      console.log('delete db error: '+errorThrown);
    }
  })
}


/*******************
  * Render functions
  ******************/

function renderList(data) {
  // JAX-RS serializes an empty list as null, and a 'collection of one' as an object (not an 'array of one')
  console.log("renderList");
  $("#dblist fieldset table tbody tr").remove();
  var list = "";
  $.each(data.rows, function(index, sammlung) {
    list += '<tr><td id="listdbtitle">'+sammlung.key+'</td><td><span class="btn-group unit-push-right">';
    list += '<a href="#" id="deletebtn" name="'+sammlung.key+'" class="btn"><i class="icon-remove"></i> Löschen</a>'; 
    list += '<a href="./show/'+sammlung.key+'" class="btn rel"><i class="icon-eye-open"></i> Anzeigen&nbsp;&nbsp;&nbsp;<span class="buttonright"></span></a></span></td></tr>';
    
  });
  $("#dblist fieldset table tbody").html('');
  $("#dblist fieldset table tbody").append(list);
  if (data.total_rows==0) {
    $("#dblist fieldset table tbody").html('Es gibt noch keinen Katalog!');
  };
}

jQuery('#dblv-newdbval').keyup(function() {
    var raw_text =  jQuery(this).val();
    var return_text = raw_text.replace(/[^a-zA-Z0-9 _-]/g,'');
    jQuery(this).val(return_text);
});

/*******************
  * toJSON functions
  ******************/
  // Helper function to serialize all the form fields into a JSON string

function newSammlungToJSON() { 
  var data = JSON.stringify({
    //"_id": $('#dblv-newdbval').val(),
    "type": "datenbank",
    "title": $('#dblv-newdbval').val(),
    "edit": false,
    "sortby": "Erstellt", 
    "asc": true,
    "collapse": ["Aktualisiert"]
  });
  return data;
}
