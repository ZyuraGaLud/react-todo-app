import { useState, useEffect } from "react";
import { Todo } from "./types";
import { initTodos } from "./initTodos";
import WelcomeMessage from "./WelcomeMessage";
import TodoList from "./TodoList";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { useRef } from "react";

const App = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoName, setNewTodoName] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState(3);
  const [newTodoDeadline, setNewTodoDeadline] = useState<Date | null>(null);
  const [newTodoNameError, setNewTodoNameError] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [editTodoId, setEditTodoId] = useState<string | null>(null); // 編集中のタスクID
  const [editTodoName, setEditTodoName] = useState<string>("");
  const [editTodoPriority, setEditTodoPriority] = useState<number>(3);
  const [editTodoDeadline, setEditTodoDeadline] = useState<Date | null>(null);

  const localStorageKey = "TodoApp";

  const uncompletedCount = todos.filter((todo: Todo) => !todo.isDone).length;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true); // 再生状態
  const [volume, setVolume] = useState(0.5); // 音量

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const isValidTodoName = (name: string): string => {
    if (name.length < 2 || name.length > 32) {
      return "2文字以上、32文字以内で入力してください";
    } else {
      return "";
    }
  };

  const updateIsDone = (id: string, value: boolean) => {
    const updatedTodos = todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, isDone: value };
      } else {
        return todo;
      }
    });
    setTodos(updatedTodos);
  };

  const updateNewTodoName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodoNameError(isValidTodoName(e.target.value));
    setNewTodoName(e.target.value);
  };

  const updateNewTodoPriority = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodoPriority(Number(e.target.value));
  };

  const remove = (id: string) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
  };

  const removeCompletedTodos = () => {
    const updatedTodos = todos.filter((todo) => !todo.isDone);
    setTodos(updatedTodos);
  };

  const addNewTodo = () => {
    const err = isValidTodoName(newTodoName);
    if (err !== "") {
      setNewTodoNameError(err);
      return;
    }
    const newTodo: Todo = {
      id: uuid(),
      name: newTodoName,
      isDone: false,
      priority: newTodoPriority,
      deadline: newTodoDeadline,
    };
    setTodos([...todos, newTodo]);
    setNewTodoName("");
    setNewTodoPriority(3);
    setNewTodoDeadline(null);
  };

  const saveEditedTodo = () => {
    const updatedTodos = todos.map((todo) =>
      todo.id === editTodoId
        ? { ...todo, name: editTodoName, priority: editTodoPriority, deadline: editTodoDeadline }
        : todo
    );
    setTodos(updatedTodos);
    resetEditState();
  };

  const resetEditState = () => {
    setEditTodoId(null);
    setEditTodoName("");
    setEditTodoPriority(3);
    setEditTodoDeadline(null);
  };

  useEffect(() => {
    const todoJsonStr = localStorage.getItem(localStorageKey);
    if (todoJsonStr && todoJsonStr !== "[]") {
      const storedTodos: Todo[] = JSON.parse(todoJsonStr);
      const convertedTodos = storedTodos.map((todo) => ({
        ...todo,
        deadline: todo.deadline ? new Date(todo.deadline) : null,
      }));
      setTodos(convertedTodos);
    } else {
      setTodos(initTodos);
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      localStorage.setItem(localStorageKey, JSON.stringify(todos));
    }
  }, [todos, initialized]);

  const updateDeadline = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dt = e.target.value;
    setNewTodoDeadline(dt === "" ? null : new Date(dt));
  };

  return (
    <div className="mx-4 mt-10 max-w-2xl md:mx-auto">
      <h1 className="mb-4 text-2xl font-bold">TodoApp</h1>
      
      {/* BG音楽の追加 */}
      <audio ref={audioRef} loop autoPlay>
        <source src="/Floor.mp3" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>

      {/* 音楽コントロール */}
      <div className="my-4 flex items-center space-x-4">
        <button
          onClick={togglePlay}
          className="rounded-md bg-blue-500 px-3 py-1 font-bold text-white hover:bg-blue-600"
        >
          {isPlaying ? "停止" : "再生"}
        </button>
        <div className="flex items-center space-x-2">
          <label className="font-bold text-gray-700">音量</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-32"
          />
        </div>
      </div>

      <div className="mb-4">
        <WelcomeMessage name="寝屋川タヌキ" uncompletedCount={uncompletedCount} />
      </div>
      <TodoList
        todos={todos}
        updateIsDone={updateIsDone}
        remove={remove}
        setEditTodoId={setEditTodoId}
        setEditTodoName={setEditTodoName}
        setEditTodoPriority={setEditTodoPriority}
        setEditTodoDeadline={setEditTodoDeadline}
      />

      {/* 一括削除ボタン */}
      <div className="mt-5">
        <button
          type="button"
          onClick={removeCompletedTodos}
          className="rounded-md bg-red-500 px-3 py-1 font-bold text-white hover:bg-red-600"
        >
          完了済みのタスクを削除
        </button>
      </div>

      <div className="mt-5 space-y-2 rounded-md border p-3">
        <h2 className="text-lg font-bold">{editTodoId ? "タスクの編集" : "新しいタスクの追加"}</h2>

        {/* 編集フォーム */}
        {editTodoId ? (
          <>
            <div>
              <label className="font-bold" htmlFor="editTodoName">名前</label>
              <input
                id="editTodoName"
                type="text"
                value={editTodoName}
                onChange={(e) => setEditTodoName(e.target.value)}
                className="grow rounded-md border p-2"
                placeholder="2文字以上、32文字以内で入力してください"
              />
            </div>

            <div className="flex gap-5">
              <div className="font-bold">優先度</div>
              {[1, 2, 3].map((value) => (
                <label key={value} className="flex items-center space-x-1">
                  <input
                    id={`editPriority-${value}`}
                    name="priorityGroup"
                    type="radio"
                    value={value}
                    checked={editTodoPriority === value}
                    onChange={(e) => setEditTodoPriority(Number(e.target.value))}
                  />
                  <span>{value}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center gap-x-2">
              <label htmlFor="editDeadline" className="font-bold">期限</label>
              <input
                type="datetime-local"
                id="editDeadline"
                value={editTodoDeadline ? dayjs(editTodoDeadline).format("YYYY-MM-DDTHH:mm:ss") : ""}
                onChange={(e) => setEditTodoDeadline(e.target.value ? new Date(e.target.value) : null)}
                className="rounded-md border border-gray-400 px-2 py-0.5"
              />
            </div>
            <button
              type="button"
              onClick={saveEditedTodo}
              className="mt-5 rounded-md bg-indigo-500 px-3 py-1 font-bold text-white hover:bg-indigo-600"
            >
              保存
            </button>
            <button
              type="button"
              onClick={resetEditState}
              className="mt-5 rounded-md bg-gray-500 px-3 py-1 font-bold text-white hover:bg-gray-600"
            >
              キャンセル
            </button>
          </>
        ) : (
          <>
            <div>
              <div className="flex items-center space-x-2">
                <label className="font-bold" htmlFor="newTodoName">名前</label>
                <input
                  id="newTodoName"
                  type="text"
                  value={newTodoName}
                  onChange={updateNewTodoName}
                  className={twMerge(
                    "grow rounded-md border p-2",
                    newTodoNameError && "border-red-500 outline-red-500"
                  )}
                  placeholder="2文字以上、32文字以内で入力してください"
                />
              </div>
              {newTodoNameError && (
                <div className="ml-10 flex items-center space-x-1 text-sm font-bold text-red-500">
                  <FontAwesomeIcon icon={faTriangleExclamation} className="mr-0.5" />
                  <div>{newTodoNameError}</div>
                </div>
              )}
            </div>

            <div className="flex gap-5">
              <div className="font-bold">優先度</div>
              {[1, 2, 3].map((value) => (
                <label key={value} className="flex items-center space-x-1">
                  <input
                    id={`priority-${value}`}
                    name="priorityGroup"
                    type="radio"
                    value={value}
                    checked={newTodoPriority === value}
                    onChange={updateNewTodoPriority}
                  />
                  <span>{value}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center gap-x-2">
              <label htmlFor="newDeadline" className="font-bold">期限</label>
              <input
                type="datetime-local"
                id="newDeadline"
                value={newTodoDeadline ? dayjs(newTodoDeadline).format("YYYY-MM-DDTHH:mm:ss") : ""}
                onChange={updateDeadline}
                className="rounded-md border border-gray-400 px-2 py-0.5"
              />
            </div>
            <button
              type="button"
              onClick={addNewTodo}
              className="mt-5 rounded-md bg-indigo-500 px-3 py-1 font-bold text-white hover:bg-indigo-600"
            >
              追加
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
