/* @flow */

export const UniformResourceLocatableMap = {
//  "https://github.com/stormasm/plum": {
    "plum": {
    "resourcePath": "/stormasm/plum",
    "url": "https://github.com/stormasm/plum"
  },
//  "https://github.com/dgraph-io/dgraph": {
    "dgraph": {
    "resourcePath": "/dgraph-io/dgraph",
    "url": "https://github.com/dgraph-io/dgraph"
  }
};

export type UniformResourceLocatable = {
  type: 'UniformResourceLocatable',
  reourcePath: string,
  url: string,
};

/**
 * Allows us to query for the URI with the given url.
 */
export function getUniformResourceLocatable(url: string): UniformResourceLocatable {
  return UniformResourceLocatableMap[url];
}
