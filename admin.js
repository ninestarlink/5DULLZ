// 管理员后台主逻辑 - 完全使用真实API
document.addEventListener('DOMContentLoaded', async function() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentArea = document.getElementById('contentArea');
    const pageTitle = document.getElementById('pageTitle');
    const aiTaskBtn = document.getElementById('aiTaskBtn');
    
    // 获取当前用户信息
    let currentUser = null;
    try {
        currentUser = await AuthAPI.getCurrentUser();
        console.log('当前管理员:', currentUser);
        if (currentUser.role !== 'admin') {
            alert('权限不足，请使用管理员账户登录');
            window.location.href = 'index.html';
            return;
        }
    } catch (error) {
        console.error('获取用户信息失败:', error);
        alert('获取用户信息失败，请重新登录');
        window.location.href = 'index.html';
        return;
    }
    
    // 更新用户显示
    if (currentUser) {
        const nameEl = document.getElementById('currentUserName');
        if (nameEl) nameEl.textContent = currentUser.name;
    }
    
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
    
    // AI任务生成按钮
    aiTaskBtn.addEventListener('click', function() {
        navItems.forEach(i => i.classList.remove('active'));
        document.querySelector('[data-page="ai-task"]').classList.add('active');
        pageTitle.textContent = 'AI任务生成';
        renderAITaskPage();
    });
    
    // 加载页面
    async function loadPage(page) {
        switch(page) {
            case 'dashboard':
                pageTitle.textContent = '数据看板';
                await renderDashboard();
                break;
            case 'ai-task':
                pageTitle.textContent = 'AI任务生成';
                renderAITaskPage();
                break;
            case 'task-manage':
                pageTitle.textContent = '任务管理';
                await renderTaskManage();
                break;
            case 'employee':
                pageTitle.textContent = '员工管理';
                await renderEmployeeManage();
                break;
            case 'settings':
                pageTitle.textContent = '系统设置';
                renderSettings();
                break;
        }
    }
    
    // ==================== 数据看板 ====================
    async function renderDashboard() {
        try {
            // 显示加载状态
            contentArea.innerHTML = '<div style="text-align: center; padding: 60px;"><div style="font-size: 48px;">⏳</div><p>加载中...</p></div>';
            
            // 获取真实数据
            const [stats, tasks, employees] = await Promise.all([
                StatsAPI.getStats(),
                TaskAPI.getTasks(),
                EmployeeAPI.getEmployees()
            ]);
            
            console.log('统计数据:', stats);
            console.log('任务列表:', tasks);
            console.log('员工列表:', employees);
            
            // 计算统计数据
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(t => t.status === 'completed').length;
            const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
            const avgLoad = employees.reduce((sum, emp) => sum + (emp.currentLoad || 0), 0) / employees.length;
            
            contentArea.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6);">📋</div>
                        <div class="stat-info">
                            <div class="stat-label">总任务数</div>
                            <div class="stat-value">${totalTasks}</div>
                            <div class="stat-trend">
                                <span class="trend-up">↑ ${completedTasks} 已完成</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #10b981, #059669);">✅</div>
                        <div class="stat-info">
                            <div class="stat-label">任务完成率</div>
                            <div class="stat-value">${totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0}%</div>
                            <div class="stat-trend">
                                <span>${completedTasks}/${totalTasks} 任务</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b, #ef4444);">👥</div>
                        <div class="stat-info">
                            <div class="stat-label">员工负荷</div>
                            <div class="stat-value">${Math.round(avgLoad)}%</div>
                            <div class="stat-trend">
                                <span>${employees.length} 名员工</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #8b5cf6, #6366f1);">⏳</div>
                        <div class="stat-info">
                            <div class="stat-label">进行中</div>
                            <div class="stat-value">${pendingTasks}</div>
                            <div class="stat-trend">
                                <span>待完成任务</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-top: 24px;">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">📊 最近任务</h3>
                        </div>
                        <div style="padding: 20px;">
                            ${tasks.slice(0, 5).map(task => `
                                <div style="padding: 12px; background: var(--bg-tertiary); border-radius: 8px; margin-bottom: 12px; border-left: 3px solid var(--primary);">
                                    <div style="display: flex; justify-content: space-between; align-items: start;">
                                        <div style="flex: 1;">
                                            <h4 style="font-weight: 600; margin-bottom: 4px;">${task.title}</h4>
                                            <p style="font-size: 13px; color: var(--text-muted);">分配给: ${task.assigneeName || '未分配'}</p>
                                        </div>
                                        <span class="status-badge status-${task.status}">${getStatusText(task.status)}</span>
                                    </div>
                                </div>
                            `).join('') || '<p style="text-align: center; color: var(--text-muted); padding: 40px;">暂无任务</p>'}
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">👥 员工状态</h3>
                        </div>
                        <div style="padding: 20px;">
                            ${employees.map(emp => `
                                <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-tertiary); border-radius: 8px; margin-bottom: 12px;">
                                    <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
                                        ${emp.avatar || emp.name[0]}
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; font-size: 14px;">${emp.name}</div>
                                        <div style="font-size: 12px; color: var(--text-muted);">负荷: ${emp.currentLoad || 0}%</div>
                                    </div>
                                    <div style="width: 60px; height: 6px; background: var(--bg-secondary); border-radius: 3px; overflow: hidden;">
                                        <div style="width: ${emp.currentLoad || 0}%; height: 100%; background: ${emp.currentLoad > 80 ? 'var(--danger)' : 'var(--success)'}; transition: width 0.3s;"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('加载数据看板失败:', error);
            contentArea.innerHTML = `
                <div style="text-align: center; padding: 60px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">😕</div>
                    <h3 style="color: var(--text-primary); margin-bottom: 8px;">加载失败</h3>
                    <p style="color: var(--text-muted); margin-bottom: 20px;">${error.message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">重新加载</button>
                </div>
            `;
        }
    }
    
    // 获取状态文本
    function getStatusText(status) {
        const map = {
            pending: '待处理',
            in_progress: '进行中',
            review: '待审核',
            completed: '已完成'
        };
        return map[status] || status;
    }
    
    // ==================== AI任务生成 ====================
    function renderAITaskPage() {
        contentArea.innerHTML = `
            <div style="text-align: center; padding: 60px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🚧</div>
                <h3 style="color: var(--text-primary); margin-bottom: 8px;">AI任务生成功能开发中</h3>
                <p style="color: var(--text-muted); margin-bottom: 20px;">此功能需要集成智谱AI API，正在开发中...</p>
                <button class="btn btn-primary" onclick="document.querySelector('[data-page=\\"task-manage\\"]').click()">前往任务管理</button>
            </div>
        `;
    }
    
    // ==================== 任务管理 ====================
    async function renderTaskManage() {
        try {
            contentArea.innerHTML = '<div style="text-align: center; padding: 60px;"><div style="font-size: 48px;">⏳</div><p>加载中...</p></div>';
            
            const [tasks, employees] = await Promise.all([
                TaskAPI.getTasks(),
                EmployeeAPI.getEmployees()
            ]);
            
            console.log('任务列表:', tasks);
            
            contentArea.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <div>
                        <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 4px;">任务列表</h2>
                        <p style="color: var(--text-muted); font-size: 14px;">共 ${tasks.length} 个任务</p>
                    </div>
                    <button class="btn btn-primary" onclick="showCreateTaskModal()">➕ 创建任务</button>
                </div>
                
                <div class="card">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--border);">
                                <th style="padding: 16px; text-align: left; font-weight: 600;">任务名称</th>
                                <th style="padding: 16px; text-align: left; font-weight: 600;">分配给</th>
                                <th style="padding: 16px; text-align: left; font-weight: 600;">状态</th>
                                <th style="padding: 16px; text-align: left; font-weight: 600;">优先级</th>
                                <th style="padding: 16px; text-align: left; font-weight: 600;">截止日期</th>
                                <th style="padding: 16px; text-align: left; font-weight: 600;">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tasks.length > 0 ? tasks.map(task => `
                                <tr style="border-bottom: 1px solid var(--border);">
                                    <td style="padding: 16px;">
                                        <div style="font-weight: 600;">${task.title}</div>
                                        <div style="font-size: 13px; color: var(--text-muted);">${task.description || '无描述'}</div>
                                    </td>
                                    <td style="padding: 16px;">${task.assigneeName || '未分配'}</td>
                                    <td style="padding: 16px;">
                                        <span class="status-badge status-${task.status}">${getStatusText(task.status)}</span>
                                    </td>
                                    <td style="padding: 16px;">
                                        <span class="priority-badge priority-${task.priority}">${getPriorityText(task.priority)}</span>
                                    </td>
                                    <td style="padding: 16px;">${task.deadline || '无'}</td>
                                    <td style="padding: 16px;">
                                        <button class="btn btn-sm btn-secondary" onclick="editTask(${task.id})" style="margin-right: 8px;">编辑</button>
                                        <button class="btn btn-sm btn-danger" onclick="deleteTask(${task.id})">删除</button>
                                    </td>
                                </tr>
                            `).join('') : `
                                <tr>
                                    <td colspan="6" style="padding: 60px; text-align: center; color: var(--text-muted);">
                                        <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
                                        <p>暂无任务，点击上方按钮创建第一个任务</p>
                                    </td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            `;
            
            // 保存员工列表供创建任务使用
            window.employeesList = employees;
            
        } catch (error) {
            console.error('加载任务列表失败:', error);
            contentArea.innerHTML = `
                <div style="text-align: center; padding: 60px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">😕</div>
                    <h3>加载失败</h3>
                    <p style="color: var(--text-muted);">${error.message}</p>
                </div>
            `;
        }
    }
    
    function getPriorityText(priority) {
        const map = { high: '高', medium: '中', low: '低' };
        return map[priority] || '中';
    }
    
    // 创建任务模态框
    window.showCreateTaskModal = function() {
        const employees = window.employeesList || [];
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2 class="modal-title">➕ 创建新任务</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <form id="createTaskForm" onsubmit="handleCreateTask(event)">
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500;">任务标题 *</label>
                            <input type="text" name="title" required style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px;">
                        </div>
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500;">任务描述</label>
                            <textarea name="description" rows="3" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px;"></textarea>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 500;">分配给</label>
                                <select name="assigneeId" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px;">
                                    <option value="">未分配</option>
                                    ${employees.map(emp => `<option value="${emp.id}">${emp.name}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 500;">优先级</label>
                                <select name="priority" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px;">
                                    <option value="low">低</option>
                                    <option value="medium" selected>中</option>
                                    <option value="high">高</option>
                                </select>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 500;">截止日期</label>
                                <input type="date" name="deadline" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px;">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 500;">贡献值</label>
                                <input type="number" name="contribution" value="30" min="0" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px;">
                            </div>
                        </div>
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500;">关键词（用逗号分隔）</label>
                            <input type="text" name="keywords" placeholder="例如: ULL,远大,5ms" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px;">
                        </div>
                        <div style="display: flex; gap: 12px; justify-content: flex-end;">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">取消</button>
                            <button type="submit" class="btn btn-primary" id="submitBtn">创建任务</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };
    
    // 处理创建任务
    window.handleCreateTask = async function(event) {
        event.preventDefault();
        const form = event.target;
        const submitBtn = form.querySelector('#submitBtn');
        const formData = new FormData(form);
        
        // 禁用按钮
        submitBtn.disabled = true;
        submitBtn.textContent = '创建中...';
        
        try {
            const taskData = {
                title: formData.get('title'),
                description: formData.get('description'),
                assigneeId: formData.get('assigneeId') ? parseInt(formData.get('assigneeId')) : null,
                priority: formData.get('priority'),
                deadline: formData.get('deadline') || null,
                contribution: parseInt(formData.get('contribution')) || 0,
                keywords: formData.get('keywords') ? formData.get('keywords').split(',').map(k => k.trim()) : [],
                type: 'child',
                status: 'pending'
            };
            
            console.log('创建任务:', taskData);
            const result = await TaskAPI.createTask(taskData);
            console.log('创建成功:', result);
            
            alert('任务创建成功！');
            form.closest('.modal').remove();
            await renderTaskManage(); // 重新加载任务列表
            
        } catch (error) {
            console.error('创建任务失败:', error);
            alert('创建任务失败: ' + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = '创建任务';
        }
    };
    
    // 编辑任务
    window.editTask = function(taskId) {
        alert('编辑功能开发中...\n任务ID: ' + taskId);
    };
    
    // 删除任务
    window.deleteTask = async function(taskId) {
        if (!confirm('确定要删除这个任务吗？')) return;
        
        try {
            await TaskAPI.deleteTask(taskId);
            alert('删除成功！');
            await renderTaskManage();
        } catch (error) {
            console.error('删除失败:', error);
            alert('删除失败: ' + error.message);
        }
    };
    
    // ==================== 员工管理 ====================
    async function renderEmployeeManage() {
        try {
            contentArea.innerHTML = '<div style="text-align: center; padding: 60px;"><div style="font-size: 48px;">⏳</div><p>加载中...</p></div>';
            
            const employees = await EmployeeAPI.getEmployees();
            console.log('员工列表:', employees);
            
            contentArea.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <div>
                        <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 4px;">员工列表</h2>
                        <p style="color: var(--text-muted); font-size: 14px;">共 ${employees.length} 名员工</p>
                    </div>
                </div>
                
                <div class="employee-grid">
                    ${employees.map(emp => `
                        <div class="employee-card">
                            <div class="employee-header">
                                <div class="employee-avatar">${emp.avatar || emp.name[0]}</div>
                                <div class="employee-info">
                                    <h3>${emp.name}</h3>
                                    <p>${emp.level || '员工'}</p>
                                </div>
                            </div>
                            <div class="employee-stats">
                                <div class="stat-item">
                                    <span class="stat-label">贡献值</span>
                                    <span class="stat-value">${emp.contribution || 0}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">完成率</span>
                                    <span class="stat-value">${emp.completionRate || 0}%</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">负荷</span>
                                    <span class="stat-value" style="color: ${emp.currentLoad > 80 ? 'var(--danger)' : 'var(--success)'};">${emp.currentLoad || 0}%</span>
                                </div>
                            </div>
                            <div class="employee-skills">
                                ${emp.skills && emp.skills.length > 0 ? emp.skills.map(skill => `<span class="tag">${skill}</span>`).join('') : '<span style="color: var(--text-muted);">暂无技能标签</span>'}
                            </div>
                            <div class="employee-actions">
                                <button class="btn btn-secondary" style="flex: 1;" onclick="viewEmployeeTasks(${emp.id})">查看任务</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
        } catch (error) {
            console.error('加载员工列表失败:', error);
            contentArea.innerHTML = `
                <div style="text-align: center; padding: 60px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">😕</div>
                    <h3>加载失败</h3>
                    <p style="color: var(--text-muted);">${error.message}</p>
                </div>
            `;
        }
    }
    
    // 查看员工任务
    window.viewEmployeeTasks = async function(employeeId) {
        try {
            const tasks = await TaskAPI.getTasks({ assignee_id: employeeId });
            const employee = window.employeesList?.find(e => e.id === employeeId);
            
            alert(`${employee?.name || '员工'} 的任务：\n\n共 ${tasks.length} 个任务\n已完成: ${tasks.filter(t => t.status === 'completed').length}\n进行中: ${tasks.filter(t => t.status === 'in_progress' || t.status === 'pending').length}`);
        } catch (error) {
            alert('获取任务失败: ' + error.message);
        }
    };
    
    // ==================== 系统设置 ====================
    function renderSettings() {
        contentArea.innerHTML = `
            <div style="text-align: center; padding: 60px;">
                <div style="font-size: 48px; margin-bottom: 16px;">⚙️</div>
                <h3 style="color: var(--text-primary); margin-bottom: 8px;">系统设置</h3>
                <p style="color: var(--text-muted);">设置功能开发中...</p>
            </div>
        `;
    }
    
    // 初始加载
    loadPage('dashboard');
});
