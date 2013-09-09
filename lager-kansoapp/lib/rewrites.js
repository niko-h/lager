/**
 * Rewrite settings to be exported from the design doc
 */

module.exports = [
    {from: '/static/*', to: 'static/*'},
    {from: '/index.html', to: '_show/dblist'},
    {from: '/', to: '_show/dblist'},
    // {from: '/show/:db', to: '_show/show/:db'},
    {from: '/show/:db', to: '_show/show/:db'},
    {from: '/dblist', to: '_show/dblist'},
    {from: '*', to: '_show/not_found'}
];
