# 已知问题和待修复项

## ✅ 已完成
- [x] 后端API部署成功
- [x] 数据库初始化成功
- [x] 管理员登录功能
- [x] 员工登录功能
- [x] 退出登录按钮
- [x] 显示当前用户名

## ⚠️ 待修复

### 1. 员工看不到管理员创建的任务
**原因**: 员工页面 (`employee.js`) 还在使用本地模拟数据，没有调用真实API

**解决方案**: 需要修改 `employee.js`，将所有数据获取改为调用API：
- 获取任务列表：`TaskAPI.getTasks({ assignee_id: currentUserId })`
- 更新任务状态：`TaskAPI.updateTask(taskId, data)`
- 上传文件：`TaskAPI.uploadFile(taskId, file)`

### 2. 管理员页面也需要连接真实API
**原因**: 管理员页面 (`admin.js`) 也在使用模拟数据

**解决方案**: 修改 `admin.js`，调用真实API：
- 获取统计数据：`StatsAPI.getStats()`
- 获取任务列表：`TaskAPI.getTasks()`
- 创建任务：`TaskAPI.createTask(data)`
- 获取员工列表：`EmployeeAPI.getEmployees()`

## 🚀 快速测试

### 测试API是否正常
```javascript
// 在浏览器控制台执行
TaskAPI.getTasks().then(tasks => console.log('任务列表:', tasks));
EmployeeAPI.getEmployees().then(emps => console.log('员工列表:', emps));
```

### 测试创建任务
```javascript
TaskAPI.createTask({
    title: '测试任务',
    type: 'child',
    status: 'pending',
    priority: 'high',
    deadline: '2024-03-30',
    assigneeId: 2, // 林诗雨的ID
    keywords: ['测试'],
    contribution: 30,
    description: '这是一个测试任务'
}).then(result => console.log('创建成功:', result));
```

## 📝 下一步计划

1. 先推送退出登录功能
2. 测试退出登录是否正常
3. 再修改前端连接真实API
4. 测试完整的任务创建和查看流程
