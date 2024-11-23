import React from "react";

// 引数の型を定義
type Props = {
  name: string;
  uncompletedCount: number; // タスクの未完了数を追加
};

// WelcomeMessage という関数コンポーネントの定義
const WelcomeMessage = (props: Props) => {
  const currentTime = new Date();
  const greeting =
    currentTime.getHours() < 12 ? "おはようございます" : "こんにちは";

  return (
    <div className="text-blue-700">
      {greeting}、{props.name}さん。
      <div>未完了のタスクは {props.uncompletedCount} 件です。</div>
    </div>
  );
};

// 他のファイルで WelcomeMessage を import できるようにする
export default WelcomeMessage;
