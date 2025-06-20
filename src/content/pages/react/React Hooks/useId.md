---
title: "useId"
description: "useId - 详细介绍和实践指南"
order: 1
draft: false
published: true
createdAt: 2025-06-20
author: "Fanmu"
tags: ["React", "React Hooks"]
showInMenu: true
menuLabel: "useId"
---

# useId

`useId` 是一个 React Hook，可以生成传递给无障碍属性的唯一 ID。

- 保证稳定 id
- 做一些公共数据处理

## 公共前戳

```js
import { useId } from 'react';

const text = useId();
<div className={`${text}_1`}> 前戳 1 </div>
<div className={`${text}_2`}> 前戳 2 </div>
```

## 无障碍阅读

```js
// 没了解过，自定探索
import { useId } from "react";

function LoginForm() {
	const emailId = useId();
	const passwordId = useId();

	return (
		<form>
			<div>
				<label htmlFor={emailId}>邮箱：</label>
				<input id={emailId} type='email' />
			</div>
			<div>
				<label htmlFor={passwordId}>密码：</label>
				<input id={passwordId} type='password' />
			</div>
		</form>
	);
}
```
