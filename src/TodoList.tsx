import React from "react";
import { Todo } from "./types";

type Props = {
  todos: Todo[];
  updateIsDone: (id: string, value: boolean) => void;
  remove: (id: string) => void;
  setEditTodoId: (id: string) => void;
  setEditTodoName: (name: string) => void;
  setEditTodoPriority: (priority: number) => void;
  setEditTodoDeadline: (deadline: Date | null) => void;
};

const TodoList = (props: Props) => {
  const { todos, updateIsDone, remove, setEditTodoId, setEditTodoName, setEditTodoPriority, setEditTodoDeadline } = props;

  if (todos.length === 0) {
    return <div className="text-red-500">現在、登録されているタスクはありません。</div>;
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3:
        return "bg-red-500"; // 優先度1 → 赤
      case 2:
        return "bg-yellow-500"; // 優先度2 → 黄
      case 1:
        return "bg-green-500"; // 優先度3 → 緑
      default:
        return "bg-gray-400"; // デフォルト（優先度不明） → 灰色
    }
  };

  return (
    <div className="space-y-1">
      {todos.map((todo) => (
        <div key={todo.id} className="flex items-center">
          <input
            type="checkbox"
            checked={todo.isDone}
            className="mr-1.5 cursor-pointer"
            onChange={() => updateIsDone(todo.id, !todo.isDone)}
          />
          <span className={todo.isDone ? "line-through" : ""}>{todo.name}</span>

          {/* 優先度を図形で表示 */}
          <div
            className={`ml-2 w-6 h-6 rounded-full ${getPriorityColor(todo.priority)}`}
            title={`優先度: ${todo.priority}`}
          />

          {todo.deadline && <span> 期限: {todo.deadline.toLocaleString()}</span>}

          <button
            onClick={() => {
              setEditTodoId(todo.id);
              setEditTodoName(todo.name);
              setEditTodoPriority(todo.priority);
              setEditTodoDeadline(todo.deadline);
            }}
            className="ml-2 text-blue-500 hover:text-blue-700"
          >
            編集
          </button>
          <button
            onClick={() => remove(todo.id)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            削除
          </button>
        </div>
      ))}
    </div>
  );
};

export default TodoList;

