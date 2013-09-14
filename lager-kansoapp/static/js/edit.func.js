/**********************************
  *
  * JS file for the edit interface
  *
  *********************************/

  /************
  * Variables
  ***********/

  //var rootURL = '{baseURL}';
  //$.couch.urlPrefix = "http://admin:admin@localhost:5984";
  var appdb = "ba";
  var db = $('#db').text();  
  
  var layout = [];
  var templayout = [];
  var layoutid = "";
  var layoutrev = "";
  
  var currententry = {};
  var currid = "";
  var currrev = "";
  var currcreated = "";
  
  dbdoc = {_id: "", _rev: "", title: db, type: "datenbank", edit: false, sortby: "", collapse: ["Aktualisiert"] };
  
  var multientr = false;
  var docstemp = [];
  var searchresults = [];

$(document).ready(function () {

  $('#layoutview').hide();
  $('#layoutviewhelp').hide();             // hide layoutform
  $('#adddataview').hide();
  $('#dataviewhelp').hide();
  $('#searchview').hide();
  $('#edithead').hide();
  $('.editbtns').hide();
  getDb();
  


  /*******************
   * Action Listeners
   ******************/

  $('#changeviewbtn').click(changeview);
  $('#newentrybtn').click(newentry);
  $('#layouteditbtn').click(layouteditbutton);
  $('#layoutviewhelpbtn').click(layoutviewhelpbutton);
  $('#previeweditbtn').live('click',function(e){   
    e.preventDefault();
    var index = $(this).attr('name');
    editpreview(index);
  });
  $('#editlayoutfieldbtn').click(editpreviewbutton);
  $('#createlayoutbtn').click(layouteditbutton);
  $('#searchviewbtn').click(searchview);
  $('#deleteentrybtn').live('click',function(e){  
    e.preventDefault();
    if(confirm('[OK] drücken um den Eintrag zu löschen.')) {
      getEntry($(this).attr("name"), deleteEntry);
      return false;
    }
  });
  $('#editentrybtn').live('click',function(e){   
    e.preventDefault();
    getEntry($(this).attr("name"), renderEntryForm);
  });
  $('#adddatasubmitbtn').live('click',function(e){   
    e.preventDefault();
    adddatabutton();
  });
  $('#addlayoutfieldbtn').click(addlayoutfield);
  $('#layoutsavebtn').click(createLayout);
  $('#previewdeletebtn').live('click',function(e){   
    e.preventDefault();
    console.log('deletebtn: '+$(this).attr("name"));
    deletepreview($(this).attr("name"));
  });
  $('#moveup').live('click',function(e){      
    e.preventDefault();
    move($(this).attr("name"), parseInt($(this).attr("name"))+1);
  });
  $('#movedown').live('click',function(e){       
    e.preventDefault();
    move($(this).attr("name"), parseInt($(this).attr("name"))-1);
  });

  $('.showcolslink').live('click',function(e){       
    e.preventDefault();
    console.log('collapse: '+$(this).attr("id"));
    collapse($(this).attr("id"));
  });
  $('.sortcolslink').live('click',function(e){       
    e.preventDefault();
    console.log('sort: '+$(this).attr("id"));
    var s_id = $(this).attr("id").split('-');
    dbdoc.sortby = s_id[1];
    sortby();
  });

  $('#searchbtn').click(search);
  $('#finesearchbtn').click(finesearch);  
  $('#resetsearch').live('click',function(e){       
    e.preventDefault();
    resetsearch();
  });


});


/*******************
  * Layout functions
  ******************/

function layoutviewhelpbutton() {
  $('#layoutviewhelp').show();
  //VIMEO-SIZING
  var vimeowidth = $('#vimeocanvas').width();
  // console.log(vimeowidth);
  //$('#vimeo').attr('width', parseInt(vimeowidth)).attr('height', parseInt(vimeowidth*0.7));
  $('#vimeocanvas').html('<iframe src="http://player.vimeo.com/video/71923022?byline=0&amp;portrait=0&amp;color=cccccc" id="vimeo" width="'+vimeowidth+'" height="'+parseInt(vimeowidth*0.7)+'" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
  return false;
}

function layouteditbutton() {
  $('#layoutview').show();
  $('#adddataview').hide();
  $('#searchview').hide();
  getLayout();
  if(layout.length<1){
    $('#layoutviewhelp').show();
    $('#layoutsavebtn').val('Tabelle erstellen');
  } else {
    $('#layoutsavebtn').val('Tabelle speichern');
  }
  renderLayoutPreview();
}

function editpreview(index) {
  $('#layoutviewedit').show();
  $('#layoutvieweditform input[type=text]').val(templayout[index].name);
  $('#layoutfieldedittype').val(templayout[index].type);
  $('#layoutvieweditindex').val(index);
}
function editpreviewbutton() {
  var index = $('#layoutvieweditindex').val();
  templayout[index].name = $('#layoutvieweditform input[type=text]').val();
  templayout[index].type = $('#layoutfieldedittype').val();
  renderLayoutPreview();
  $('#layoutviewedit').hide();
  popup("Gespeichert", "#3CFF00");
}

function addlayoutfield() {
  var layoutfieldname = $('#layoutfieldname').val();
  var layoutfieldtype = $('#layoutfieldtype').val();
  var exists;
  for (var i = 0; i < templayout.length; i++) {
    if(templayout[i].name == layoutfieldname) {
      exists = true;
    }
  };
  if (exists==true) {
    alert('Ein Feld mit diesem Namen existiert bereits.');
  } else if(layoutfieldname=='') {
    alert('Eine Spalte muss einen Namen haben.');
  } else {
    $('#layoutfieldname').val('');
    $('#layoutfieldtype').val('');
    templayout.push({name:layoutfieldname, type:layoutfieldtype});
    renderLayoutPreview();  
  }
  return false;
}
function move(from, to) {
  console.log(from+'->'+to);
  if(to>=0 && to<=templayout.length) {
    var tempname = templayout[from].name;
    var temptype = templayout[from].type;
    templayout[from].name = templayout[to].name;
    templayout[from].type = templayout[to].type;
    templayout[to].name = tempname;
    templayout[to].type = temptype;
    renderLayoutPreview();
  }
  return false;
}
function deletepreview(i) {
  if(confirm('[OK] drücken um die Spalte "'+templayout[i].name+'" zu löschen. Bereits eingegebene Daten dieser Spalte werden lediglich ausgeblendet, aber NICHT gelöscht!')) {
    templayout.splice(i,1);
    renderLayoutPreview();
    return false;
  }
}

function changeview() {
  $('#searchview').hide();
  if ($('#editstate').val() == true) {
    $("#titlejob").text('bearbeiten');
    $('#edithead').show().css('-webkit-transform','scale3d(1,1,1)');
    $('.editbtns').show();
    dbdoc.edit = true;
    saveDb();
  } else {
    $("#titlejob").text('betrachten');
    $('#edithead').hide();
    $('.editbtns').hide();
    $('#changeviewbtn').removeClass().addClass('btn btn-blue');
    dbdoc.edit = false;
    saveDb();
  }
  return false;
};

function collapse(collapse_id) {
  var c_id = collapse_id.split('-');
  c_id = c_id[1];
  var index = $.inArray(c_id, dbdoc.collapse);
  if(index!="-1") {
    dbdoc.collapse.splice(index, 1);
    $("#"+collapse_id).animate({ width: '+=100' }, 200 );
  } else {
    dbdoc.collapse.push(c_id);
    $("#"+collapse_id).parent().hide( 200 );
  };
  setTimeout(function(){
    saveDb();
    renderTable(docstemp);
  }, 200);
  
  return false;
};

function sortby() {
  
  if (dbdoc.sortby == "Erstellt") {
    if (dbdoc.asc == true) {
      docstemp = docstemp.sort(function(a, b){
       var dateA=new Date(a.created), dateB=new Date(b.created)
       return dateA-dateB; //sort by date ascending
      })
      dbdoc.asc = false;
    } else {
      docstemp = docstemp.sort(function(a, b){
       var dateA=new Date(a.created), dateB=new Date(b.created)

       return dateB-dateA;
      })
      dbdoc.asc = true;
    }
  } else if (dbdoc.sortby == "Aktualisiert") {
    if (dbdoc.asc == true) {
      docstemp = docstemp.sort(function(a, b){

        if (isNaN(a.updated)==false) {
            var dateA = new Date(a.updated);
        } else { var dateA = "" }
        if (isNaN(b.updated)==false) {
            var dateB = new Date(b.updated);
        } else { var dateB = "" }

        //var dateA=new Date(a.updated), dateB=new Date(b.updated);
        return dateA-dateB; //sort by date ascending
      })
      dbdoc.asc = false;
    } else {
      docstemp = docstemp.sort(function(a, b){

        if (isNaN(a.updated)==false) {
            var dateA = new Date(a.updated);
        } else { var dateA = "" }
        if (isNaN(b.updated)==false) {
            var dateB = new Date(b.updated);
        } else { var dateB = "" }

        //var dateA=new Date(a.updated), dateB=new Date(b.updated);
        return dateB-dateA; //sort by date ascending
      })
      dbdoc.asc = true;
    }
  } else {

    // Get datatype of field
    var type = $.grep(layout, function(n) { return n.name == dbdoc.sortby; });
    type = type[0].type;
    
    if ((type == "Nummer" && dbdoc.asc == true) || (type == "Preis" && dbdoc.asc == true)) {
      docstemp = docstemp.sort(function(a,b){return a.data[dbdoc.sortby]-b.data[dbdoc.sortby]});
      dbdoc.asc = false;
    } else if ((type == "Nummer" && dbdoc.asc == false) || (type == "Preis" && dbdoc.asc == false)) {
      docstemp = docstemp.sort(function(a,b){return b.data[dbdoc.sortby]-a.data[dbdoc.sortby]});
      dbdoc.asc = true;
    } else if (type != "Nummer" && dbdoc.asc == true) {
      docstemp = docstemp.sort(function(a, b){
        var nameA=a.data[dbdoc.sortby].toLowerCase(), nameB=b.data[dbdoc.sortby].toLowerCase()
        if (nameA > nameB) //sort string ascending
          return -1; 
        if (nameA < nameB)
          return 1;
        return 0 //default return value (no sorting)
      })
      dbdoc.asc = false;
    } else if (type != "Nummer" && dbdoc.asc == false) {
      docstemp = docstemp.sort(function(a, b){
        var nameA=a.data[dbdoc.sortby].toLowerCase(), nameB=b.data[dbdoc.sortby].toLowerCase()
        if (nameA < nameB) //sort string ascending
          return -1;
        if (nameA > nameB)
          return 1;
        return 0 //default return value (no sorting)
      })
      dbdoc.asc = true;
    }

  }

  saveDb();
  renderTable(docstemp);

  return false;
}

function viewoptions() {
  if (dbdoc.edit==true) {
    $('#editstate').val(true);
    $("#titlejob").text('bearbeiten');
    $('#edithead').show().css('-webkit-transform','scale3d(1,1,1)');
    $('.editbtns').show();
    $('#changeviewbtn').removeClass().addClass('btn btn-active');
  };
  // if (dbdoc.dates==false) {
  //   $('.dateshead').hide();
  //   $('.datescols').hide();
  //   $('#showdatesbtn').removeClass().addClass('btn');
  // };

  return false;
};

function newentry() {
  $('#layoutview').hide();
  $('#searchview').hide();
  renderEntryForm();
  return false;
};
function adddatabutton() {
  currententry = {};
  currententry = JSON.parse(parseEntryFormToJSON());
  addEntry(currententry);
  if ($('#multientries').is(':checked')) {
    multientr = true;
    renderEntryForm();
  } else {
    $('#adddataview').hide();
    multientr = false;
  }
  return false;
};

function searchview() {
  $('#layoutview').hide();
  $('#adddataview').hide();
  $('#searchview').show();
  $('#finesearchcols').html('');
  $.each(layout, function(index, elem) {
    $('#finesearchcols').append('<option>'+elem.name+'</option>');
  });

  return false;
};

 function deletebutton() {
  if(confirm('[OK] drücken um den Eintrag zu löschen.')) {
    $('#edit').hide();
    deleteEntry();
    return false;
  }
};

 function changebutton() {
  if(confirm('[OK] drücken um den Eintrag zu bearbeiten.')) {
    $('#edit').hide();
    deleteEntry();
    return false;
  }
};


function search() {
  var searchstring = $('#searchval').val();
  searchresults = docstemp.slice(0);
  searchresults = searchresults.filter(function(obj) {
    var match = "";
    for (key in obj.data) {
      if (obj.data[key].indexOf(searchstring)!== -1) {
        return true;
      }
    };
    return false;
  });
  $('#searchhead').remove();
  $('#docstable').before('<span id="searchhead"><strong>Suchergebnisse für "'+searchstring+'"</strong></span>');
  console.log(searchresults);
  renderTable(searchresults);
  $('#resetsearch').show();
  return false;
}

function finesearch() {
  var searchstring = $('#finesearchval').val();
  var searchcol = $('#finesearchcols').val();
  dbdoc.sortby = searchcol;
  sortby();
  searchresults = docstemp.slice(0);
  searchresults = searchresults.filter(function(obj) {
    if (obj.data[searchcol].indexOf(searchstring) !== -1) {
      return true;
    } else {
      return false;
    }
  });
  $('#searchhead').remove();
  $('#docstable').before('<span id="searchhead"><strong>Suchergebnisse für "'+searchstring+'" in '+searchcol+'</strong></span>');
  renderTable(searchresults);
  $('#resetsearch').show();
  $('#searchview').hide();
  return false;
}
function resetsearch() {
  $('#docstable').before('');
  $('#resetsearch').hide();
  $('#searchval').val('');
  $('#finesearchval').val('');
  $('#searchhead').remove();
  renderTable(docstemp);
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

function getDb() {
  $.couch.db(appdb).view(appdb+'/db_by_name?include_docs=true&key="'+db+'"', {
    success: function(data){
      var temp = data.rows;
      if (temp.length >= 1 && temp[0].doc.title == db) {
        dbdoc = temp[0].doc;
        getLayout();
        viewoptions();
      } else {
        $("#docstable fieldset").remove();
        $("#changeviewbtn").hide();
        $("#docstable").show().html('<h3 class="color-red">&nbsp;&nbsp;Den gewählten Katalog "'+db+'" gibt es nicht!</h3>');
      };
    },
    error: function( jqXHR, textStatus, errorThrown ) {
      console.log('getDocsByID fail: '+ textStatus);
    }
  });
}

function saveDb() {
  $.couch.db(appdb).saveDoc(dbdoc, {
    success: function() {
      console.log('dbdoc saved');
      return true;
    },
    error: function(jqXHR, textStatus, errorThrown){
      console.log('save dbdoc error: '+errorThrown);
      return false;
    }
  });
}

function getLayout() {
  $.couch.db(appdb).view(appdb+'/layout_by_dbname?include_docs=true&key="'+db+'"', {
      success: function(data){
        if (data.rows.length >= 1) {
          layout = [];
          templayout = [];
          $.each(data.rows[0].doc.layout, function(index, elem) {
            layout.push(elem);
            templayout.push(elem);
          });
          layoutid = data.rows[0].doc._id;
          layoutrev = data.rows[0].doc._rev;
          $("#docstable").show();
          $("#changeviewbtn").show();
          $("#nolayoutyet").hide();
          if(docstemp.length==0) {getTable();} else {renderTable;docstemp};
        } else {
          $("#docstable").hide();
          $("#layoutview").show();
          $("#changeviewbtn").hide();
          layoutviewhelpbutton();
        };       
      },
      error: function( jqXHR, textStatus, errorThrown ) {
        console.log('getLayout fail: '+ textStatus);
      }
    });
}

function createLayout() {
  if (templayout.length<1) {
    alert('Die Tabelle muss mindestens eine Spalte enthalten.');
  } else {
    var data;
    if (layoutid!="" && layoutrev!="") {
      data = JSON.stringify({
        _id: layoutid,
        _rev: layoutrev,
        type: "layout",
        datenbank: db,
        layout: templayout
      });
    } else {
      data = JSON.stringify({
        type: "layout",
        datenbank: db,
        layout: templayout
      });
    }
    var layouttodb = $.parseJSON(data);
    $.couch.db(appdb).saveDoc(layouttodb, {
      success: function() {
        console.log("layout created");
        layout = templayout;
        getLayout();
        renderTable(docstemp);
        $('#layoutview').hide();
        $('#layoutviewhelp').hide(); 
        popup("Gespeichert", "#3CFF00");
      },
      error: function(jqXHR, textStatus, errorThrown){
        console.log('create layout error: '+errorThrown);
      }
    });
  };
}


function getTable() {
  $.couch.db(appdb).view(appdb+'/docs_by_db?include_docs=true&key="'+db+'"', {
      success: function(data){
        console.log('getTable');
        docstemp = [];
        $.each(data.rows, function(index, doc) {
          if(doc.doc.type == "doc") {
            docstemp.push(doc.doc);
          }
        });
        sortby();
      },
      error: function( jqXHR, textStatus, errorThrown ) {
        console.log('getLayout fail: '+ textStatus);
      }
    });
}

function getEntry(id, functionname) {
  $.couch.db(appdb).openDoc(id, {
    success: function(data) {
      functionname(data);
    },
    error: function(jqXHR, textStatus, errorThrown){
      console.log('get doc error: '+errorThrown);
    }
  });
}

function addEntry(doc) {
  $.couch.db(appdb).saveDoc(doc, {
    success: function(data) {
      console.log('doc created: '+data.id+', '+data.rev);
      var exists = false;
      for(var i = 0; i < docstemp.length; i++) {
        if(docstemp[i]._id == data.id) {
          docstemp[i]._rev = data.rev;
          docstemp[i].data = doc.data;
          docstemp[i].updated = new Date().getTime();
          exists = true;
        }
      }
      if(exists == false) {
        doc.created = new Date().getTime();
        var tempdoc = doc;
        tempdoc._id = data.id;
        tempdoc._rev = data.rev;
        docstemp.push(tempdoc);
      }
      currid = "";
      currrev = "";
      currcreated = "";
      if(docstemp==[]) {getTable()} else {renderTable(docstemp)};
      popup("Gespeichert", "#3CFF00");
    },
    error: function(jqXHR, textStatus, errorThrown){
      console.log('save doc error: '+errorThrown);
    }
  });
}

function deleteEntry(doc) {
  console.log('deleteEntry');
  $.couch.db(appdb).removeDoc(doc, {
    success: function(data) {
      console.log('doc deleted: '+data.id+', '+data.rev);
      for(var i = 0; i < docstemp.length; i++) {
        if(docstemp[i]._id == data.id) {
          docstemp.splice(i,1);
        }
      }
      currid = "";
      currrev = "";
      currcreated = "";
      if(docstemp==[]) {getTable()} else {renderTable(docstemp)};
      popup("Gelöscht", "#FF8383");
    },
    error: function(jqXHR, textStatus, errorThrown){
      console.log('save doc error: '+errorThrown);
    }
  });
}


/*******************
  * Render functions
  ******************/

function renderTable(data) {
  // JAX-RS serializes an empty list as null, and a 'collection of one' as an object (not an 'array of one')
  console.log("renderTable");

  $("#docstable table thead tr th").remove();
  var list = "";
  $.each(layout, function(index, elem) {
    var collapsed = false;
    for (var i = 0; i < dbdoc.collapse.length; i++) {
      if(dbdoc.collapse[i]==elem.name){
        collapsed = true;
      }
    };
    if (collapsed == true) {
      list += '<th class="unit-row collapsedhead" id="'+elem.name+'"><a href="#" class="color-gray-light showcolslink" id="collapse-'+elem.name+'"><i class="icon-eye-open"></i><span class="tooltip">Zeige '+elem.name+'</span></a></th>';
    } else {
      list += '<th class="unit-row" id="'+elem.name+'">'+elem.name+'&nbsp;&nbsp;<span class="unit-push-right"><a href="#" class="color-gray-light showcolslink" id="collapse-'+elem.name+'"><i class="icon-eye-close"></i><span class="tooltip">Verberge '+elem.name+'</span></a>&nbsp;&nbsp;<a href="#" class="color-gray-light sortcolslink" id="sort-'+elem.name+'"><i class="icon-sort"></i><span class="tooltip">Sortiere nach '+elem.name+'</span></a></span></th>';
    }
  });
  if ($.inArray("Erstellt", dbdoc.collapse)!="-1") {
    list += '<th class="unit-row collapsedhead" id="Erstellt"><a href="#" class="color-gray-light showcolslink" id="collapse-Erstellt"><i class="icon-eye-open"></i><span class="tooltip">Zeige Erstellt</span></a></th>';
  } else {
    list += '<th class="unit-row" id="Erstellt">Erstellt&nbsp;&nbsp;<span class="unit-push-right"><a href="#" class="color-gray-light showcolslink" id="collapse-Erstellt"><i class="icon-eye-close"></i><span class="tooltip">Verberge Erstellt</span></a>&nbsp;&nbsp;<a href="#" class="color-gray-light sortcolslink" id="sort-Erstellt"><i class="icon-sort"></i><span class="tooltip">Sortiere nach Erstellungsdatum</span></a></span></th>';
  }
  if ($.inArray("Aktualisiert", dbdoc.collapse)!="-1") {
    list += '<th class="unit-row collapsedhead" id="Aktualisiert"><a href="#" class="color-gray-light showcolslink" id="collapse-Aktualisiert"><i class="icon-eye-open"></i><span class="tooltip">Zeige Aktualisiert</span></a></th>';
  } else {
    list += '<th class="unit-row" id="Aktualisiert">Aktualisiert&nbsp;&nbsp;<span class="unit-push-right"><a href="#" class="color-gray-light showcolslink" id="collapse-Aktualisiert"><i class="icon-eye-close"></i><span class="tooltip">Verberge Aktualisiert</span></a>&nbsp;&nbsp;<a href="#" class="color-gray-light sortcolslink" id="sort-Aktualisiert"><i class="icon-sort"></i><span class="tooltip">Sortiere nach Aktualisierungsdatum</span></a></span></th>';
  }
  $("#docstable table thead tr").append(list+'<th class="editbtns"></th>');

  $("#docstable table tbody tr").remove();
  var list = "";
  $.each(data, function(index, doc) {
    var row = "";
    for (var i = 0; i < layout.length; i++) {
      var collapsed = false;
      for (var j = 0; j < dbdoc.collapse.length; j++) {
        if(dbdoc.collapse[j]==layout[i].name){
          collapsed = true;
        }
      }
      if (collapsed == true) {
        row += '<td class="collapsedtr"></td>';
      } else {
        var mail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        var url = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        var dateregex = /([0-9]{4})-([0-9]{2})-([0-9]{2})/i;
        var str = "";
        var text = doc.data[layout[i].name];
        if ( mail.test(text) ) {
          str = '<a href="mailto:'+doc.data[layout[i].name]+'">'+doc.data[layout[i].name]+'</a>' ;
        } else if ( url.test(text) ) {
          str = '<a href="'+doc.data[layout[i].name]+'" target="_blank">'+doc.data[layout[i].name]+'</a>';
        } else if ( layout[i].type=="Datum" && text!="" && dateregex.test(text) ) {
          var arr = text.split("-");
          str = arr[2]+'.'+arr[1]+'.'+arr[0];
        } else {
          str = text;
        }

        row += '<td>'+str+'</td>';
      }
    };
    list += '<tr>'+row;
    
    if ($.inArray("Erstellt", dbdoc.collapse)!="-1") {
      list += '<td class="collapsedtr"></td>';
    } else {
      var created = "";
      if (doc.created!=undefined) {created = moment(doc.created).format('DD.MM.YYYY HH:mm');};
      list += '<td class="datescols">'+created+'</td>';
    }
    if ($.inArray("Aktualisiert", dbdoc.collapse)!="-1") {
      list += '<td class="collapsedtr"></td>';
    } else {
      var updated = "";
      if (doc.updated!=undefined) {updated = moment(doc.updated).format('DD.MM.YYYY HH:mm');};
      list += '<td class="datescols">'+updated+'</td>';
    }

    list += '<td class="editbtns"><span class="btn-group unit-push-right">';
    list += '<button type="button" class="btn" id="editentrybtn" name="'+doc._id+'"><i class="icon-edit"></i><span class="tooltip">Bearbeiten</span></button>';
    list += '<button type="button" class="btn red" id="deleteentrybtn" name="'+doc._id+'" alt="Löschen"><i class="icon-remove"></i><span class="tooltip">Löschen</span></button>';
    list += '</span></td></tr>';
    $("#docstable table tbody").html(list);
  });
  
  if (dbdoc.edit==true) {
    $('#edithead').show();
    $('.editbtns').show();
  } else {
    $('#edithead').hide();
    $('.editbtns').hide();
  }

  if($('#docstable table').width() > $('#docstable').width()) {
    $('#docstable').addClass('docstable-shadow');
  } else {
    $('#docstable').removeClass('docstable-shadow');
  }
  
  if ($('#searchhead').length>0) {
    $("#nosearchresults").show();
  } else {
    $("#nosearchresults").hide();
  }

  if (data.length < 1) {
    if ($('#searchhead').length>0) {
      $("#nosearchresults").show();
    } else {
      $("#noentriesyet").show();
    }
  } else {
    $("#nosearchresults").hide();
    $("#noentriesyet").hide();
  }

  $('th[id="'+dbdoc.sortby+'"]').addClass('sortedcol');
}

function renderLayoutPreview() {
  console.log('renderLayoutPreview');
  if (templayout<1) {
    $("#layoutpreview thead tr th").remove();
    $("#layoutpreview tbody tr td").remove();
    $("#layoutpreview thead tr").append('<th>Leere Vorschautabelle</th>');
  } else {
    $("#layoutpreview thead tr th").remove();
    $("#layoutpreview tbody tr td").remove();
  }
  var heads = "";
  var list = "";
  for (var i = 0; i < templayout.length; i++) {
    heads += '<th><span class="btn-group previewbtn"><a id="previeweditbtn" name="'+i+'" class="btn btn-small" alt="Bearbeiten"><i class="icon-edit"></i><span class="tooltip">Bearbeiten</span></a> ';
    heads += '<a id="previewdeletebtn" name="'+i+'" class="btn btn-small btn=red" alt="Löschen"><i class="icon-remove"></i><span class="tooltip">Löschen</span></a>';
    if(i>=1) {heads += '<a id="movedown" name="'+i+'" class="btn btn-small" alt=Verschieben""><i class="icon-chevron-left"></i><span class="tooltip">Nach links verschieben</span></a>';}
    if(i<templayout.length-1) {heads += '<a id="moveup" name="'+i+'" class="btn btn-small"><i class="icon-chevron-right"></i><span class="tooltip">Nach rechts verschieben</span></a>';}
    heads += '</span> '+templayout[i].name+'</th>';
    list += '<td>...</td>';
  };
  $("#layoutpreview thead tr").append(heads);
  $("#layoutpreview tbody tr").append(list);

  if($('#layoutpreview').width()>$('#layoutpreviewcontainer').width()) {
    $('#layoutpreviewcontainer').addClass('docstable-shadow');
  } else {
    $('#layoutpreviewcontainer').removeClass('docstable-shadow');
  }

  if (list!="") {
    $("#layoutpreview").hide();
    $('#previewheadline').fadeIn(400);
    $("#layoutpreview").fadeIn(400);
    $('#previewclose').show();
    $('#layoutsavebtn').removeClass('disabled').addClass('btn-blue');
  };
}

function renderEntryForm(item) {
  console.log('renderEntryForm '+item);
  $('#adddataview').show();
  if (layout<1) {
    $("#adddataview form p").remove();
    $("#adddataview form ul").remove();
    $("#adddataview form").html('<th>Es existiert keine Vorlage!</th>');
  } else {
    $("#adddataview form p").remove();
    $("#adddataview form ul").remove();
  }
  var list = "";
  currid = "";
  currrev = "";
  currcreated = "";
  var itemdef = "";
  if (item!=undefined) {
    var entry = item.data;
    currid = item._id;
    currrev = item._rev;
    currcreated = item.created;
    $("#dataviewlegend").text("Eintrag bearbeiten");
  } else {
    $("#dataviewlegend").text("Eintrag erstellen");
  }
  for (var i = 0; i < layout.length; i++) {
    if (item!=undefined) { itemdef = entry[layout[i].name]; };
    switch(layout[i].type) {
      case 'Text':
        list += '<p><label class="bold">'+layout[i].name+'</label>';
        list += '<input type="text" id="'+layout[i].name+'" placeholder="'+layout[i].name+'" value="'+itemdef+'"></p>';
        break;
      case 'Zahl':
        list += '<p><label class="bold" for="'+layout[i].name+'">'+layout[i].name+'</label>';
        list += '<input class="nummer" type="number" id="'+layout[i].name+'" name="'+layout[i].name+'" step="1" value="'+itemdef+'"></p>';
        break;
      // case 'Email':
      //   list += '<p><label class="bold">'+layout[i].name+'</label>';
      //   list += '<input type="email" id="'+layout[i].name+'" value="'+itemdef+'"><span class="forms-desc">zB. "foo@ga.zi"</span></p>';
      //   break;
      // case 'Link':
      //   list += '<p class="forms-inline"><label class="bold">'+layout[i].name+'</label>';
      //   list += '<span class="input-prepend">http://</span><input type="text" name="'+layout[i].name+'" id="'+layout[i].name+'" class="width-80" value="'+itemdef+'"></p>';
      //   break;
      // case 'Tel':
      //   list += '<p><label class="bold" for="'+layout[i].name+'">'+layout[i].name+'</label>';
      //   list += '<input type="tel" id="'+layout[i].name+'" name="'+layout[i].name+'" value="'+itemdef+'"></p>';
      //   break;
      case 'Datum':
        list += '<p><label class="bold" for="'+layout[i].name+'">'+layout[i].name+'</label>';
        list += '<input type="date" id="'+layout[i].name+'"  name="'+layout[i].name+'" value="'+itemdef+'"></p>';
        break;
      case 'Preis':
        list += '<p class="forms-inline"><label class="bold">'+layout[i].name+'</label>';
        list += '<span class="input-prepend"><i class="icon-circle"></i></span><input type="text" class="preis" id="'+layout[i].name+'" value="'+itemdef+'"></p>';
        break;
      case 'Anhang':
        list += '<p><label class="bold" for="'+layout[i].name+'">'+layout[i].name+'</label>';
        list += '<input type="file" id="'+layout[i].name+'" name="'+layout[i].name+'" value="'+itemdef+'"></p>';
        break;
      default:
        list += '<p><label class="bold">'+layout[i].name+'</label>';
        list += '<input type="text" id="'+layout[i].name+'" placeholder="'+layout[i].name+'" value="'+itemdef+'"></p>';
    }
  }

  list += '<div class="units-row" id="dataviewformend"><ul class="forms-inline-list unit-push-right">';
  if (item!=undefined) {
    multientr = false;
    console.log('Eintrag bearbeiten');
  } else {
    console.log('Eintrag erstellen');
    list += '<li><label>Weiteren Eintrag schreiben <input id="multientries" type="checkbox"></label></li>';
  }
  list += '<li><input type="submit" class="btn btn-blue" id="adddatasubmitbtn" value="Speichern"></li>&nbsp;';
  list += '</ul></div>';

  $("#adddataview form").append(list);

  //$('input[class="nummer"]').keyup($(this).value = parseFloat($(this).value.replace(',', '.')));
  //$('input[class="preis"]').keyup(console.log($('input[class="preis"]')));

  $('input[class="preis"]').keyup(function() {
    var raw_text =  $(this).val();
    var return_text = raw_text.replace(",",".");
    $(this).val(return_text);
  });

  if (item==undefined) {

  }
  if (multientr) {
    console.log('checked');
    $('#multientries').attr('checked', true);
  };
}


/*******************
  * toJSON functions
  ******************/
  // Helper function to serialize all the form fields into a JSON string

function parseEntryFormToJSON() {  
  var fields = {};
  for (var i = 0; i < layout.length; i++) {
    var field = $("#adddataview form p *[id='"+layout[i].name+"']").val();
    fields[layout[i].name]=field;
  };
  if (currid!="" && currrev!="") {
    var data = JSON.stringify({
      "_id":currid,
      "_rev":currrev,
      "created":currcreated,
      "updated":new Date().getTime(),
      "type":"doc",
      "data":fields,
      "datenbank":db
    });
  } else {
    var data = JSON.stringify({
      "type":"doc",
      "data":fields,
      "created":new Date().getTime(),
      "datenbank":db
    });
  }
  return data;
}
