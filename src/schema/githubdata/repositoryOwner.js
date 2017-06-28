/* @flow */

/**
* given a login string return the RepositoryOwner
*
*{
* repositoryOwner(login: "stormasm") {
*    id
*    login
*    avatarUrl
*    resourcePath
*    url
*    repository(name: "plum") {
*      id
*      nameWithOwner
*      description
*      diskUsage
*      isFork
*    }
*  }
*}
*/

export const RepositoryOwnerMap = {
  stormasm: {
    id: "MDQ6VXNlcjE4MDk5OTE=",
    login: "stormasm",
    avatarUrl: "https://avatars0.githubusercontent.com/u/1809991?v=3",
    resourcePath: "/stormasm",
    url: "https://github.com/stormasm"
  },
  "dgraph-io": {
    id: "MDEyOk9yZ2FuaXphdGlvbjEzOTU4NzA2",
    login: "dgraph-io",
    avatarUrl: "https://avatars3.githubusercontent.com/u/13958706?v=3",
    resourcePath: "/dgraph-io",
    url: "https://github.com/dgraph-io"
  },
  graphql: {
    id: "MDEyOk9yZ2FuaXphdGlvbjEyOTcyMDA2",
    login: "graphql",
    avatarUrl: "https://avatars3.githubusercontent.com/u/12972006?v=3",
    resourcePath: "/graphql",
    url: "https://github.com/graphql"
  }
};

export type RepositoryOwner = {
  type: "RepositoryOwner",
  id: string,
  login: string,
  avatarUrl: string,
  resourcePath: string,
  url: string
};

/**
 * Allows us to query for the repository owner with the given login.
 */
export function getRepositoryOwner(login: string): RepositoryOwner {
  return RepositoryOwnerMap[login];
}
