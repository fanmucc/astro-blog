---
title: "useReduce与useContext"
description: "useReduce与useContext - 详细介绍和实践指南"
order: 1
draft: false
published: true
createdAt: 2025-06-20
author: "Fanmu"
tags: ["React", "React Hooks"]
showInMenu: true
menuLabel: "useReduce与useContext"
---

# useReduce 与 useContext

`useReducer` 和 `useContext` 是 React 中两个强大的 Hook，它们可以单独使用，也可以结合使用来管理复杂的状态。

- `useReducer` 适合管理包含多个子值的服装状态逻辑
- `useContext` 用于再组件树种共享数据，避免`props`的层层传递

## `useReducer`

适合管理包含多个子值的复杂状态逻辑

基础语法

```js
const [state, dispatch] = useReducer(reducer, initialState);
```

基础使用

```js
import React, { useReducer } from "react";

// 定义 reducer 函数
function counterReducer(state, action) {
	switch (action.type) {
		case "increment":
			return { count: state.count + 1 };
		case "decrement":
			return { count: state.count - 1 };
		case "reset":
			return { count: 0 };
		default:
			return state;
	}
}

function Counter() {
	// 定义处理方法以及默认值
	const [state, dispatch] = useReducer(counterReducer, { count: 0 });

	return (
		<div>
			<p>Count: {state.count}</p>
			// 调用不同type 从而处理不同逻辑
			<button onClick={() => dispatch({ type: "increment" })}>+</button>
			<button onClick={() => dispatch({ type: "decrement" })}>-</button>
			<button onClick={() => dispatch({ type: "reset" })}>Reset</button>
		</div>
	);
}
```

## `useContext`

在组件树中共享数据，避免 props 层层传递

基础使用

```js
import React, { createContext, useContext } from "react";

// 创建 Context
const ThemeContext = createContext();

// 父组件提供 Context
function App() {
	return (
		<ThemeContext.Provider value='dark'>
			<Header />
		</ThemeContext.Provider>
	);
}

// 子组件消费 Context
function Header() {
	const theme = useContext(ThemeContext);
	return <h1 className={theme}>Hello World {theme}</h1>;
}
```

同样也可以给设置默认配置

```js
import React, { createContext, useContext, useState } from "react";

const themeSetting = createContext({ theme: string, setTheme: (theme: Theme) => void } | undefined)(undefined);

// 创建自定义 hook
const useThemeHook = () => {
	const context = createContext(themeSetting);
	if (!context) {
		throw new Error("useAppContext must be used within AppProvider");
	}
	return context;
};

// 创建主题提供者组件
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
	const { theme, setTheme } = useState("light");
	return (
		<themeSetting.Provider value={{ theme: theme, setTheme }}>
			{children}
		</themeSetting.Provider>
	);
};

// 主题切换组件
const ThemeChange = () => {
  const { theme, setTheme } = useThemeHook()
  return (
    <div>
      <div>当前主题: {theme}</div>
      <button onClick={() => setTheme('light')}>light</button>
      <button onClick={() => setTheme('dark')}>dark</button>
    </div>
  )
}

return (
  <ThemeProvider>
    <ThemeChange></ThemeChange>
  </ThemeProvider>
)
```

## 简单的主题色切换

`useReducer` 与 `useContext`配合来实现一套简单的主题色切换

```js
import React, { createContext, useContext, useReducer } from "react";

// 1. 定义初始状态
const initialState = {
	user: null,
	theme: "light",
	notifications: [],
};

// 2. 定义 reducer
function appReducer(state, action) {
	switch (action.type) {
		case "SET_USER":
			return { ...state, user: action.payload };
		case "TOGGLE_THEME":
			return { ...state, theme: state.theme === "light" ? "dark" : "light" };
		case "ADD_NOTIFICATION":
			return {
				...state,
				notifications: [
					...state.notifications,
					{
						id: Date.now(),
						message: action.payload,
						timestamp: new Date().toLocaleTimeString(),
					},
				],
			};
		case "REMOVE_NOTIFICATION":
			return {
				...state,
				notifications: state.notifications.filter(
					(n) => n.id !== action.payload
				),
			};
		case "CLEAR_NOTIFICATIONS":
			return { ...state, notifications: [] };
		default:
			return state;
	}
}

// 3. 创建 Context
const AppContext = createContext();

// 4. 创建 Provider 组件
function AppProvider({ children }) {
	const [state, dispatch] = useReducer(appReducer, initialState);

	return (
		<AppContext.Provider value={{ state, dispatch }}>
			{children}
		</AppContext.Provider>
	);
}

// 5. 创建自定义 Hook 方便使用
function useAppContext() {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error("useAppContext must be used within AppProvider");
	}
	return context;
}

// 6. 组件示例
function Header() {
	const { state, dispatch } = useAppContext();

	return (
		<header
			className={`p-4 border-b ${
				state.theme === "dark"
					? "bg-gray-800 text-white"
					: "bg-white text-black"
			}`}
		>
			<div className='flex justify-between items-center'>
				<h1 className='text-xl font-bold'>My App</h1>
				<div className='flex gap-2'>
					<button
						onClick={() => dispatch({ type: "TOGGLE_THEME" })}
						className='px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600'
					>
						切换主题 ({state.theme})
					</button>
					{state.user ? (
						<span>Welcome, {state.user.name}!</span>
					) : (
						<button
							onClick={() =>
								dispatch({
									type: "SET_USER",
									payload: { name: "John Doe", id: 1 },
								})
							}
							className='px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600'
						>
							登录
						</button>
					)}
				</div>
			</div>
		</header>
	);
}

function NotificationPanel() {
	const { state, dispatch } = useAppContext();

	return (
		<div
			className={`p-4 ${
				state.theme === "dark" ? "bg-gray-700" : "bg-gray-100"
			}`}
		>
			<div className='flex justify-between items-center mb-4'>
				<h2 className='text-lg font-semibold'>通知中心</h2>
				<div className='flex gap-2'>
					<button
						onClick={() =>
							dispatch({
								type: "ADD_NOTIFICATION",
								payload: `新消息 #${Math.floor(Math.random() * 1000)}`,
							})
						}
						className='px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm'
					>
						添加通知
					</button>
					{state.notifications.length > 0 && (
						<button
							onClick={() => dispatch({ type: "CLEAR_NOTIFICATIONS" })}
							className='px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm'
						>
							清空所有
						</button>
					)}
				</div>
			</div>

			<div className='space-y-2'>
				{state.notifications.length === 0 ? (
					<p className='text-gray-500'>暂无通知</p>
				) : (
					state.notifications.map((notification) => (
						<div
							key={notification.id}
							className={`p-3 rounded border flex justify-between items-center ${
								state.theme === "dark"
									? "bg-gray-600 border-gray-500"
									: "bg-white border-gray-300"
							}`}
						>
							<div>
								<p className='font-medium'>{notification.message}</p>
								<p className='text-sm text-gray-500'>
									{notification.timestamp}
								</p>
							</div>
							<button
								onClick={() =>
									dispatch({
										type: "REMOVE_NOTIFICATION",
										payload: notification.id,
									})
								}
								className='text-red-500 hover:text-red-700 text-sm'
							>
								删除
							</button>
						</div>
					))
				)}
			</div>
		</div>
	);
}

function UserProfile() {
	const { state, dispatch } = useAppContext();

	if (!state.user) {
		return (
			<div
				className={`p-4 ${
					state.theme === "dark" ? "bg-gray-700" : "bg-gray-100"
				}`}
			>
				<p>请先登录</p>
			</div>
		);
	}

	return (
		<div
			className={`p-4 ${
				state.theme === "dark" ? "bg-gray-700" : "bg-gray-100"
			}`}
		>
			<h2 className='text-lg font-semibold mb-2'>用户信息</h2>
			<p>姓名: {state.user.name}</p>
			<p>ID: {state.user.id}</p>
			<button
				onClick={() => dispatch({ type: "SET_USER", payload: null })}
				className='mt-2 px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600'
			>
				退出登录
			</button>
		</div>
	);
}

// 7. 主应用组件
function App() {
	return (
		<AppProvider>
			<div className='min-h-screen'>
				<Header />
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4'>
					<NotificationPanel />
					<UserProfile />
				</div>
			</div>
		</AppProvider>
	);
}

export default App;
```
