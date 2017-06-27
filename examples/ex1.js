import request from 'superagent';

/*
request.post('/user')
    .set('Content-Type', 'application/json')
    .send('{"name":"tj","pet":"tobi"}')
    .end(callback)

*/
request('GET', 'https://google.com').then(
    function(details) { console.log(details) },
    function(error) { console.log(error)}
);

/*
request('POST', 'localhost:3000/').then(
    function(details) { console.log(details) },
    function(error) { console.log(error)}
);
*/
