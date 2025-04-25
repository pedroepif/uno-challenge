const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { TODO_LIST } = require("./makeData");

/**
 * Gera um número inteiro para utilizar de id
 */
function getRandomInt() {
  return Math.floor(Math.random() * 999);
}

const typeDefs = `#graphql
  type Item {
    id: Int
    name: String
  }

  input ItemInput {
    id: Int
    name: String
  }

  type QueryResult {
    items: [Item]
    pageCount: Int
  }

  type Query {
    todoList(filter: String, page: Int, limit: Int): QueryResult
  }

  type MutationResult { 
    error: Boolean
    message: String 
  }

  type Mutation {
    addItem(values: ItemInput): MutationResult
    updateItem(values: ItemInput): MutationResult
    deleteItem(id: Int!): MutationResult
  }
`;

const resolvers = {
  Query: {
    // Método para lidar com a Query, retornando items e pageCount de acordo com o filtro, página e limite recebido
    todoList: (_, { filter, page, limit }) => {
      let list = TODO_LIST;
      if (filter) {
        list = TODO_LIST.filter(item => {
          const exactId = item.id === filter;
          const containsName = item.name.toLowerCase().includes(filter.toLowerCase());
          return exactId || containsName;
        })
      }
      const start = (page * limit) - limit;
      const end = start + limit;
      const items = list.slice(start, end);
      const pageCount = Math.ceil(list.length / limit);
      return {
        items,
        pageCount,
      }
    },
  },
  Mutation: {
    // Método para lidar com a Mutation para criar um novo item, validando se o nome é vázio ou já está em uso
    addItem: (_, { values: { name } }) => {
      if (!name) return { error: true, message: "O nome não pode ser vázio" };
      const existingName = TODO_LIST.some(item => item.name === name);
      if (existingName) return { error: true, message: "O nome escolhido já está em uso" };
      TODO_LIST.push({
        id: getRandomInt(),
        name,
      });
      return { error: false, message: "Item criado com sucesso" };
    },
    // Método para lidar com a Mutation para atualizar um item, validando se o item existe ou o novo nome já está em uso
    updateItem: (_, { values: { id, name } }) => {
      const index = TODO_LIST.findIndex(item => item.id === id);
      if (index === -1) return { error: true, message: "Item não encontrado" };
      const existingName = TODO_LIST.some(item => item.name === name);
      if (existingName) return { error: true, message: "O nome escolhido já está em uso" };
      TODO_LIST[index].name = name;
      return { error: false, message: "Item atualizado com sucesso" };
    },
    // Métdo para lidar com a Mutation de excluir um item, validando se o item existe.
    deleteItem: (_, { id }) => {
      const index = TODO_LIST.findIndex(item => item.id === id);
      if (index === -1) return { error: true, message: "Item não encontrado" };
      TODO_LIST.splice(index, 1);
      return { error: false, message: "Item excluído com sucesso" };
    },
  },
};

// Configuração para subir o backend
const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`🚀  Server ready at: ${url}`);
};

startServer();
