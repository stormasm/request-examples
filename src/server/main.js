import express from 'express';
import graphqlHTTP from 'express-graphql';

/*
import {
    GithubSchema
} from '../schema/githubSchema';
*/

import {
    TestSchema
} from '../schema/testSchema';

const app = express();

// Requests to /graphql redirect to /
app.all('/graphql', (req, res) => res.redirect('/'));

app.use(
  '/',
  graphqlHTTP(() => ({
    schema: TestSchema,
    graphiql: true,
  })),
);

// Listen for incoming HTTP requests

const listener = app.listen(3000);
const port = listener.address().port;
/* eslint-disable no-console */
console.log('Listening on port ' + port);
