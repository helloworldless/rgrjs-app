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
  connectionDefinitions,
  connectionArgs,
  connectionFromPromisedArray,
  mutationWithClientMutationId
} from 'graphql-relay';

let Schema = (db) => {

  //Limit functionality breaks when adding limit(arg.first) to Mongo call, so removing it for now
  let store = {};
  let storeType = new GraphQLObjectType({
    name: 'Store',
    fields: () => ({
      id: globalIdField("Store"),
      linkConnection: {
        type: linkConnection.connectionType,
        args: connectionArgs,
        resolve: (_, args) => connectionFromPromisedArray(
          db.collection("links").find({}).toArray(),
          args
        )
      }
    })
  });

  let linkType = new GraphQLObjectType({
    name: 'Link',
    fields: () => ({
      id: {
        type: new GraphQLNonNull(GraphQLID),
        resolve: (obj) => obj._id
      },
      title: { type: GraphQLString },
      url: { type: GraphQLString }
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
      return db.collection("links").insertOne({title, url});
    }
  });

  let schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: () => ({
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
