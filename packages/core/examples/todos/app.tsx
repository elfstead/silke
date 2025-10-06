import { signal } from '@silke/core';

type Todo = { text: string, completed: boolean };

function Todo(props: { todo: Todo, toggle: () => void, delete: () => void }) {
  return (
    <li>
      <button onClick={props.delete}>X</button>
      <h3 style={props.todo.completed ? "text-decoration: line-through;" : ""} >{props.todo.text}</h3>
      <input type="checkbox" $checked={props.todo.completed} onChange={props.toggle}/>
    </li>
  );
}

function App() {
  const todos = signal<Todo[]>([]);
  const input = signal<HTMLInputElement | null>(null);
  const handleSubmit = (e: Event) => {
    e.preventDefault();
    todos([...todos(), { text: input()!.value, completed: false } ]);
    input()!.value = "";
  }
  const toggleTodo = (i: number) => {
    return () => {
      const newTodos = [...todos()];
      newTodos[i]!.completed = !newTodos[i]!.completed;
      todos(newTodos);
    }
  }
  const deleteTodo = (i: number) => {
    return () => {
      const newTodos = [...todos()];
      newTodos.splice(i, 1);
      todos(newTodos);
    }
  }

  return (
    <div>
      <h1>Todos</h1>
      <form onSubmit={handleSubmit}>
        <input ref={input}/>
        <button type="submit">Add</button>
      </form>
      <ul>
        {() => todos().map((todo, i) => (
          <Todo todo={todo} toggle={toggleTodo(i)} delete={deleteTodo(i)}/>
        ))}
      </ul>
    </div>
  );
}

const root = document.getElementById('app');

if (root) {
  root.appendChild(<App /> as Node);
}
