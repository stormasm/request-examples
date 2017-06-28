/* @flow */

import {
  Kind,
  GraphQLEnumType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLString,
  GraphQLScalarType
} from "graphql";

import { getTopic } from "./githubdata/topic.js";
import { getUniformResourceLocatable } from "./githubdata/uniformResourceLocatable";
import { getRepositoryOwner } from "./githubdata/repositoryOwner";
import { getRepository } from "./githubdata/repository";

// Github Scalar Types

export const uriType = new GraphQLScalarType({
  name: "URI",
  description:
    "An RFC 3986, RFC 3987, and RFC 6570 (level 4) compliant URI string.",
  serialize: String,
  parseValue: String,
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? ast.value : null;
  }
});

// Start Interfaces in order of when they were implemented

const nodeInterface = new GraphQLInterfaceType({
  name: "Node",
  description: "A node in the Github hierarchy",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The id of the node."
    }
  }),
  resolveType(node) {
    if (node.type === "Topic") {
      return topicType;
    }
  }
});

const repositoryOwnerInterface = new GraphQLInterfaceType({
  name: "RepositoryOwnerInterface",
  description: "Represents an owner of a Repository.",
  fields: () => ({
    login: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The username used to login."
    },
    avatarUrl: {
      type: new GraphQLNonNull(GraphQLString),
      description: "A URL pointing to the owners public avatar."
    },
    resourcePath: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The path for the owner."
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The HTTP URL for the owner."
    }
  }),
  resolveType(repositoryOwner) {
    if (repositoryOwner.type === "RepositoryOwner") {
      return repositoryOwnerType;
    }
  }
});

const repositoryInfoInterface = new GraphQLInterfaceType({
  name: "RepositoryInfo",
  description: "A subset of repository info.",
  fields: () => ({
    description: {
      type: GraphQLString,
      description: "The description of the repository."
    },
    license: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The license associated with the repository"
    },
    homepageUrl: {
      type: new GraphQLNonNull(uriType),
      description: "The repository's URL."
    }
  }),
  resolveType(repositoryInfo) {
    if (repositoryInfo.type === "RepositoryInfo") {
      return repositoryInfoType;
    }
  }
});

// End Interfaces

// Start Type Implementations

const uniformResourceLocatableType = new GraphQLObjectType({
  name: "UniformResourceLocatable",
  description: "Represents a type that can be retrieved by a URL.",
  fields: () => ({
    resourcePath: {
      type: new GraphQLNonNull(uriType),
      description: "The HTML path to this resource."
    },
    url: {
      type: new GraphQLNonNull(uriType),
      description: "The HTML path to this resource."
    }
  })
});

const topicType = new GraphQLObjectType({
  name: "Topic",
  description: "A Topic in the Github world.",
  fields: () => ({
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The name of the topic."
    },
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The id of the topic."
    },
    relatedTopics: {
      type: new GraphQLList(topicType),
      description: "A list of related topics."
    }
  }),
  interfaces: [nodeInterface]
});

const repositoryOwnerType = new GraphQLObjectType({
  name: "RepositoryOwner",
  description: "Represents an owner of a Repository.",
  fields: () => ({
    login: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The username used to login."
    },
    avatarUrl: {
      type: new GraphQLNonNull(GraphQLString),
      description: "A URL pointing to the owners public avatar."
    },
    resourcePath: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The path for the owner."
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The HTTP URL for the owner."
    },
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The id of the repository owner."
    }
  }),
  interfaces: [nodeInterface, repositoryOwnerInterface]
});

const repositoryType = new GraphQLObjectType({
  name: "Repository",
  description: "A repository contains the content for a project.",
  fields: () => ({
    login: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The username used to login."
    },
    diskUsage: {
      type: new GraphQLNonNull(GraphQLInt),
      description: "The number of kilobytes this repository occupies on disk."
    },
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The id of the repository owner."
    },
    description: {
      type: GraphQLString,
      description: "The description of the repository."
    },
    license: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The license associated with the repository"
    },
    homepageUrl: {
      type: new GraphQLNonNull(uriType),
      description: "The repository's URL."
    }
  }),
  interfaces: [nodeInterface, repositoryInfoInterface]
});

// End Type Implementations

const queryType = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    topic: {
      type: topicType,
      args: {
        name: {
          description: "name of the topic",
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: (root, { name }) => getTopic(name)
    },

    resource: {
      type: uniformResourceLocatableType,
      args: {
        url: {
          description: "a URI String",
          type: new GraphQLNonNull(uriType)
        }
      },
      resolve: (root, { url }) => getUniformResourceLocatable(url)
    },

    repositoryOwner: {
      type: repositoryOwnerType,
      args: {
        login: {
          description: "The username used to login.",
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: (root, { login }) => getRepositoryOwner(login)
    },

    repository: {
      type: repositoryType,
      args: {
        owner: {
          description: "The login field of a user or organizationn",
          type: new GraphQLNonNull(GraphQLString)
        },
        name: {
          description: "The name of the repository.",
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: (root, { owner, name }) => getRepository(owner, name)
    }
  })
});

/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */

export const GithubSchema = new GraphQLSchema({
  query: queryType,
  types: [
    topicType,
    uniformResourceLocatableType,
    repositoryOwnerType,
    repositoryType
  ]
});
