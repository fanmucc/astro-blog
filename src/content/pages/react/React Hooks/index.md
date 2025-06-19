---
title: "React Hooks"
description: "React Hooks - 入门指南和核心概念"
order: 1
draft: false
published: true
createdAt: 2025-06-17
author: "Fanmu"
tags: ["React", "入门"]
showInMenu: true
menuLabel: "React Hooks"
showMdMenu: false
---

# React Hooks

## 第一部分：核心基础 Hooks（必须掌握）

### 1. 状态管理类

- [x] [`useState`](/react/react-hooks/usestate) - 最基础的状态管理
- [ ] `useReducer` - 复杂状态逻辑管理
- [ ] `useContext` - 跨组件状态共享

### 2. 副作用处理类

- [x] [`useEffect`](/react/react-hooks/useeffect) - 处理副作用和生命周期
- [ ] `useLayoutEffect` - 同步副作用（DOM 更新后，浏览器绘制前）
- [ ] `useInsertionEffect` - 在 DOM 修改前执行（主要用于 CSS-in-JS）

### 3. 引用管理类

- [ ] `useRef` - DOM 引用和可变值存储
- [ ] `useImperativeHandle` - 自定义组件暴露的引用值

## 第二部分：性能优化与高级 Hooks 4. 性能优化类

- [ ] `useMemo` - 缓存计算结果
- [ ] `useCallback` - 缓存函数引用
- [ ] `useTransition` - 标记非紧急状态更新
- [ ] `useDeferredValue` - 延迟更新值

### 5. 外部数据同步类

- [ ] `useSyncExternalStore` - 订阅外部数据源

### 6. 工具类

- [ ] `useId` - 生成唯一 ID
- [ ] `useDebugValue` - 在 React DevTools 中显示调试信息

### 7. 表单与操作类（React 19 新增）

- [ ] `useActionState` - 管理异步操作状态（原 useFormState）
- [ ] `useFormStatus` - 获取表单提交状态（来自 react-dom） ReactReact
- [ ] `useOptimistic` - 乐观更新状态
