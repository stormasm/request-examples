/**
* given a user login return the underlying user
*
* Query
* {
*  organization(login: "dgraph-io") {
*    id
*    name
*  }
* }
* Response
* {
*  "data": {
*    "organization": {
*      "id": "MDEyOk9yZ2FuaXphdGlvbjEzOTU4NzA2",
*      "name": "Dgraph"
*    }
*  }
* }
*/

const OrganizationMap = {
  "dgraph-io": {
    id: "MDEyOk9yZ2FuaXphdGlvbjEzOTU4NzA2",
    name: "Dgraph"
  },
  "graphql": {
    id: "MDEyOk9yZ2FuaXphdGlvbjEyOTcyMDA2",
    name: "Facebook GraphQL",
  },
  "facebook": {
    id: "MDEyOk9yZ2FuaXphdGlvbjY5NjMx",
    name: "Facebook",
  }
};

export default UserMap;
