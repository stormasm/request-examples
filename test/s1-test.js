/* @flow */
/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

// 80+ char lines are useful in describe/it, so ignore in this file.
/* eslint-disable max-len */

import { expect } from "chai";
import { describe, it } from "mocha";
import sinon from "sinon";
import { stringify } from "querystring";
import url from "url";
import zlib from "zlib";
import multer from "multer";
import bodyParser from "body-parser";
import request from "supertest";
import express4 from "express"; // modern
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLError,
  BREAK
} from "graphql";
import graphqlHTTP from "express-graphql";

const QueryRootType = new GraphQLObjectType({
  name: "QueryRoot",
  fields: {
    test: {
      type: GraphQLString,
      args: {
        who: {
          type: GraphQLString
        }
      },
      resolve: (root, { who }) => "Hello " + ((who: any) || "World")
    },
    nonNullThrower: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: () => {
        throw new Error("Throws!");
      }
    },
    thrower: {
      type: GraphQLString,
      resolve: () => {
        throw new Error("Throws!");
      }
    },
    context: {
      type: GraphQLString,
      resolve: (obj, args, context) => context
    },
    contextDotFoo: {
      type: GraphQLString,
      resolve: (obj, args, context) => {
        return (context: any).foo;
      }
    }
  }
});

const TestSchema = new GraphQLSchema({
  query: QueryRootType,
  mutation: new GraphQLObjectType({
    name: "MutationRoot",
    fields: {
      writeTest: {
        type: QueryRootType,
        resolve: () => ({})
      }
    }
  })
});

function urlString(urlParams?: ?{ [param: string]: mixed }) {
  let string = "/graphql";
  if (urlParams) {
    string += "?" + stringify(urlParams);
  }
  return string;
}

function promiseTo(fn) {
  return new Promise((resolve, reject) => {
    fn((error, result) => (error ? reject(error) : resolve(result)));
  });
}

function server() {
  const app = express4();
  if (app.set) {
    // This ensures consistent tests, as express defaults json spacing to
    // 0 only in "production" mode.
    app.set("json spaces", 0);
  }
  app.on("error", error => {
    // eslint-disable-next-line no-console
    console.warn("App encountered an error:", error);
  });
  return app;
}

function get(app, ...args) {
  // Connect only likes using app.use.
  return app.get ? app.get(...args) : app.use(...args);
}

function post(app, ...args) {
  // Connect only likes using app.use.
  return app.post ? app.post(...args) : app.use(...args);
}

describe("POST functionality", () => {
  it("allows POST with JSON encoding", async () => {
    const app = server();

    post(
      app,
      urlString(),
      graphqlHTTP({
        schema: TestSchema
      })
    );

    const response = await request(app)
      .post(urlString())
      .send({ query: "{test}" });

    expect(response.text).to.equal('{"data":{"test":"Hello World"}}');
  });

  it("Allows sending a mutation via POST", async () => {
    const app = server();

    post(app, urlString(), graphqlHTTP({ schema: TestSchema }));

    const response = await request(app)
      .post(urlString())
      .send({ query: "mutation TestMutation { writeTest { test } }" });

    expect(response.status).to.equal(200);
    expect(response.text).to.equal(
      '{"data":{"writeTest":{"test":"Hello World"}}}'
    );
  });

  it("allows POST with url encoding", async () => {
    const app = server();

    post(
      app,
      urlString(),
      graphqlHTTP({
        schema: TestSchema
      })
    );

    const response = await request(app)
      .post(urlString())
      .send(stringify({ query: "{test}" }));

    expect(response.text).to.equal('{"data":{"test":"Hello World"}}');
  });
  
});
