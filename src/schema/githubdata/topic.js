/* @flow */

export const TopicMap = {
  "dgraph": {
    "id": "MDU6VG9waWNkZ3JhcGg=",
    "name": "dgraph",
    "relatedTopics": []
  },

  "noms": {
   "id": "MDU6VG9waWNub21z",
   "name": "noms",
   "relatedTopics": []
  },

  "dwave": {
   "id": "MDU6VG9waWNkd2F2ZQ==",
   "name": "dwave",
   "relatedTopics": []
  },

  "xop": {
    "id": "MDU6VG9waWN4b3A=",
    "name": "xop",
    "relatedTopics": [
      {
        "name": "igor",
        "id": "MDU6VG9waWNpZ29y"
      }
    ]
  },

  "libp2p": {
    "id": "MDU6VG9waWNsaWJwMnA=",
    "name": "libp2p",
    "relatedTopics": [
      {
        "name": "ipfs",
        "id": "MDU6VG9waWNpcGZz"
      },
      {
        "name": "peer",
        "id": "MDU6VG9waWNwZWVy"
      }
    ]
  },

  "plum": {
      "id": "MDU6VG9waWNwbHVt",
      "name": "plum",
      "relatedTopics": [
        {
          "name": "php",
          "id": "MDU6VG9waWNwaHA="
        },
        {
          "name": "converts",
          "id": "MDU6VG9waWNjb252ZXJ0cw=="
        }
      ]
  }
};

export type Topic = {
  type: 'Topic',
  id: string,
  name: string,
  relatedTopics: Array<string>,
};

/**
 * Allows us to query for the topic with the given name.
 */
export function getTopic(name: string): Topic {
  return TopicMap[name];
}
