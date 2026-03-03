# 快速测试：验证问题

## 测试1: 检查管理员创建的任务是否保存到数据库

1. 用管理员登录
2. 创建一个任务，分配给林诗雨
3. 打开控制台（F12）
4. 输入：
```javascript
TaskAPI.getTasks().then(tasks => {
    console.log('数据库中的任务数量:', tasks.length);
    console.table(tasks);
});
```

**预期结果**: 
- 如果能看到刚创建的任务 → 说明保存成功
- 如果看不到 → 说明管理员页面没有调用API

## 测试2: 检查员工能否看到任务

1. 退出登录
2. 用林诗雨登录（linshiyu/123456）
3. 查看"我的任务"页面

**预期结果**:
- 如果能看到任务 → 说明一切正常
- 如果看不到 → 说明管理员没有正确创建任务

## 测试3: 直接通过API创建任务

在控制台输入：
```javascript
TaskAPI.createTask({
    title: '测试任务-直接创建',
    type: 'child',
    status: 'pending',
    priority: 'high',
    deadline: '2024-03-30',
    assigneeId: 2, // 林诗雨的ID
    keywords: ['测试'],
    contribution: 30,
    description: '这是通过API直接创建的测试任务'
}).then(result => {
    console.log('创建成功:', result);
    alert('任务创建成功！ID: ' + result.id);
});
```

然后：
1. 退出登录
2. 用林诗雨登录
3. 应该能看到这个任务

**如果能看到** → 说明API正常，问题在于管理员页面没有调用API
**如果看不到** → 说明API或数据库有问题

## 🎯 结论

根据测试结果，我们就知道问题出在哪里了。

请先运行这些测试，然后告诉我结果！
