/* @flow */

import { expect } from "chai";
import { describe, it } from "mocha";

import { stringify } from "querystring";
import request from "supertest";
import * as fs from "fs";

function getData(fileName, type) {
  return new Promise(function(resolve, reject) {
    fs.readFile(fileName, type, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

function urlString(urlParams?: ?{ [param: string]: mixed }) {
  let string = "/graphql";
  if (urlParams) {
    string += "?" + stringify(urlParams);
  }
  return string;
}

describe("POST functionality", () => {
  it("allows POST with JSON encoding", async () => {
    // Add the file f1.js to .gitignore
    const r1 = await getData("./test/f1.js", "utf8");
    const r2 = r1.trim();
    const myjson = JSON.parse(r2);
    const r3 = "Bearer " + myjson.key;

    const response = await request("https://api.github.com")
      .post(urlString())
      .set("Authorization", r3)
      .send({ query: '{topic(name:"plum"){id name}}' });
    //console.log(response.text);
    expect(response.text).to.equal(
      '{"data":{"topic":{"id":"MDU6VG9waWNwbHVt","name":"plum"}}}'
    );
  });
});
