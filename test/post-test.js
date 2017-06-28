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

describe("test harness", () => {
  it("resolves callback promises", async () => {
    const resolveValue = {};
    const result = await promiseTo(cb => cb(null, resolveValue));
    expect(result).to.equal(resolveValue);
  });

  it("rejects callback promises with errors", async () => {
    const rejectError = new Error();
    let caught;
    try {
      await promiseTo(cb => cb(rejectError));
    } catch (error) {
      caught = error;
    }
    expect(caught).to.equal(rejectError);
  });
});

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

  describe(`GraphQL-HTTP tests for express`, () => {
    describe("GET functionality", () => {
      it("allows GET with query param", async () => {
        const app = server();

        get(
          app,
          urlString(),
          graphqlHTTP({
            schema: TestSchema
          })
        );

        const response = await request(app).get(
          urlString({
            query: "{test}"
          })
        );

        expect(response.text).to.equal('{"data":{"test":"Hello World"}}');
      });

      it("allows GET with variable values", async () => {
        const app = server();

        get(
          app,
          urlString(),
          graphqlHTTP({
            schema: TestSchema
          })
        );

        const response = await request(app).get(
          urlString({
            query: "query helloWho($who: String){ test(who: $who) }",
            variables: JSON.stringify({ who: "Dolly" })
          })
        );

        expect(response.text).to.equal('{"data":{"test":"Hello Dolly"}}');
      });

      it("allows GET with operation name", async () => {
        const app = server();

        get(
          app,
          urlString(),
          graphqlHTTP(() => ({
            schema: TestSchema
          }))
        );

        const response = await request(app).get(
          urlString({
            query: `
              query helloYou { test(who: "You"), ...shared }
              query helloWorld { test(who: "World"), ...shared }
              query helloDolly { test(who: "Dolly"), ...shared }
              fragment shared on QueryRoot {
                shared: test(who: "Everyone")
              }
            `,
            operationName: "helloWorld"
          })
        );

        expect(JSON.parse(response.text)).to.deep.equal({
          data: {
            test: "Hello World",
            shared: "Hello Everyone"
          }
        });
      });
    });

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

      it("supports POST JSON query with string variables", async () => {
        const app = server();

        post(
          app,
          urlString(),
          graphqlHTTP({
            schema: TestSchema
          })
        );

        const response = await request(app).post(urlString()).send({
          query: "query helloWho($who: String){ test(who: $who) }",
          variables: JSON.stringify({ who: "Dolly" })
        });

        expect(response.text).to.equal('{"data":{"test":"Hello Dolly"}}');
      });

      it("supports POST JSON query with JSON variables", async () => {
        const app = server();

        post(
          app,
          urlString(),
          graphqlHTTP({
            schema: TestSchema
          })
        );

        const response = await request(app).post(urlString()).send({
          query: "query helloWho($who: String){ test(who: $who) }",
          variables: { who: "Dolly" }
        });

        expect(response.text).to.equal('{"data":{"test":"Hello Dolly"}}');
      });

      it("supports POST url encoded query with string variables", async () => {
        const app = server();

        post(
          app,
          urlString(),
          graphqlHTTP({
            schema: TestSchema
          })
        );

        const response = await request(app).post(urlString()).send(
          stringify({
            query: "query helloWho($who: String){ test(who: $who) }",
            variables: JSON.stringify({ who: "Dolly" })
          })
        );

        expect(response.text).to.equal('{"data":{"test":"Hello Dolly"}}');
      });

      it("supports POST JSON query with GET variable values", async () => {
        const app = server();

        post(
          app,
          urlString(),
          graphqlHTTP({
            schema: TestSchema
          })
        );

        const response = await request(app)
          .post(
            urlString({
              variables: JSON.stringify({ who: "Dolly" })
            })
          )
          .send({ query: "query helloWho($who: String){ test(who: $who) }" });

        expect(response.text).to.equal('{"data":{"test":"Hello Dolly"}}');
      });

      it("supports POST url encoded query with GET variable values", async () => {
        const app = server();

        post(
          app,
          urlString(),
          graphqlHTTP({
            schema: TestSchema
          })
        );

        const response = await request(app)
          .post(
            urlString({
              variables: JSON.stringify({ who: "Dolly" })
            })
          )
          .send(
            stringify({
              query: "query helloWho($who: String){ test(who: $who) }"
            })
          );

        expect(response.text).to.equal('{"data":{"test":"Hello Dolly"}}');
      });

      it("supports POST raw text query with GET variable values", async () => {
        const app = server();

        post(
          app,
          urlString(),
          graphqlHTTP({
            schema: TestSchema
          })
        );

        const response = await request(app)
          .post(
            urlString({
              variables: JSON.stringify({ who: "Dolly" })
            })
          )
          .set("Content-Type", "application/graphql")
          .send("query helloWho($who: String){ test(who: $who) }");

        expect(response.text).to.equal('{"data":{"test":"Hello Dolly"}}');
      });

      it("allows POST with operation name", async () => {
        const app = server();

        post(
          app,
          urlString(),
          graphqlHTTP(() => ({
            schema: TestSchema
          }))
        );

        const response = await request(app).post(urlString()).send({
          query: `
              query helloYou { test(who: "You"), ...shared }
              query helloWorld { test(who: "World"), ...shared }
              query helloDolly { test(who: "Dolly"), ...shared }
              fragment shared on QueryRoot {
                shared: test(who: "Everyone")
              }
            `,
          operationName: "helloWorld"
        });

        expect(JSON.parse(response.text)).to.deep.equal({
          data: {
            test: "Hello World",
            shared: "Hello Everyone"
          }
        });
      });

      it("allows POST with GET operation name", async () => {
        const app = server();

        post(
          app,
          urlString(),
          graphqlHTTP(() => ({
            schema: TestSchema
          }))
        );

        const response = await request(app)
          .post(
            urlString({
              operationName: "helloWorld"
            })
          )
          .set("Content-Type", "application/graphql").send(`
            query helloYou { test(who: "You"), ...shared }
            query helloWorld { test(who: "World"), ...shared }
            query helloDolly { test(who: "Dolly"), ...shared }
            fragment shared on QueryRoot {
              shared: test(who: "Everyone")
            }
          `);

        expect(JSON.parse(response.text)).to.deep.equal({
          data: {
            test: "Hello World",
            shared: "Hello Everyone"
          }
        });
      });

      it("allows other UTF charsets", async () => {
        const app = server();

        post(
          app,
          urlString(),
          graphqlHTTP(() => ({
            schema: TestSchema
          }))
        );

        const req = request(app)
          .post(urlString())
          .set("Content-Type", "application/graphql; charset=utf-16");
        req.write(new Buffer('{ test(who: "World") }', "utf16le"));
        const response = await req;

        expect(JSON.parse(response.text)).to.deep.equal({
          data: {
            test: "Hello World"
          }
        });
      });

      it("allows gzipped POST bodies", async () => {
        const app = server();

        post(
          app,
          urlString(),
          graphqlHTTP(() => ({
            schema: TestSchema
          }))
        );

        const data = { query: '{ test(who: "World") }' };
        const json = JSON.stringify(data);
        const gzippedJson = await promiseTo(cb => zlib.gzip(json, cb));

        const req = request(app)
          .post(urlString())
          .set("Content-Type", "application/json")
          .set("Content-Encoding", "gzip");
        req.write(gzippedJson);
        const response = await req;

        expect(JSON.parse(response.text)).to.deep.equal({
          data: {
            test: "Hello World"
          }
        });
      });

      it("allows deflated POST bodies", async () => {
        const app = server();

        post(
          app,
          urlString(),
          graphqlHTTP(() => ({
            schema: TestSchema
          }))
        );

        const data = { query: '{ test(who: "World") }' };
        const json = JSON.stringify(data);
        const deflatedJson = await promiseTo(cb => zlib.deflate(json, cb));

        const req = request(app)
          .post(urlString())
          .set("Content-Type", "application/json")
          .set("Content-Encoding", "deflate");
        req.write(deflatedJson);
        const response = await req;

        expect(JSON.parse(response.text)).to.deep.equal({
          data: {
            test: "Hello World"
          }
        });
      });

      it("allows for pre-parsed POST bodies", async () => {
        // Note: this is not the only way to handle file uploads with GraphQL,
        // but it is terse and illustrative of using express-graphql and multer
        // together.

        // A simple schema which includes a mutation.
        const UploadedFileType = new GraphQLObjectType({
          name: "UploadedFile",
          fields: {
            originalname: { type: GraphQLString },
            mimetype: { type: GraphQLString }
          }
        });

        const TestMutationSchema = new GraphQLSchema({
          query: new GraphQLObjectType({
            name: "QueryRoot",
            fields: {
              test: { type: GraphQLString }
            }
          }),
          mutation: new GraphQLObjectType({
            name: "MutationRoot",
            fields: {
              uploadFile: {
                type: UploadedFileType,
                resolve(rootValue) {
                  // For this test demo, we're just returning the uploaded
                  // file directly, but presumably you might return a Promise
                  // to go store the file somewhere first.
                  return rootValue.request.file;
                }
              }
            }
          })
        });

        const app = server();

        // Multer provides multipart form data parsing.
        const storage = multer.memoryStorage();
        app.use(multer({ storage }).single("file"));

        // Providing the request as part of `rootValue` allows it to
        // be accessible from within Schema resolve functions.
        post(
          app,
          urlString(),
          graphqlHTTP(req => {
            return {
              schema: TestMutationSchema,
              rootValue: { request: req }
            };
          })
        );

        const response = await request(app)
          .post(urlString())
          .field(
            "query",
            `mutation TestMutation {
            uploadFile { originalname, mimetype }
          }`
          )
          .attach("file", __filename);

        expect(JSON.parse(response.text)).to.deep.equal({
          data: {
            uploadFile: {
              originalname: "post-test.js",
              mimetype: "application/javascript"
            }
          }
        });
      });

      it("allows for pre-parsed POST using application/graphql", async () => {
        const app = server();
        app.use(bodyParser.text({ type: "application/graphql" }));

        post(app, urlString(), graphqlHTTP({ schema: TestSchema }));

        const req = request(app)
          .post(urlString())
          .set("Content-Type", "application/graphql");
        req.write(new Buffer('{ test(who: "World") }'));
        const response = await req;

        expect(JSON.parse(response.text)).to.deep.equal({
          data: {
            test: "Hello World"
          }
        });
      });

      it("does not accept unknown pre-parsed POST string", async () => {
        const app = server();
        app.use(bodyParser.text({ type: "*/*" }));

        post(app, urlString(), graphqlHTTP({ schema: TestSchema }));

        const req = request(app).post(urlString());
        req.write(new Buffer('{ test(who: "World") }'));
        const response = await req;

        expect(response.status).to.equal(400);
        expect(JSON.parse(response.text)).to.deep.equal({
          errors: [{ message: "Must provide query string." }]
        });
      });

      it("does not accept unknown pre-parsed POST raw Buffer", async () => {
        const app = server();
        app.use(bodyParser.raw({ type: "*/*" }));

        post(app, urlString(), graphqlHTTP({ schema: TestSchema }));

        const req = request(app)
          .post(urlString())
          .set("Content-Type", "application/graphql");
        req.write(new Buffer('{ test(who: "World") }'));
        const response = await req;

        expect(response.status).to.equal(400);
        expect(JSON.parse(response.text)).to.deep.equal({
          errors: [{ message: "Must provide query string." }]
        });
      });
    });
  });
