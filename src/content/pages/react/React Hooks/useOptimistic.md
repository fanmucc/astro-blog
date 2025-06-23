---
title: "useOptimistic"
description: "useOptimistic - 详细介绍和实践指南"
order: 1
draft: false
published: true
createdAt: 2025-06-23
author: "Fanmu"
tags: ["React", "React Hooks"]
showInMenu: true
menuLabel: "useOptimistic"
---

# useOptimistic

`useOptimistic` 帮助你更乐观地更新用户界面。

- `useOptimistic` 和 之前的参数列表要保持一致，不然会导致最终数据可能不一致
- 添加乐观更新数据时，会手动设置 loading 值，再从 api 拿到数据后会进行数据重置，<code data-theme="info">不要忘记</code>
- 这样当数据加载成功或者失败，都会同步在 `optimisticTodos` 数据，这样就实现了，错误重置，成功则隐藏 loading 提示

```js
const TodoList = () => {
	const [todos, setTodos] = useState<any[]>([]);

	const [optimisticTodos, addOptimistic] = useOptimistic(
		todos,
		(state, newData) => [newData, ...state]
	);

	// apiFn
	const apiFn = async (pervState: any, formData: FormData) => {
		// 获取到 todo 元素
		const todo = formData.get("todo") as string;

		// 验证
		if (!todo) {
			return {
				...pervState,
				todos: [...pervState.todos],
				error: "todo is required",
				success: false,
			};
		}

		// 乐观更新
		addOptimistic({
			id: `temp-${Date.now()}`,
			text: todo,
			optimistic: true,
		});

		// 🔥 关键修复：直接在这里处理异步操作并返回状态
		try {
			// 添加到服务器 这里进行模拟 2s
			const newTodo = await new Promise((resolve, reject) => {
				setTimeout(() => {
					// 模拟 90% 成功率
					if (Math.random() > 0.1) {
						resolve({
							id: Date.now(),
							text: todo,
						});
					} else {
						reject(new Error("发送失败"));
					}
				}, 2000);
			});
			console.log(newTodo);

			// 成功后更新实际的 todos 状态
			setTodos((prevTodos) => [newTodo as any, ...prevTodos]);

			return {
				...pervState,
				todos: [newTodo as any, ...pervState.todos],
				error: null,
				success: true,
			};
		} catch (error) {
			console.log(error);
			return {
				...pervState,
				todos: [...pervState.todos],
				error: "发送失败",
				success: false,
			};
		}
	};

	// actionState
	const [state, formAction, isPending] = useActionState(apiFn, {
		todos: [],
		error: null,
		success: true,
	});

	console.log(state);

	const handleAddTodo = (formData: FormData) => {
		formAction(formData);
	};

	return (
		<div className='todo-container'>
			<div className='todo-form-section'>
				<form action={handleAddTodo} className='todo-form'>
					<div className='input-group'>
						<input
							type='text'
							name='todo'
							placeholder='输入待办事项...'
							className='todo-input'
							required
						/>
						<button type='submit' className='add-button' disabled={isPending}>
							{isPending ? "添加中..." : "添加"}
						</button>
					</div>
				</form>
			</div>

			<div className='todo-list-section'>
				<h4>待办事项列表</h4>
				{optimisticTodos.length === 0 ? (
					<div className='empty-state'>
						<p>暂无待办事项</p>
						<span>快来添加第一个吧！</span>
					</div>
				) : (
					<ul className='todo-list'>
						{[...optimisticTodos].map((todo, index) => (
							<li
								key={todo.id || index}
								className={`todo-item ${todo.optimistic ? "optimistic" : ""}`}
							>
								<div className='todo-content'>
									<span className='todo-text'>{todo.text}</span>
									{todo.optimistic && (
										<span className='processing-indicator'>
											<span className='dot'></span>
											<span className='dot'></span>
											<span className='dot'></span>
											处理中...
										</span>
									)}
								</div>
							</li>
						))}
					</ul>
				)}
			</div>
			{state?.error && <div className='error-message'>❌ {state.error}</div>}
		</div>
	);
};
```
