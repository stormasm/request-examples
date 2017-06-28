/* @flow */

import { expect } from "chai";
import { describe, it } from "mocha";

import { stringify } from "querystring";
import request from "supertest";

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
      .send({ query: "{topic(name:\"plum\"){id name}}"});
      console.log(response.text);
      expect(response.text).to.equal('{"data":{"topic":{"id":"MDU6VG9waWNwbHVt","name":"plum"}}}');
  });
});
