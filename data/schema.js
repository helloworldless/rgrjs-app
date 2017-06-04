import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID
} from 'graphql';

import {
  globalIdField,
  fromGlobalId,
  nodeDefinitions,
  connectionDefinitions,
  connectionArgs,
  connectionFromPromisedArray,
  mutationWithClientMutationId
} from 'graphql-relay';

let Schema = (db) => {
  class Store {}
  let store = new Store();

  let nodeDefs = nodeDefinitions(
    (globalId) => {
      let {type} = fromGlobalId(globalId);
      if (type === 'Store') {
        return store;
      }
      return null;

    },
    (obj) => {
      if (obj instanceof Store) {
        return storeType;
      }
      return null;
    }
  );

  let storeType = new GraphQLObjectType({
    name: 'Store',
    fields: () => ({
      id: globalIdField("Store"),
      linkConnection: {
        type: linkConnection.connectionType,
        args: {
          ...connectionArgs,
          titleQuery: { type: GraphQLString }
        },
        resolve: (_, args) => {
          let findParams = {};
          if (args.titleQuery) {
            findParams.title = new RegExp(args.titleQuery, 'i');
          }

          /* Limit functionality breaks when adding 
           * limit(arg.first) to Mongo call,
           * so removing it for now */
          return connectionFromPromisedArray(
            db.collection("links")
              .find(findParams)
              .sort({createdAt: -1})
              .toArray(),
            args
          );
        }
      }
    }),
    interfaces: [nodeDefs.nodeInterface]
  });

  let linkType = new GraphQLObjectType({
    name: 'Link',
    fields: () => ({
      id: {
        type: new GraphQLNonNull(GraphQLID),
        resolve: (obj) => obj._id
      },
      title: { type: GraphQLString },
      url: { type: GraphQLString },
      createdAt: {
        type: GraphQLString,
        resolve: (obj) => new Date(obj.createdAt).toISOString()
      }
    })
  });

  let linkConnection = new connectionDefinitions({
    name: 'Link',
    nodeType: linkType
  });

  let createLinkMutation = mutationWithClientMutationId({
    name: 'CreateLink',
    inputFields: {
      title: { type: new GraphQLNonNull(GraphQLString) },
      url: { type: new GraphQLNonNull(GraphQLString) },
    },
    outputFields: {
      linkEdge: {
        type: linkConnection.edgeType,
        resolve: (obj) => ({node: obj.ops[0], cursor: obj.insertedId})
      },
      store: {
        type: storeType,
        resolve: () => store 
      }
    },
    mutateAndGetPayload: ({title, url}) => {
      return db.collection("links").insertOne({
        title,
        url,
        createdAt: Date.now()
      });
    }
  });

  let schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: () => ({
        node: nodeDefs.nodeField,
        store: {
          type: storeType,
          resolve: () => store
        }
      })
    }),
    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: () => ({
        createLink: createLinkMutation
      })
    })
  });

  return schema;
}

export default Schema;
