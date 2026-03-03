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
            <div class="card" style="max-width: 900px; margin: 0 auto;">
                <div class="card-header">
                    <h3 class="card-title">💬 AI任务生成助手</h3>
                    <p style="color: var(--text-muted); font-size: 14px; margin-top: 8px;">描述你的需求，AI将自动生成详细的任务列表</p>
                </div>
                <div style="padding: 24px;">
                    <!-- 聊天区域 -->
                    <div id="chatMessages" style="min-height: 300px; max-height: 500px; overflow-y: auto; padding: 20px; background: var(--bg-tertiary); border-radius: 12px; margin-bottom: 20px;">
                        <div class="ai-message" style="display: flex; gap: 12px; margin-bottom: 16px;">
                            <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                🤖
                            </div>
                            <div style="flex: 1; background: var(--bg-card); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border);">
                                <p style="margin: 0; line-height: 1.6;">你好！我是AI任务助手。请告诉我你的需求，我会帮你生成详细的任务列表。</p>
                                <p style="margin: 8px 0 0 0; color: var(--text-muted); font-size: 13px;">例如："为新产品设计一套完整的营销方案" 或 "开发一个用户管理系统"</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 输入区域 -->
                    <div style="display: flex; gap: 12px;">
                        <textarea 
                            id="aiInput" 
                            placeholder="描述你的需求..." 
                            style="flex: 1; padding: 12px; border: 1px solid var(--border); border-radius: 12px; resize: none; min-height: 80px; font-family: inherit;"
                            onkeydown="if(event.key==='Enter' && event.ctrlKey) sendAIMessage()"
                        ></textarea>
                        <button class="btn btn-primary" onclick="sendAIMessage()" id="sendAIBtn" style="height: fit-content; padding: 12px 24px;">
                            发送
                        </button>
                    </div>
                    <p style="color: var(--text-muted); font-size: 12px; margin-top: 8px;">提示：按 Ctrl+Enter 快速发送</p>
                    
                    <!-- 生成的任务列表 -->
                    <div id="generatedTasks" style="margin-top: 24px; display: none;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                            <h4 style="font-size: 16px; font-weight: 600;">生成的任务列表</h4>
                            <button class="btn btn-primary" onclick="confirmGeneratedTasks()">确认创建所有任务</button>
                        </div>
                        <div id="tasksList"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 发送AI消息
    window.sendAIMessage = async function() {
        const input = document.getElementById('aiInput');
        const sendBtn = document.getElementById('sendAIBtn');
        const chatMessages = document.getElementById('chatMessages');
        const message = input.value.trim();
        
        if (!message) {
            alert('请输入需求描述');
            return;
        }
        
        // 禁用输入
        input.disabled = true;
        sendBtn.disabled = true;
        sendBtn.textContent = '生成中...';
        
        // 显示用户消息
        const userMsg = document.createElement('div');
        userMsg.style.cssText = 'display: flex; gap: 12px; margin-bottom: 16px; justify-content: flex-end;';
        userMsg.innerHTML = `
            <div style="max-width: 70%; background: var(--primary); color: white; padding: 12px 16px; border-radius: 12px;">
                <p style="margin: 0; line-height: 1.6;">${message}</p>
            </div>
            <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                👤
            </div>
        `;
        chatMessages.appendChild(userMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 显示加载消息
        const loadingMsg = document.createElement('div');
        loadingMsg.style.cssText = 'display: flex; gap: 12px; margin-bottom: 16px;';
        loadingMsg.innerHTML = `
            <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                🤖
            </div>
            <div style="flex: 1; background: var(--bg-card); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border);">
                <p style="margin: 0; color: var(--text-muted);">正在生成任务列表...</p>
            </div>
        `;
        chatMessages.appendChild(loadingMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        try {
            // 获取员工列表
            const employees = await EmployeeAPI.getEmployees();
            
            // 调用AI生成任务
            const tasks = await zhipuAI.generateTasks(message, { employees });
            
            console.log('AI生成的任务:', tasks);
            
            // 移除加载消息
            loadingMsg.remove();
            
            // 显示AI响应
            const aiMsg = document.createElement('div');
            aiMsg.style.cssText = 'display: flex; gap: 12px; margin-bottom: 16px;';
            aiMsg.innerHTML = `
                <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    🤖
                </div>
                <div style="flex: 1; background: var(--bg-card); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border);">
                    <p style="margin: 0; line-height: 1.6;">我已经为你生成了 ${tasks.length} 个任务，请查看下方列表。你可以编辑任务或直接创建。</p>
                </div>
            `;
            chatMessages.appendChild(aiMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // 显示任务列表
            displayGeneratedTasks(tasks, employees);
            
            // 清空输入
            input.value = '';
            
        } catch (error) {
            console.error('AI生成失败:', error);
            
            // 移除加载消息
            loadingMsg.remove();
            
            // 显示错误消息
            const errorMsg = document.createElement('div');
            errorMsg.style.cssText = 'display: flex; gap: 12px; margin-bottom: 16px;';
            errorMsg.innerHTML = `
                <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--danger); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    ❌
                </div>
                <div style="flex: 1; background: rgba(239, 68, 68, 0.1); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--danger);">
                    <p style="margin: 0; color: var(--danger);">生成失败：${error.message}</p>
                </div>
            `;
            chatMessages.appendChild(errorMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } finally {
            // 恢复输入
            input.disabled = false;
            sendBtn.disabled = false;
            sendBtn.textContent = '发送';
            input.focus();
        }
    };
    
    // 显示生成的任务
    async function displayGeneratedTasks(tasks, employees) {
        const container = document.getElementById('generatedTasks');
        const tasksList = document.getElementById('tasksList');
        
        // 为每个任务智能分配员工
        const tasksWithAssignment = await Promise.all(tasks.map(async (task) => {
            try {
                // 调用AI智能分配
                const suggestion = await zhipuAI.suggestAssignment(task, employees);
                return {
                    ...task,
                    suggestedEmployeeId: suggestion.employeeId,
                    assignmentReason: suggestion.reason
                };
            } catch (error) {
                console.error('智能分配失败:', error);
                // 如果AI分配失败，根据技能匹配
                const matchedEmployee = employees.find(emp => 
                    emp.skills && task.keywords && 
                    emp.skills.some(skill => task.keywords.some(kw => kw.includes(skill) || skill.includes(kw)))
                );
                return {
                    ...task,
                    suggestedEmployeeId: matchedEmployee?.id || null,
                    assignmentReason: matchedEmployee ? `技能匹配：${matchedEmployee.skills.join('、')}` : '未找到匹配员工'
                };
            }
        }));
        
        tasksList.innerHTML = tasksWithAssignment.map((task, index) => {
            const assignedEmployee = employees.find(e => e.id === task.suggestedEmployeeId);
            
            return `
            <div class="card" style="margin-bottom: 16px;" data-task-index="${index}">
                <div style="padding: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                        <div style="flex: 1;">
                            <input type="text" value="${task.title}" 
                                   class="task-title-input" 
                                   style="width: 100%; font-size: 16px; font-weight: 600; border: 1px solid var(--border); padding: 8px; border-radius: 6px; margin-bottom: 8px;">
                            <textarea class="task-desc-input" 
                                      style="width: 100%; border: 1px solid var(--border); padding: 8px; border-radius: 6px; min-height: 60px; resize: vertical;">${task.description}</textarea>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 12px;">
                        <div>
                            <label style="display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">优先级</label>
                            <select class="task-priority-input" style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: 6px;">
                                <option value="low" ${task.priority === 'low' ? 'selected' : ''}>低</option>
                                <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>中</option>
                                <option value="high" ${task.priority === 'high' ? 'selected' : ''}>高</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">
                                分配给 ${task.suggestedEmployeeId ? '🤖 AI推荐' : ''}
                            </label>
                            <select class="task-assignee-input" style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: 6px; ${task.suggestedEmployeeId ? 'background: rgba(59, 130, 246, 0.1);' : ''}">
                                ${employees.map(emp => `<option value="${emp.id}" ${emp.id === task.suggestedEmployeeId ? 'selected' : ''}>${emp.name}${emp.id === task.suggestedEmployeeId ? ' ⭐' : ''}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">贡献值</label>
                            <input type="number" value="${task.contribution || 30}" 
                                   class="task-contribution-input"
                                   style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: 6px;">
                        </div>
                    </div>
                    ${task.suggestedEmployeeId && assignedEmployee ? `
                        <div style="padding: 12px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; border-left: 3px solid var(--primary); margin-bottom: 12px;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                <span style="font-size: 12px; font-weight: 600; color: var(--primary);">🤖 AI推荐理由</span>
                            </div>
                            <p style="margin: 0; font-size: 13px; color: var(--text-secondary);">${task.assignmentReason}</p>
                            <div style="margin-top: 8px; display: flex; gap: 4px; flex-wrap: wrap;">
                                <span style="font-size: 11px; color: var(--text-muted);">员工技能：</span>
                                ${assignedEmployee.skills?.map(skill => `<span class="tag" style="font-size: 11px;">${skill}</span>`).join('') || '<span style="font-size: 11px; color: var(--text-muted);">无</span>'}
                            </div>
                        </div>
                    ` : ''}
                    <div style="display: flex; gap: 8px;">
                        ${task.keywords?.map(kw => `<span class="tag">${kw}</span>`).join('') || ''}
                    </div>
                </div>
            </div>
        `}).join('');
        
        container.style.display = 'block';
        
        // 保存任务数据
        window.generatedTasksData = tasksWithAssignment;
        window.generatedTasksEmployees = employees;
    }
    
    // 确认创建所有任务
    window.confirmGeneratedTasks = async function() {
        const taskCards = document.querySelectorAll('[data-task-index]');
        const tasks = [];
        
        // 收集所有任务数据
        taskCards.forEach((card, index) => {
            const title = card.querySelector('.task-title-input').value;
            const description = card.querySelector('.task-desc-input').value;
            const priority = card.querySelector('.task-priority-input').value;
            const assigneeId = card.querySelector('.task-assignee-input').value;
            const contribution = parseInt(card.querySelector('.task-contribution-input').value);
            const keywords = window.generatedTasksData[index].keywords || [];
            
            tasks.push({
                title,
                description,
                priority,
                assigneeId: assigneeId ? parseInt(assigneeId) : null,
                contribution,
                keywords,
                type: 'child',
                status: 'pending'
            });
        });
        
        if (tasks.length === 0) {
            alert('没有任务可创建');
            return;
        }
        
        if (!confirm(`确定要创建 ${tasks.length} 个任务吗？`)) {
            return;
        }
        
        // 显示进度
        const progressDiv = document.createElement('div');
        progressDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--bg-card); padding: 24px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 10000; min-width: 300px; text-align: center;';
        progressDiv.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
            <p style="margin: 0; font-weight: 600;">正在创建任务...</p>
            <p style="margin: 8px 0 0 0; color: var(--text-muted);" id="progressText">0 / ${tasks.length}</p>
        `;
        document.body.appendChild(progressDiv);
        
        try {
            let successCount = 0;
            
            // 逐个创建任务
            for (let i = 0; i < tasks.length; i++) {
                try {
                    await TaskAPI.createTask(tasks[i]);
                    successCount++;
                    document.getElementById('progressText').textContent = `${successCount} / ${tasks.length}`;
                } catch (error) {
                    console.error(`创建任务 ${i + 1} 失败:`, error);
                }
            }
            
            progressDiv.remove();
            
            alert(`成功创建 ${successCount} 个任务！`);
            
            // 跳转到任务管理页面
            document.querySelector('[data-page="task-manage"]').click();
            
        } catch (error) {
            progressDiv.remove();
            console.error('批量创建任务失败:', error);
            alert('创建任务失败: ' + error.message);
        }
    };
    
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
                                        <button class="btn btn-sm btn-primary" onclick="verifyTask(${task.id})" style="margin-right: 8px;">立即验收</button>
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
    window.editTask = async function(taskId) {
        try {
            const tasks = await TaskAPI.getTasks();
            const task = tasks.find(t => t.id === taskId);
            const employees = await EmployeeAPI.getEmployees();
            
            if (!task) {
                alert('任务不存在');
                return;
            }
            
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h2 class="modal-title">✏️ 编辑任务</h2>
                        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="editTaskForm" onsubmit="handleEditTask(event, ${taskId})">
                            <div style="margin-bottom: 16px;">
                                <label style="display: block; margin-bottom: 8px; font-weight: 500;">任务标题 *</label>
                                <input type="text" name="title" value="${task.title}" required style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px;">
                            </div>
                            <div style="margin-bottom: 16px;">
                                <label style="display: block; margin-bottom: 8px; font-weight: 500;">任务描述</label>
                                <textarea name="description" rows="3" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px;">${task.description || ''}</textarea>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">分配给</label>
                                    <select name="assigneeId" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px;">
                                        <option value="">未分配</option>
                                        ${employees.map(emp => `<option value="${emp.id}" ${emp.id == task.assignee_id ? 'selected' : ''}>${emp.name}</option>`).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">优先级</label>
                                    <select name="priority" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px;">
                                        <option value="low" ${task.priority === 'low' ? 'selected' : ''}>低</option>
                                        <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>中</option>
                                        <option value="high" ${task.priority === 'high' ? 'selected' : ''}>高</option>
                                    </select>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">状态</label>
                                    <select name="status" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px;">
                                        <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>待处理</option>
                                        <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>进行中</option>
                                        <option value="review" ${task.status === 'review' ? 'selected' : ''}>待审核</option>
                                        <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>已完成</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">截止日期</label>
                                    <input type="date" name="deadline" value="${task.deadline || ''}" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px;">
                                </div>
                            </div>
                            <div style="margin-bottom: 16px;">
                                <label style="display: block; margin-bottom: 8px; font-weight: 500;">贡献值</label>
                                <input type="number" name="contribution" value="${task.contribution || 0}" min="0" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px;">
                            </div>
                            <div style="margin-bottom: 16px;">
                                <label style="display: block; margin-bottom: 8px; font-weight: 500;">关键词（用逗号分隔）</label>
                                <input type="text" name="keywords" value="${task.keywords?.join(', ') || ''}" placeholder="例如: ULL,远大,5ms" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px;">
                            </div>
                            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">取消</button>
                                <button type="submit" class="btn btn-primary" id="editSubmitBtn">保存修改</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
        } catch (error) {
            console.error('加载任务失败:', error);
            alert('加载任务失败: ' + error.message);
        }
    };
    
    // 处理编辑任务
    window.handleEditTask = async function(event, taskId) {
        event.preventDefault();
        const form = event.target;
        const submitBtn = form.querySelector('#editSubmitBtn');
        const formData = new FormData(form);
        
        submitBtn.disabled = true;
        submitBtn.textContent = '保存中...';
        
        try {
            const taskData = {
                title: formData.get('title'),
                description: formData.get('description'),
                assigneeId: formData.get('assigneeId') ? parseInt(formData.get('assigneeId')) : null,
                priority: formData.get('priority'),
                status: formData.get('status'),
                deadline: formData.get('deadline') || null,
                contribution: parseInt(formData.get('contribution')) || 0,
                keywords: formData.get('keywords') ? formData.get('keywords').split(',').map(k => k.trim()) : []
            };
            
            console.log('更新任务:', taskId, taskData);
            await TaskAPI.updateTask(taskId, taskData);
            
            alert('任务更新成功！');
            form.closest('.modal').remove();
            await renderTaskManage();
            
        } catch (error) {
            console.error('更新任务失败:', error);
            alert('更新任务失败: ' + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = '保存修改';
        }
    };
    
    // 立即验收任务
    window.verifyTask = async function(taskId) {
        try {
            const tasks = await TaskAPI.getTasks();
            const task = tasks.find(t => t.id === taskId);
            
            if (!task) {
                alert('任务不存在');
                return;
            }
            
            if (!task.keywords || task.keywords.length === 0) {
                alert('该任务没有设置关键词，无法验收');
                return;
            }
            
            // 创建验收弹窗
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h2 class="modal-title">🔍 AI验收任务</h2>
                        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div style="margin-bottom: 20px;">
                            <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">${task.title}</h3>
                            <p style="color: var(--text-muted); margin-bottom: 16px;">${task.description || '无描述'}</p>
                            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                <span style="font-weight: 500;">关键词：</span>
                                ${task.keywords.map(kw => `<span class="tag">${kw}</span>`).join('')}
                            </div>
                        </div>
                        
                        <div id="verifyContent" style="min-height: 200px;">
                            <div style="text-align: center; padding: 60px;">
                                <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
                                <p style="color: var(--text-muted);">正在使用AI搜索关键词...</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // 调用AI搜索每个关键词
            const verifyContent = document.getElementById('verifyContent');
            verifyContent.innerHTML = '';
            
            for (const keyword of task.keywords) {
                const keywordDiv = document.createElement('div');
                keywordDiv.style.cssText = 'margin-bottom: 24px; padding: 20px; background: var(--bg-tertiary); border-radius: 12px; border: 1px solid var(--border);';
                keywordDiv.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h4 style="font-size: 16px; font-weight: 600;">🔍 搜索关键词：${keyword}</h4>
                        <span style="font-size: 14px; color: var(--text-muted);">搜索中...</span>
                    </div>
                    <div class="keyword-result" style="min-height: 100px; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
                        <div style="text-align: center;">
                            <div style="font-size: 24px; margin-bottom: 8px;">⏳</div>
                            <p>AI正在搜索...</p>
                        </div>
                    </div>
                `;
                verifyContent.appendChild(keywordDiv);
                
                try {
                    // 调用AI搜索
                    const searchPrompt = `请搜索并提供关于"${keyword}"的详细信息。要求：
1. 提供准确、详细的信息
2. 内容要包含"${keyword}"这个关键词
3. 字数在200-500字之间
4. 内容要专业、客观

请直接返回搜索结果内容，不要有其他说明。`;
                    
                    const aiResponse = await zhipuAI.chat([
                        { role: 'user', content: searchPrompt }
                    ]);
                    
                    // 统计关键词出现次数（全字匹配）
                    const regex = new RegExp(keyword, 'g');
                    const matches = aiResponse.match(regex);
                    const count = matches ? matches.length : 0;
                    
                    // 高亮显示关键词
                    const highlightedContent = aiResponse.replace(
                        regex, 
                        `<mark style="background: #fef08a; padding: 2px 4px; border-radius: 3px; font-weight: 600;">${keyword}</mark>`
                    );
                    
                    // 更新结果
                    keywordDiv.querySelector('.keyword-result').innerHTML = `
                        <div style="width: 100%;">
                            <div style="padding: 16px; background: ${count > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; border-radius: 8px; margin-bottom: 12px; border-left: 3px solid ${count > 0 ? 'var(--success)' : 'var(--danger)'};">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-weight: 600; color: ${count > 0 ? 'var(--success)' : 'var(--danger)'};">
                                        ${count > 0 ? '✅ 验收通过' : '❌ 验收失败'}
                                    </span>
                                    <span style="font-size: 20px; font-weight: 600; color: ${count > 0 ? 'var(--success)' : 'var(--danger)'};">
                                        出现 ${count} 次
                                    </span>
                                </div>
                            </div>
                            <div style="padding: 16px; background: var(--bg-card); border-radius: 8px; line-height: 1.8; color: var(--text-secondary);">
                                ${highlightedContent}
                            </div>
                        </div>
                    `;
                    
                    keywordDiv.querySelector('h4').nextElementSibling.textContent = `完成 ✓`;
                    keywordDiv.querySelector('h4').nextElementSibling.style.color = 'var(--success)';
                    
                } catch (error) {
                    console.error(`搜索关键词 ${keyword} 失败:`, error);
                    keywordDiv.querySelector('.keyword-result').innerHTML = `
                        <div style="text-align: center; padding: 20px; color: var(--danger);">
                            <div style="font-size: 24px; margin-bottom: 8px;">❌</div>
                            <p>搜索失败: ${error.message}</p>
                        </div>
                    `;
                    keywordDiv.querySelector('h4').nextElementSibling.textContent = `失败 ✗`;
                    keywordDiv.querySelector('h4').nextElementSibling.style.color = 'var(--danger)';
                }
            }
            
            // 添加关闭按钮
            const closeBtn = document.createElement('div');
            closeBtn.style.cssText = 'text-align: center; margin-top: 24px;';
            closeBtn.innerHTML = `<button class="btn btn-primary" onclick="this.closest('.modal').remove()">关闭</button>`;
            verifyContent.appendChild(closeBtn);
            
        } catch (error) {
            console.error('验收任务失败:', error);
            alert('验收任务失败: ' + error.message);
        }
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
            const employees = await EmployeeAPI.getEmployees();
            const employee = employees.find(e => e.id === employeeId);
            
            if (!employee) {
                alert('员工信息不存在');
                return;
            }
            
            // 在页面内显示任务列表
            contentArea.innerHTML = `
                <div style="margin-bottom: 24px;">
                    <button class="btn btn-secondary" onclick="renderEmployeeManage()" style="margin-bottom: 16px;">← 返回员工列表</button>
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: 600;">
                            ${employee.avatar || employee.name[0]}
                        </div>
                        <div>
                            <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 4px;">${employee.name} 的任务</h2>
                            <p style="color: var(--text-muted);">共 ${tasks.length} 个任务 | 已完成 ${tasks.filter(t => t.status === 'completed').length} 个</p>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--border);">
                                <th style="padding: 16px; text-align: left; font-weight: 600;">任务名称</th>
                                <th style="padding: 16px; text-align: left; font-weight: 600;">状态</th>
                                <th style="padding: 16px; text-align: left; font-weight: 600;">优先级</th>
                                <th style="padding: 16px; text-align: left; font-weight: 600;">截止日期</th>
                                <th style="padding: 16px; text-align: left; font-weight: 600;">进度</th>
                                <th style="padding: 16px; text-align: left; font-weight: 600;">贡献值</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tasks.length > 0 ? tasks.map(task => `
                                <tr style="border-bottom: 1px solid var(--border);">
                                    <td style="padding: 16px;">
                                        <div style="font-weight: 600;">${task.title}</div>
                                        <div style="font-size: 13px; color: var(--text-muted);">${task.description || '无描述'}</div>
                                    </td>
                                    <td style="padding: 16px;">
                                        <span class="status-badge status-${task.status}">${getStatusText(task.status)}</span>
                                    </td>
                                    <td style="padding: 16px;">
                                        <span class="priority-badge priority-${task.priority}">${getPriorityText(task.priority)}</span>
                                    </td>
                                    <td style="padding: 16px;">${task.deadline || '无'}</td>
                                    <td style="padding: 16px;">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <div style="flex: 1; height: 6px; background: var(--bg-tertiary); border-radius: 3px; overflow: hidden;">
                                                <div style="width: ${task.progress || 0}%; height: 100%; background: var(--primary); transition: width 0.3s;"></div>
                                            </div>
                                            <span style="font-size: 12px; color: var(--text-muted); min-width: 35px;">${task.progress || 0}%</span>
                                        </div>
                                    </td>
                                    <td style="padding: 16px;">
                                        <span style="color: var(--primary); font-weight: 600;">💎 ${task.contribution || 0}</span>
                                    </td>
                                </tr>
                            `).join('') : `
                                <tr>
                                    <td colspan="6" style="padding: 60px; text-align: center; color: var(--text-muted);">
                                        <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
                                        <p>该员工暂无任务</p>
                                    </td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 24px;">
                    <div class="card" style="padding: 20px; text-align: center;">
                        <div style="font-size: 32px; font-weight: 600; color: var(--primary); margin-bottom: 8px;">${tasks.length}</div>
                        <div style="color: var(--text-muted);">总任务数</div>
                    </div>
                    <div class="card" style="padding: 20px; text-align: center;">
                        <div style="font-size: 32px; font-weight: 600; color: var(--success); margin-bottom: 8px;">${tasks.filter(t => t.status === 'completed').length}</div>
                        <div style="color: var(--text-muted);">已完成</div>
                    </div>
                    <div class="card" style="padding: 20px; text-align: center;">
                        <div style="font-size: 32px; font-weight: 600; color: var(--warning); margin-bottom: 8px;">${tasks.filter(t => t.status === 'in_progress' || t.status === 'pending').length}</div>
                        <div style="color: var(--text-muted);">进行中</div>
                    </div>
                    <div class="card" style="padding: 20px; text-align: center;">
                        <div style="font-size: 32px; font-weight: 600; color: var(--secondary); margin-bottom: 8px;">${tasks.reduce((sum, t) => sum + (t.contribution || 0), 0)}</div>
                        <div style="color: var(--text-muted);">总贡献值</div>
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('获取员工任务失败:', error);
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
