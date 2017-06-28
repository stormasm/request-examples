/**
* given a nameWithOwner string return the underlying repository
*
* {
*  repositoryOwner(login: "stormasm") {
*    id
*    login
*    repository(name: "noms") {
*      id
*      nameWithOwner
*      description
*      diskUsage
*      isFork
*    }
*   }
* }
*/

export const RepositoryMap = {
  "stormasm/noms": {
    id: "MDEwOlJlcG9zaXRvcnk5MTIxNjgxNA==",
    nameWithOwner: "stormasm/noms",
    description: "The versioned, forkable, syncable database",
    diskUsage: 34693,
    isFork: true
  },
  "stormasm/graphql-js-test": {
    id: "MDEwOlJlcG9zaXRvcnk5MzU3Mjk1Mw==",
    nameWithOwner: "stormasm/graphql-js-test",
    description: "standalone graphql tests",
    diskUsage: 35,
    isFork: false
  },
  "stormasm/plum": {
    id: "MDEwOlJlcG9zaXRvcnkyNTk5OTYxMg==",
    nameWithOwner: "stormasm/plum",
    description: null,
    diskUsage: 722,
    isFork: false
  }
};

export type Repository = {
  type: "Repository",
  name: string,
  namwwithowner: string,
  url: string
};

/**
 * Allows us to query for the repository with the owner and name.
 */
export function getRepository(owner: string, name: string): Repository {
  let owner_slash_name = owner + "/" + name;
  return RepositoryMap[owner_slash_name];
}
