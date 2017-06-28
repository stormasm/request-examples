/**
* given a user login return the underlying user
*
* Query
* {
*  user(login: "stormasm") {
*    id
*    name
*  }
* }
* Response
* {
*  "data": {
*    "user": {
*      "id": "MDQ6VXNlcjE4MDk5OTE=",
*      "name": "Michael Angerman"
*    }
*  }
* }
*/

const UserMap = {
  "stormasm": {
    id: "MDQ6VXNlcjE4MDk5OTE=",
    name: "Michael Angerman"
  },
  "antirez": {
    id: "MDQ6VXNlcjY1NjMy",
    name: "Salvatore Sanfilippo",
  },
  "torvalds": {
    id: "MDQ6VXNlcjEwMjQwMjU=",
    name: "Linus Torvalds",
  }
};

export default UserMap;
