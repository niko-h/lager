# BA Lager

Description


## Requirements

* Couchdb
* Install [Kanso](http://kan.so)

## Install 

This app uses the Kanso admin to edit your data.  Push the pages and admin apps
to your couch once you cloned or unpacked it:

```
git clone https://github.com/mandric/pages
cd pages
kanso push pages
```

```
git clone https://github.com/mandric/admin
cd admin
kanso push pages 
```

## Usage

JS:
```
var db = require('db');
db
```
db->exports.EventEmitter
  allObs: function (callback) {
  createDatabase: function (name, callback) {
  current: function () {
  deleteDatabase: function (name, callback) {
  encode: function (str) {
  escapeUrlParams: function (obj) {
  guessCurrent: function (loc) {
  newUUID: function (cacheNum, callback) {
  request: function (options, callback) {
  stringifyQuery: function (query) {
  use: function (url) {
  __proto__:Object

```
db.current().saveDoc({_id: 'foo', text: 'bar'}, function () {});

db.current().getDoc('foo', function (err, doc) { console.log(doc); });
```