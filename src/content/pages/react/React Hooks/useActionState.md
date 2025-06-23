---
title: "useActionState"
description: "useActionState - 详细介绍和实践指南"
order: 1
draft: false
published: true
createdAt: 2025-06-20
author: "Fanmu"
tags: ["React", "React Hooks"]
showInMenu: true
menuLabel: "useActionState"
---

# useActionState

`useActionState` 是一个可以根据某个表单动作的结果更新 state 的 Hook。

```js
const [state, formAction, isPending] = useActionState(fn, initialState, permalink?);
```

## 参数

1. `fn` 要执行的一步函数，通常是服务器操作
2. `initialState` 初始状态值
3. `permalink?` 可选的永久链接，用于渐进值增强

## 返回值

1. `state` 当前状态，`form` 表单内容
2. `formAction` 可以传递给表单操作的函数
3. `isPending` 布尔值，表示操作是否在进行中

## 表单提交示例

```js
// 一个简单的表单示例
import { useActionState } from 'react';

const FormDemo = () => {

  // 调用 api 逻辑
  const apiFn = async(previousState, formData) => {
    // previousState 上次提交状态
    // formData 当前提交数据
    console.log(Object.fromEntries(formData.entries()))

    const name = formData.get('name');
    const email = formData.get('email');

    // 这里可以进行表单验证
    // 简单的验证
		if (!name || !email) {
			return {
				error: "姓名和邮箱都是必填项",
				success: false,
			};
		}

		if (!email.includes("@")) {
			return {
				error: "请输入有效的邮箱地址",
				success: false,
			};
		}

    // 当验证通过后 还是与后端接口进行交互 模拟网络延迟
		await new Promise((resolve) => setTimeout(resolve, 1000));

    // 成功后，返回成功参数
    return {
      data: `${name} 用户创建成功`,
      success: true,
      error: ''
    }
  }

  // 当前状态 - 表单操作函数  - loading 状态
  // api 方法， 默认值
  const [state, formAction, isPending] = useActionState(apiFn, {
    data: null,
    error: null,
    success: false
  })

  return (
    <div>
      <form active="formAction" >
        <label htmlFor='name' >姓名：</label>
        <input name="name" type='text' disabled={isPending}>
        <label htmlFor='email'>姓名：</label>
        <input name="email" type='text' disabled={isPending}>

        <button type="submit" disabled={isPending}>提交 {isPending ? '用户信息创建中 ~ ' : ''}</button>
      </form>
    </div>
  )
}

```

## 新增列表的简单示例

通过 `previousState` 上次提交状态获取之前的提交数据，并结合列表进行返回

```js
import { useActionState } from 'react';

async function addTodoToServer(todoText: string) {
	// 模拟网络延迟
	await new Promise((resolve) => setTimeout(resolve, 800));

	// 随机失败模拟（20% 失败率）
	if (Math.random() < 0.2) {
		throw new Error("服务器错误");
	}

	return {
		id: Date.now(),
		text: todoText,
		pending: false,
	};
}

const ListDemo = () => {

  // 接收两个参数，上次状态值和本次提交的内容
  const apiFn = async (previousState, formData) => {
    const todoText = fromData.get('todo-text');
    // 简单验证，如果没有内容则直接报错
    if (!!todoText) {
      // 这里返回值就要使用上次提交的状态，来返回上次提交的内容
      // 返回结构与定义的默认数据保持一致

      return {
        ...perviousState,
        data: {
          list: perviousState?.data?.list || []
        },
        error: '请输入待办项内容',
        success: false,
      }
    }

    // 这里验证通过开始调用接口
    try {
      let data = await addTodoToServer(todoText);
      // 创建成功，则将内容加载进去
      return {
        ...perviousState,
        data: {
          list: [data, ...perviousState?.data?.list || []] || []
        },
        error: null,
        success: true,
      }
    } catch(err) {
      // 这里可以接口写了一个随机的报错
      return {
        ...perviousState,
        data: {
          list: perviousState?.data?.list || []
        },
        error: err,
        success: false,
      }
    }
  }
  const [state, formAction, isPending] = useActionState(apiFn, {
    data: {
      list: []
    },
    error: null,
    success: false
  })
  return (
    <div>
      <form action={formAction}>
        <input type="text" name="todo-text">
        <button type="submit">提交</button>
      </form>
      <div>
        <div>待办项列表</div>
        {
          state?.data?.list((item: any) => {
            return (
              <div>{item?.text} || '-'</div>
            )
          })
        }
      </div>
    </div>
  )
}
```

## `useActionState` 第三个参数 `permalink`

`useActionState` 的 `permalink` 参数是一个可选的第三个参数，它主要用于渐进式增强（Progressive Enhancement）场景，让表单在 `JavaScript` <code data-theme="error">被禁用或尚未加载时也能正常工作</code> 。

```js
const [state, formAction, isPending] = useActionState(
	actionFn,
	initialState,
	permalink // 🔥 第三个参数
);
```

### 主要用处

#### 1. 渐进式增强支持

当 JavaScript 被禁用时，表单会提交到 permalink 指定的 URL：

```js
function ContactForm() {
	const [state, formAction, isPending] = useActionState(
		async (previousState, formData) => {
			const name = formData.get("name");
			const email = formData.get("email");

			try {
				await submitContact({ name, email });
				return { success: true, message: "提交成功！" };
			} catch (error) {
				return { success: false, message: "提交失败，请重试" };
			}
		},
		{ success: false, message: "" },
		"/contact/submit" // 🔥 当 JS 禁用时，表单会提交到这个 URL
	);

	return (
		<form action={formAction}>
			<input name='name' type='text' required />
			<input name='email' type='email' required />
			<button type='submit' disabled={isPending}>
				{isPending ? "提交中..." : "提交"}
			</button>
			{state.message && <div>{state.message}</div>}
		</form>
	);
}
```

#### 2. SEO 和可访问性改善

搜索引擎爬虫和辅助技术可以理解表单的提交目标：

```js
function SearchForm() {
	const [state, formAction, isPending] = useActionState(
		async (previousState, formData) => {
			const query = formData.get("q");
			const results = await searchAPI(query);
			return { results, query };
		},
		{ results: [], query: "" },
		"/search" // 🔥 搜索引擎可以理解这是一个搜索表单
	);

	return (
		<form action={formAction}>
			<input
				name='q'
				type='search'
				placeholder='搜索...'
				defaultValue={state.query}
			/>
			<button type='submit'>搜索</button>

			{state.results.map((result) => (
				<div key={result.id}>{result.title}</div>
			))}
		</form>
	);
}
```

#### 3. 服务端渲染 (SSR) 场景

在 `Next.js` 等框架中，配合 `Server Actions` 使用：

```js
// app/comments/page.js
import { addComment } from "./actions";

function CommentForm({ postId }) {
	const [state, formAction, isPending] = useActionState(
		addComment,
		{ comments: [], error: null },
		`/posts/${postId}/comments` // 🔥 SSR 时的备用提交路径
	);

	return (
		<form action={formAction}>
			<input type='hidden' name='postId' value={postId} />
			<textarea name='content' required />
			<button type='submit' disabled={isPending}>
				{isPending ? "发送中..." : "发送评论"}
			</button>
		</form>
	);
}

// app/comments/actions.js
("use server");

export async function addComment(previousState, formData) {
	const postId = formData.get("postId");
	const content = formData.get("content");

	try {
		const newComment = await saveComment({ postId, content });
		return {
			...previousState,
			comments: [...previousState.comments, newComment],
			error: null,
		};
	} catch (error) {
		return {
			...previousState,
			error: "评论发送失败",
		};
	}
}
```

#### 4. 后退按钮和书签支持

```js
function FilterForm() {
	const [state, formAction, isPending] = useActionState(
		async (previousState, formData) => {
			const category = formData.get("category");
			const price = formData.get("price");

			const products = await fetchProducts({ category, price });

			// 更新 URL（可选）
			const url = new URL(window.location);
			url.searchParams.set("category", category);
			url.searchParams.set("price", price);
			window.history.pushState({}, "", url);

			return { products, filters: { category, price } };
		},
		{ products: [], filters: {} },
		"/products/filter" // 🔥 支持直接访问和书签
	);

	return (
		<form action={formAction}>
			<select name='category'>
				<option value=''>所有分类</option>
				<option value='electronics'>电子产品</option>
				<option value='clothing'>服装</option>
			</select>

			<select name='price'>
				<option value=''>所有价格</option>
				<option value='0-100'>0-100元</option>
				<option value='100-500'>100-500元</option>
			</select>

			<button type='submit' disabled={isPending}>
				筛选
			</button>
		</form>
	);
}
```
