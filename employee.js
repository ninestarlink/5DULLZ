// 员工工作台主逻辑
document.addEventListener('DOMContentLoaded', async function() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentArea = document.getElementById('contentArea');
    const pageTitle = document.getElementById('pageTitle');
    const taskDetailModal = document.getElementById('taskDetailModal');
    
    // 获取当前用户信息
    let currentUser = null;
    try {
        currentUser = await AuthAPI.getCurrentUser();
        console.log('当前用户:', currentUser);
    } catch (error) {
        console.error('获取用户信息失败:', error);
        alert('获取用户信息失败，请重新登录');
        window.location.href = 'index.html';
        return;
    }
    
    // 更新用户信息显示
    function updateUserDisplay() {
        if (currentUser) {
            document.getElementById('userAvatar').textContent = currentUser.avatar || currentUser.name[0];
            document.getElementById('userName').textContent = currentUser.name;
            const roleMap = {
                'admin': '管理员',
                'employee': '员工'
            };
            document.getElementById('userRole').textContent = roleMap[currentUser.role] || '员工';
        }
    }
    
    updateUserDisplay();
    
    // 导航切换
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const page = this.dataset.page;
            loadPage(page);
        });
    });
    
    // 加载页面
    async function loadPage(page) {
        switch(page) {
            case 'my-tasks':
                pageTitle.textContent = '我的任务';
                await renderMyTasks();
                break;
            case 'profile':
                pageTitle.textContent = '个人资料';
                renderProfile();
                break;
            case 'notifications':
                pageTitle.textContent = '通知中心';
                await renderNotifications();
                break;
        }
    }
    
    // 渲染我的任务
    async function renderMyTasks() {
        try {
            // 从API获取任务
            const allTasks = await TaskAPI.getTasks({ assignee_id: currentUser.id });
            console.log('我的任务:', allTasks);
            
            // 按状态分组
            const tasksByStatus = {
                pending: allTasks.filter(t => t.status === 'pending'),
                in_progress: allTasks.filter(t => t.status === 'in_progress'),
                review: allTasks.filter(t => t.status === 'review'),
                completed: allTasks.filter(t => t.status === 'completed')
            };
            
            contentArea.innerHTML = `
                <div class="task-stats">
                    <div class="stat-card">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6);">📋</div>
                        <div class="stat-info">
                            <div class="stat-value">${allTasks.length}</div>
                            <div class="stat-label">总任务数</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b, #ef4444);">⏳</div>
                        <div class="stat-info">
                            <div class="stat-value">${tasksByStatus.pending.length + tasksByStatus.in_progress.length}</div>
                            <div class="stat-label">进行中</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #10b981, #059669);">✅</div>
                        <div class="stat-info">
                            <div class="stat-value">${tasksByStatus.completed.length}</div>
                            <div class="stat-label">已完成</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #8b5cf6, #6366f1);">💎</div>
                        <div class="stat-info">
                            <div class="stat-value">${currentUser.contribution || 0}</div>
                            <div class="stat-label">贡献值</div>
                        </div>
                    </div>
                </div>
                
                <div class="task-board">
                    ${renderTaskColumn('待处理', 'pending', tasksByStatus.pending)}
                    ${renderTaskColumn('进行中', 'in_progress', tasksByStatus.in_progress)}
                    ${renderTaskColumn('待审核', 'review', tasksByStatus.review)}
                    ${renderTaskColumn('已完成', 'completed', tasksByStatus.completed)}
                </div>
            `;
            
            // 绑定任务卡片点击事件
            document.querySelectorAll('.task-card').forEach(card => {
                card.addEventListener('click', function() {
                    const taskId = this.dataset.taskId;
                    const task = allTasks.find(t => t.id == taskId);
                    if (task) {
                        showTaskDetail(task);
                    }
                });
            });
            
        } catch (error) {
            console.error('获取任务失败:', error);
            contentArea.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">😕</div>
                    <h3 style="color: var(--text-primary); margin-bottom: 8px;">获取任务失败</h3>
                    <p style="color: var(--text-muted);">${error.message}</p>
                    <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 20px;">重新加载</button>
                </div>
            `;
        }
    }
    
    // 渲染任务列
    function renderTaskColumn(title, status, tasks) {
        const statusColors = {
            pending: '#f59e0b',
            in_progress: '#3b82f6',
            review: '#8b5cf6',
            completed: '#10b981'
        };
        
        return `
            <div class="task-column">
                <div class="column-header">
                    <h3>${title}</h3>
                    <span class="task-count">${tasks.length}</span>
                </div>
                <div class="task-list">
                    ${tasks.length > 0 ? tasks.map(task => `
                        <div class="task-card" data-task-id="${task.id}">
                            <div class="task-card-header">
                                <h4>${task.title}</h4>
                                <span class="priority-badge priority-${task.priority}">${getPriorityText(task.priority)}</span>
                            </div>
                            <div class="task-card-body">
                                <p>${task.description || '暂无描述'}</p>
                                ${task.keywords && task.keywords.length > 0 ? `
                                    <div class="task-tags">
                                        ${task.keywords.map(kw => `<span class="tag">${kw}</span>`).join('')}
                                    </div>
                                ` : ''}
                            </div>
                            <div class="task-card-footer">
                                <div class="task-meta">
                                    <span>📅 ${task.deadline || '无截止日期'}</span>
                                    <span>💎 ${task.contribution || 0}</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${task.progress || 0}%; background: ${statusColors[status]};"></div>
                                </div>
                            </div>
                        </div>
                    `).join('') : '<div class="empty-state">暂无任务</div>'}
                </div>
            </div>
        `;
    }
    
    // 获取优先级文本
    function getPriorityText(priority) {
        const map = {
            high: '高',
            medium: '中',
            low: '低'
        };
        return map[priority] || '中';
    }
    
    // 显示任务详情
    function showTaskDetail(task) {
        // 简化版任务详情
        alert(`任务详情：\n\n标题：${task.title}\n状态：${task.status}\n优先级：${task.priority}\n进度：${task.progress}%\n截止日期：${task.deadline || '无'}\n描述：${task.description || '无'}`);
    }
    
    // 渲染个人资料
    function renderProfile() {
        contentArea.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">👤 个人信息</h3>
                </div>
                <div style="padding: 20px;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary);">姓名</label>
                            <input type="text" value="${currentUser.name}" readonly style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-tertiary);">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary);">用户名</label>
                            <input type="text" value="${currentUser.username}" readonly style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-tertiary);">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary);">等级</label>
                            <input type="text" value="${currentUser.level || '普通员工'}" readonly style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-tertiary);">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary);">贡献值</label>
                            <input type="text" value="${currentUser.contribution || 0}" readonly style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-tertiary);">
                        </div>
                        <div style="grid-column: 1 / -1;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary);">技能标签</label>
                            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                ${currentUser.skills && currentUser.skills.length > 0 
                                    ? currentUser.skills.map(skill => `<span class="tag">${skill}</span>`).join('')
                                    : '<span style="color: var(--text-muted);">暂无技能标签</span>'
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <h3 class="card-title">📊 工作统计</h3>
                </div>
                <div style="padding: 20px;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                        <div style="text-align: center; padding: 20px; background: var(--bg-tertiary); border-radius: 12px;">
                            <div style="font-size: 32px; font-weight: 600; color: var(--primary);">${currentUser.tasksCompleted || 0}</div>
                            <div style="color: var(--text-muted); margin-top: 8px;">已完成任务</div>
                        </div>
                        <div style="text-align: center; padding: 20px; background: var(--bg-tertiary); border-radius: 12px;">
                            <div style="font-size: 32px; font-weight: 600; color: var(--success);">${currentUser.completionRate || 0}%</div>
                            <div style="color: var(--text-muted); margin-top: 8px;">完成率</div>
                        </div>
                        <div style="text-align: center; padding: 20px; background: var(--bg-tertiary); border-radius: 12px;">
                            <div style="font-size: 32px; font-weight: 600; color: var(--warning);">${currentUser.currentLoad || 0}%</div>
                            <div style="color: var(--text-muted); margin-top: 8px;">当前负荷</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 渲染通知中心
    async function renderNotifications() {
        try {
            const notifications = await NotificationAPI.getNotifications();
            console.log('通知列表:', notifications);
            
            contentArea.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">🔔 通知中心</h3>
                    </div>
                    <div style="padding: 20px;">
                        ${notifications.length > 0 ? notifications.map(notif => `
                            <div style="padding: 16px; background: ${notif.is_read ? 'var(--bg-tertiary)' : 'rgba(59, 130, 246, 0.1)'}; border-radius: 8px; margin-bottom: 12px; border-left: 3px solid var(--primary);">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                                    <h4 style="font-weight: 600; color: var(--text-primary);">${notif.title}</h4>
                                    <span style="font-size: 12px; color: var(--text-muted);">${new Date(notif.created_at).toLocaleString('zh-CN')}</span>
                                </div>
                                <p style="color: var(--text-secondary); margin-bottom: 8px;">${notif.content}</p>
                                ${!notif.is_read ? `<button class="btn btn-sm btn-primary" onclick="markAsRead(${notif.id})">标记已读</button>` : ''}
                            </div>
                        `).join('') : '<div class="empty-state">暂无通知</div>'}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('获取通知失败:', error);
            contentArea.innerHTML = `<div class="empty-state">获取通知失败</div>`;
        }
    }
    
    // 标记通知已读
    window.markAsRead = async function(notifId) {
        try {
            await NotificationAPI.markAsRead(notifId);
            await renderNotifications();
        } catch (error) {
            console.error('标记已读失败:', error);
            alert('操作失败');
        }
    };
    
    // 初始加载
    loadPage('my-tasks');
});
