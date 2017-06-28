/* @flow */

import { expect } from "chai";
import { describe, it } from "mocha";

import { stringify } from "querystring";
import request from "supertest";
import express4 from "express"; // modern
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString
} from "graphql";
import graphqlHTTP from "express-graphql";

function urlString(urlParams?: ?{ [param: string]: mixed }) {
  let string = "/graphql";
  if (urlParams) {
    string += "?" + stringify(urlParams);
  }
  return string;
}

describe("POST functionality", () => {
  it("allows POST with JSON encoding", async () => {
    const response = await request("localhost:3000/")
      .post(urlString())
      .send({ query: "{test}" });

    expect(response.text).to.equal('{"data":{"test":"Hello World"}}');
  });
});
