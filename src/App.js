import React, { useContext, useReducer, useEffect, useState, createContext, useRef } from 'react'

const HOST_API = 'http://localhost:8080/api'//Conexion a la api hecha con springboot
const initialState = {
  list: [],
  item: {}
}
const Store = createContext(initialState)

const Form = () => { //Funcion para el formulario

  const formRef = useRef(null)
  const { dispatch, state: { item } } = useContext(Store)
  const [state, setState] = useState({ item })

  const onAdd = (event) => { //Evento para agregar una nueva tarea
    event.preventDefault();

    const request = {
      name: state.name,
      id: null,
      isCompleted: false
    }

    fetch(HOST_API + "/todo", {
      method: 'POST',
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then((todo) => {
        dispatch({ type: "add-item", item: todo });
        setState({ name: "" });
        formRef.current.reset();
      })
  }

  const onEdit = (event) => { //Evento para editar una tarea
    event.preventDefault();
    const request = {
      name: state.name,
      id: item.id,
      isCompleted: item.isCompleted
    }

    fetch(HOST_API + "/todo", {
      method: 'PUT',
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then((todo) => {
        dispatch({ type: "update-item", item: todo });
        setState({ name: "" });
        formRef.current.reset();
      })
  }

  return ( //Formulario para añadir cada tarea
    <form ref={formRef} className="mt-5 text-center">
      <h1>To-Do List</h1>
      <h4>Agrega/edita una tarea a realizar:</h4>
      <input className="mt-3 mb-5 col-sm-4" type="text" name="name" defaultValue={item.name} onChange={(event) => {
        setState({ ...state, name: event.target.value.toUpperCase() }) //Valor del input se transforma a mayusculas
      }}></input>
      {item.id && <button className="btn btn-secondary" onClick={onEdit}>Editar</button>}
      {!item.id && <button className="btn btn-secondary" onClick={onAdd}>Agregar</button>}
    </form>
  )
}


const List = () => { //Funcion para crear una lista con todos los items
  const { dispatch, state } = useContext(Store)

  useEffect(() => { //Consumimos la informacion que nos trae la api
    fetch(HOST_API + "/todos")
      .then(response => response.json())
      .then((list) => {
        dispatch({ type: "update-list", list })
      })
  }, [state.list.length, dispatch]);


  const onDelete = (id) => {
    fetch(HOST_API + "/" + id + "/todo", {
      method: "DELETE"
    })
      .then((list) => {
        dispatch({ type: "delete-item", id })
      })
  }

  const onEdit = (todo) => {
    dispatch({ type: "edit-item", item: todo })
  }


  return ( //Crea tabla donde se refleja cada tarea
    <div>
      <table className="table table-hover text-center">
        <thead>
          <tr>
            <td>ID</td>
            <td>Actividad a realizar</td>
            <td>¿Está completado?</td>
          </tr>
        </thead>
        <tbody>
          {state.list.map((todo) => {
            return <tr key={todo.id}>
              <td>{todo.id}</td>
              <td>{todo.name}</td>
              <td>{todo.isCompleted === true ? "SI" : "NO"}</td>
              <td><button className="btn btn-secondary" onClick={() => onEdit(todo)}>Editar</button></td>
              <td><button className="btn btn-danger" onClick={() => onDelete(todo.id)}>Eliminar</button></td>
            </tr>
          })}
        </tbody>
      </table>
    </div>
  )
}

function reducer(state, action) { //Actualiza el estado tomando a eleccion el estado actual y el nuevo estado
  switch (action.type) {
    case 'update-item': const listUpdateEdit = state.list.map((item) => {
      if (item.id === action.item.id) {
        return action.item;
      }
      return item;
    }); return { ...state, list: listUpdateEdit, item: {} }

    case 'delete-item': const listUpdate = state.list.filter((item) => {
      return item.id !== action.id;
    });
      return { ...state, list: listUpdate }
    case 'update-list': return { ...state, list: action.list }
    case 'edit-item': return { ...state, item: action.item }
    case 'add-item': const newList = state.list;
      newList.push(action.item);
      return { ...state, list: newList }
    default: return state;
  }
}

const StoreProvider = ({ children }) => { //Nos conecta diferentes componentes
  const [state, dispatch] = useReducer(reducer, initialState)

  return <Store.Provider value={{ state, dispatch }}>
    {children}
  </Store.Provider>
}

function App() { //Funcion principal
  return (
    <StoreProvider>
      <Form />
      <List />
    </StoreProvider>
  );
}

export default App;
