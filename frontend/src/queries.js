import { gql } from "@apollo/client";

// Query para obter os items com base no filtro, página e limite enviado
export const GET_TODO_LIST = gql`
  query todoList($filter: String, $page: Int, $limit: Int) {
    todoList(filter: $filter, page: $page, limit: $limit) {
      pageCount,
      items {
        id,
        name
      }
    }
  }
`;

// Mutation para criar um novo item
export const ADD_ITEM_MUTATION = gql`
  mutation addItem($values: ItemInput) {
    addItem(values: $values) {
      error,
      message,
    }
  }
`;

// Mutation para atualizar um item
export const UPDATE_ITEM_MUTATION = gql`
  mutation updateItem($values: ItemInput) {
    updateItem(values: $values) {
      error,
      message,
    }
  }
`;

// Mutation para excluir um item
export const DELETE_ITEM_MUTATION = gql`
  mutation deleteItem($id: Int!) {
    deleteItem(id: $id) {
      error,
      message,
    }
  }
`;
