import * as React from 'react';
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { Button, IconButton, TextField } from "@mui/material";
import { styled } from "styled-components";
import { useMutation, useQuery } from "@apollo/client";
import { ADD_ITEM_MUTATION, DELETE_ITEM_MUTATION, GET_TODO_LIST, UPDATE_ITEM_MUTATION } from "./queries";
import { Cancel, CheckRounded, Delete, Edit, FilterAltRounded } from "@mui/icons-material";
import { useState } from "react";
import { getOperationName } from "@apollo/client/utilities";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const ContainerTop = styled.form`
  display: flex;
  background-color: #fdfdfd;
  flex-direction: column;
  justify-content: center;
  padding: 10px;
  gap: 10px;
  border-radius: 5px;
`;

const ContainerList = styled.div`
  display: flex;
  width: 100%;
  max-width: 85vw;
  max-height: 85vh;
  overflow: auto;
  background-color: #fdfdfd;
  flex-direction: column;
  padding: 10px;
  gap: 10px;
  border-radius: 5px;
  @media (min-width: 768px) {
    max-width: 50vw;
  }
`;
const ContainerListItem = styled.div`
  margin: 0 10px;
  padding: 5px;
  border-radius: 5px;
  max-height: 340px;
  overflow: auto;
  border: solid;
  border-width: 1px;
  border-color: #ADADAD;
`;

const ContainerButton = styled.div`
  display: grid;
  gap: 10px;
  min-height: 40px;
  @media (min-width: 768px) {
    justify-content: space-around;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Title = styled.div`
  font-weight: bold;
  font-size: 28px;
  margin-top: 10px;
`;

export default function CheckboxList() {
  const [addItem] = useMutation(ADD_ITEM_MUTATION);
  const [updateItem] = useMutation(UPDATE_ITEM_MUTATION);
  const [deleteItem] = useMutation(DELETE_ITEM_MUTATION);

  const [item, setItem] = useState("");
  const [updatingItem, setUpdatingItem] = useState(undefined);
  const [deletingItem, setDeletingItem] = useState(undefined);
  const [error, setError] = useState("");
  const [deletingError, setDeletingError] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, loading } = useQuery(GET_TODO_LIST, {
    variables: { filter, page, limit: 10 }
  });

  // Função para lidar com a criação e edição de um item
  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setFilter("");
    if (updatingItem) {
      const result = await updateItem({
        variables: {
          values: {
            id: updatingItem.id,
            name: item,
          },
        },
        awaitRefetchQueries: true,
        refetchQueries: [getOperationName(GET_TODO_LIST)],
      });
      if (result.data.updateItem.error) {
        setError(result?.data?.updateItem?.message ?? "Erro interno do sistema");
        return;
      }
    } else {
      const result = await addItem({
        variables: {
          values: {
            name: item,
          },
        },
        awaitRefetchQueries: true,
        refetchQueries: [getOperationName(GET_TODO_LIST)],
      });
      if (result.data.addItem.error) {
        setError(result?.data?.addItem?.message ?? "Erro interno do sistema");
        return;
      }
    }
    setItem("");
    setUpdatingItem(undefined);
  };

  // Função para abrir o dialog para confirmar a exclusão de um item
  const onDelete = (event, value) => {
    event.preventDefault();
    setDeletingItem(value);
    setOpenDeleteDialog(true);
  };

  // Função para cancelar a exclusão de um item
  const onCancelDelete = (event) => {
    event?.preventDefault();
    setOpenDeleteDialog(false);
    setTimeout(() => setDeletingItem(undefined), 150);
  }

  // Função para lidar com a exclusão de um item
  const onConfirmDelete = async (event) => {
    event.preventDefault();
    const result = await deleteItem({
      variables: {
        id: deletingItem.id
      },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(GET_TODO_LIST)],
    });
    if (result.data.deleteItem.error) {
      setDeletingError(result?.data?.deleteItem?.message ?? "Erro interno do sistema");
      return;
    }
    onCancelDelete();
  }

  // Função para definir o item que será atualizado
  const onUpdate = (event, value) => {
    event.preventDefault();
    setUpdatingItem(value);
    setItem(value?.name);
  };

  // Função para cancelar a atualização de um item
  const onCancelUpdate = (event) => {
    event.preventDefault();
    setUpdatingItem(undefined);
    setItem("");
  }

  // Função para definir o filtro na query
  const onFilter = (event) => {
    event.preventDefault();
    setFilter(item);
  };

  // Função para lidar com a mudança de páginas
  const onPagination = (event, page) => {
    event.preventDefault();
    setPage(page);
  };

  return (
    <React.Fragment>
      <Container>
        <ContainerList>
          <Title>Lista de Tarefas</Title>
          <ContainerTop onSubmit={onSubmit}>
            <TextField
              id="item"
              label="Digite aqui"
              value={item}
              type="text"
              variant="standard"
              onChange={(e) => setItem(e?.target?.value)}
            />
            {error && (
              <Alert severity="error">{error}</Alert>
            )}
            <ContainerButton>
              {updatingItem ? (
                <Stack 
                  direction={"row"} 
                  spacing={1}
                  alignItems={"center"}
                >
                  <Alert 
                    sx={{ width: "100%", padding: "2px 16px"}}
                    severity="warning"
                  >
                    Atualizando: {updatingItem.name}
                  </Alert>
                  <IconButton 
                    aria-label="cancel update item"
                    color="error"
                    onClick={onCancelUpdate}
                  >
                    <Cancel/>
                  </IconButton>
                </Stack>
              ) : (
                <Button
                  variant="outlined"
                  color="secondary"
                  sx={{ width: "100%" }}
                  endIcon={<FilterAltRounded />}
                  onClick={onFilter}
                >
                  Filtrar
                </Button>
              )}
              <Button
                variant="contained"
                color="success"
                sx={{ width: "100%" }}
                endIcon={<CheckRounded />}
                type="submit"
                disabled={item === ""}
              >
                Salvar
              </Button>
            </ContainerButton>
          </ContainerTop>
          <List sx={{ width: "100%" }}>
            <ContainerListItem>
              {loading ? (
                <CircularProgress />
              ) : data?.todoList?.items?.length > 0 ? 
                data?.todoList?.items?.map((value, index) => {
                  return (
                    <ListItem
                      key={index}
                      disablePadding
                      sx={{
                        borderRadius: "5px",
                        marginTop: "5px",
                        marginBottom: "5px",
                      }}
                    >
                      <ListItemButton dense>
                        <ListItemText id={index} primary={value?.name} />
                        <IconButton 
                          size="small"
                          color="primary"
                          onClick={(event) => onUpdate(event, value)}
                        >
                          <Edit/>
                        </IconButton>
                        <IconButton 
                          size="small"
                          color="error"
                          onClick={(event) => onDelete(event, value)}
                        >
                          <Delete/>
                        </IconButton>
                      </ListItemButton>
                    </ListItem>
                  );
                }) : (
                  "Nenhum resultado encontrado"
                )
              }
            </ContainerListItem>
          </List>
          <Stack 
            alignItems={"center"}
            spacing={2}
            marginBottom={1}
          >
            <Pagination count={data?.todoList?.pageCount || 1} page={page} onChange={onPagination}/>
          </Stack>
        </ContainerList>
      </Container>
      <Dialog 
        open={openDeleteDialog} 
        onClose={onCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Você tem certeza?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Esta ação irá excluir permanentemente o item: {deletingItem?.name}.
          </DialogContentText>
          {deletingError && (
            <Alert severity="error">{deletingError}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancelDelete}>Cancelar</Button>
          <Button color="error" onClick={onConfirmDelete} autoFocus>Excluir</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
