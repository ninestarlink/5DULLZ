// 管理员后台主逻辑
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentArea = document.getElementById('contentArea');
    const pageTitle = document.getElementById('pageTitle');
    const aiTaskBtn = document.getElementById('aiTaskBtn');
    const aiTaskModal = document.getElementById('aiTaskModal');
    
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
    function loadPage(page) {
        switch(page) {
            case 'dashboard':
                pageTitle.textContent = '数据看板';
                renderDashboard();
                break;
            case 'ai-task':
                pageTitle.textContent = 'AI任务生成';
                renderAITaskPage();
                break;
            case 'task-manage':
                pageTitle.textContent = '任务管理';
                renderTaskManage();
                break;
            case 'employee':
                pageTitle.textContent = '员工管理';
                renderEmployeeManage();
                break;
            case 'settings':
                pageTitle.textContent = '系统设置';
                renderSettings();
                break;
        }
    }
    
    // 渲染数据看板
    function renderDashboard() {
        const stats = mockData.stats;
        contentArea.innerHTML = `
            <!-- 统计卡片 -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--success);">📈</div>
                        <div class="stat-trend up">↑ ${stats.taskCompletion.trend}%</div>
                    </div>
                    <div class="stat-value">${stats.taskCompletion.value}%</div>
                    <div class="stat-label">${stats.taskCompletion.label}</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon" style="background: rgba(6, 182, 212, 0.1); color: var(--info);">⏱️</div>
                        <div class="stat-trend down">↓ ${Math.abs(stats.avgProcessTime.trend)}天</div>
                    </div>
                    <div class="stat-value">${stats.avgProcessTime.value}天</div>
                    <div class="stat-label">${stats.avgProcessTime.label}</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: var(--warning);">👥</div>
                        <div class="stat-trend up">↑ ${stats.employeeLoad.trend}%</div>
                    </div>
                    <div class="stat-value">${stats.employeeLoad.value}%</div>
                    <div class="stat-label">${stats.employeeLoad.label}</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon" style="background: rgba(139, 92, 246, 0.1); color: var(--secondary);">💎</div>
                        <div class="stat-trend up">↑ ${stats.keywordHealth.trend}分</div>
                    </div>
                    <div class="stat-value">${stats.keywordHealth.value}分</div>
                    <div class="stat-label">${stats.keywordHealth.label}</div>
                </div>
            </div>
            
            <!-- 图表区 -->
            <div class="chart-container">
                <div class="card-header">
                    <h3 class="card-title">📊 任务完成趋势</h3>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-secondary">近30天</button>
                        <button class="btn btn-secondary">按周</button>
                        <button class="btn btn-secondary">按月</button>
                    </div>
                </div>
                <div class="chart-placeholder">
                    <div style="text-align: center;">
                        <p>📈 任务完成趋势图</p>
                        <p style="font-size: 12px; margin-top: 8px;">近30天完成率持续上升</p>
                    </div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="chart-container">
                    <div class="card-header">
                        <h3 class="card-title">🏆 员工完成率排行榜</h3>
                    </div>
                    <div style="padding: 20px;">
                        ${mockData.chartData.employeeRanking.map((emp, idx) => `
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                                <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 14px;">
                                    ${idx + 1}
                                </div>
                                <div style="flex: 1;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                        <span style="font-weight: 600; color: var(--text-primary);">${emp.name}</span>
                                        <span style="color: var(--text-muted);">${emp.tasks}任务 · ${emp.rate}%</span>
                                    </div>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${emp.rate}%"></div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="chart-container">
                    <div class="card-header">
                        <h3 class="card-title">❌ 任务失败原因分布</h3>
                    </div>
                    <div style="padding: 40px; text-align: center;">
                        ${mockData.chartData.failureReasons.map(reason => `
                            <div style="margin-bottom: 24px;">
                                <div style="font-size: 18px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
                                    ${reason.count}%
                                </div>
                                <div style="color: var(--text-muted);">${reason.reason}</div>
                                <div class="progress-bar" style="margin-top: 8px;">
                                    <div class="progress-fill" style="width: ${reason.count}%; background: ${reason.count > 50 ? 'var(--danger)' : 'var(--warning)'}"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    // 渲染AI任务生成页面
    function renderAITaskPage() {
        contentArea.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 400px; gap: 24px; height: calc(100vh - 140px);">
                <!-- 左侧：聊天区域 -->
                <div class="card" style="display: flex; flex-direction: column; height: 100%;">
                    <div style="padding: 20px; border-bottom: 1px solid var(--border);">
                        <h3 style="font-size: 18px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">💬 AI智能任务助手</h3>
                        <p style="color: var(--text-muted); font-size: 13px;">描述你的任务需求，AI会智能拆解并推荐合适的员工</p>
                    </div>
                    
                    <div class="chat-messages" id="chatMessages" style="flex: 1; overflow-y: auto; padding: 24px; background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);">
                        <div class="chat-message ai">
                            <div class="message-avatar">🤖</div>
                            <div class="message-content">
                                <p style="font-weight: 600; margin-bottom: 12px;">👋 你好！我是AI任务助手</p>
                                <p style="margin-bottom: 12px;">我可以帮你：</p>
                                <ul style="margin-left: 20px; margin-bottom: 12px; line-height: 1.8;">
                                    <li>📋 将大任务拆解为可执行的子任务</li>
                                    <li>👥 根据技能匹配合适的员工</li>
                                    <li>⏰ 规划合理的时间节点</li>
                                    <li>💎 估算任务贡献度</li>
                                </ul>
                                <div style="background: linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%); padding: 16px; border-radius: 12px; margin-top: 16px;">
                                    <p style="font-weight: 600; margin-bottom: 8px;">💡 试试这样描述：</p>
                                    <p style="font-size: 13px; color: var(--text-secondary); font-style: italic;">
                                        "Q3提升'无人驾驶'词条覆盖，目标知乎10篇+论坛20篇，核心词条：ULL/远大/5ms，6月底前完成"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="padding: 20px; border-top: 1px solid var(--border); background: white;">
                        <div style="display: flex; gap: 12px; align-items: flex-end;">
                            <textarea id="chatInput" 
                                      placeholder="描述你的任务需求..." 
                                      style="flex: 1; padding: 14px; border: 2px solid var(--border); border-radius: 12px; background: var(--bg-tertiary); color: var(--text-primary); font-family: inherit; font-size: 14px; resize: none; min-height: 80px; transition: all 0.3s;"
                                      onkeydown="if(event.key==='Enter' && event.ctrlKey) sendMessage()"></textarea>
                            <button class="btn btn-primary" onclick="sendMessage()" style="height: 80px; padding: 0 32px; font-size: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;">
                                <span style="font-size: 24px;">📤</span>
                                <span>发送</span>
                            </button>
                        </div>
                        <div style="margin-top: 8px; font-size: 12px; color: var(--text-muted); text-align: right;">
                            💡 提示：按 Ctrl + Enter 快速发送
                        </div>
                    </div>
                </div>
                
                <!-- 右侧：使用指南 -->
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <div class="card">
                        <h4 style="font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 16px;">📝 任务描述建议</h4>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <div style="padding: 12px; background: var(--bg-tertiary); border-radius: 8px; border-left: 3px solid var(--primary);">
                                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">🎯 任务目标</div>
                                <div style="font-size: 13px; color: var(--text-muted);">明确要达成的目标和KPI</div>
                            </div>
                            <div style="padding: 12px; background: var(--bg-tertiary); border-radius: 8px; border-left: 3px solid var(--secondary);">
                                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">🏷️ 核心词条</div>
                                <div style="font-size: 13px; color: var(--text-muted);">需要覆盖的关键词</div>
                            </div>
                            <div style="padding: 12px; background: var(--bg-tertiary); border-radius: 8px; border-left: 3px solid var(--success);">
                                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">⏰ 时间要求</div>
                                <div style="font-size: 13px; color: var(--text-muted);">期望的完成时间</div>
                            </div>
                            <div style="padding: 12px; background: var(--bg-tertiary); border-radius: 8px; border-left: 3px solid var(--warning);">
                                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">📱 目标平台</div>
                                <div style="font-size: 13px; color: var(--text-muted);">知乎、论坛、公众号等</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <h4 style="font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 16px;">👥 可用员工</h4>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            ${mockData.employees.map(emp => `
                                <div style="display: flex; align-items: center; gap: 12px; padding: 10px; background: var(--bg-tertiary); border-radius: 8px;">
                                    <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; flex-shrink: 0;">
                                        ${emp.avatar}
                                    </div>
                                    <div style="flex: 1; min-width: 0;">
                                        <div style="font-weight: 600; color: var(--text-primary); font-size: 14px;">${emp.name}</div>
                                        <div style="font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                            ${emp.skills.slice(0, 2).join(' · ')}
                                        </div>
                                    </div>
                                    <div style="font-size: 12px; color: ${emp.currentLoad > 80 ? 'var(--danger)' : 'var(--success)'}; font-weight: 600;">
                                        ${emp.currentLoad}%
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="card" style="background: linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%); border: none;">
                        <div style="text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 8px;">✨</div>
                            <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">AI驱动的智能分配</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">基于员工技能和负荷自动匹配</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 渲染任务管理
    function renderTaskManage() {
        contentArea.innerHTML = `
            <!-- 筛选栏 -->
            <div class="filter-bar">
                <div class="filter-row">
                    <div class="filter-group">
                        <span class="filter-label">状态：</span>
                        <select class="filter-select">
                            <option>全部</option>
                            <option>待指派</option>
                            <option>进行中</option>
                            <option>待验收</option>
                            <option>已完成</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <span class="filter-label">时间：</span>
                        <select class="filter-select">
                            <option>全部</option>
                            <option>今天</option>
                            <option>本周</option>
                            <option>本月</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <span class="filter-label">优先级：</span>
                        <select class="filter-select">
                            <option>全部</option>
                            <option>高</option>
                            <option>中</option>
                            <option>低</option>
                        </select>
                    </div>
                    <input type="text" class="search-input" placeholder="🔍 搜索任务...">
                    <button class="btn btn-primary" onclick="openAIModal()">💬 AI生成任务</button>
                </div>
            </div>
            
            <!-- 视图切换 -->
            <div style="display: flex; gap: 12px; margin-bottom: 20px;">
                <button class="btn btn-primary" onclick="showKanbanView()">📊 看板视图</button>
                <button class="btn btn-secondary" onclick="showTreeView()">🌲 层级视图</button>
            </div>
            
            <!-- 看板视图 -->
            <div id="kanbanView">
                ${renderKanbanView()}
            </div>
        `;
    }
    
    // 渲染看板视图
    window.renderKanbanView = function() {
        const tasks = mockData.tasks;
        const allTasks = [];
        tasks.forEach(task => {
            allTasks.push(...task.children);
        });
        
        const pending = allTasks.filter(t => t.status === 'pending');
        const inProgress = allTasks.filter(t => t.status === 'in_progress');
        const review = allTasks.filter(t => t.status === 'review');
        const completed = allTasks.filter(t => t.status === 'completed');
        
        return `
            <div class="kanban-board">
                <div class="kanban-column">
                    <div class="kanban-header">
                        <div class="kanban-title">📌 待指派</div>
                        <div class="kanban-count">${pending.length}</div>
                    </div>
                    <div class="kanban-cards">
                        ${pending.map(task => renderKanbanCard(task)).join('')}
                    </div>
                </div>
                
                <div class="kanban-column">
                    <div class="kanban-header">
                        <div class="kanban-title">▶️ 进行中</div>
                        <div class="kanban-count">${inProgress.length}</div>
                    </div>
                    <div class="kanban-cards">
                        ${inProgress.map(task => renderKanbanCard(task)).join('')}
                    </div>
                </div>
                
                <div class="kanban-column">
                    <div class="kanban-header">
                        <div class="kanban-title">✅ 待验收</div>
                        <div class="kanban-count">${review.length}</div>
                    </div>
                    <div class="kanban-cards">
                        ${review.map(task => renderKanbanCard(task)).join('')}
                    </div>
                </div>
                
                <div class="kanban-column">
                    <div class="kanban-header">
                        <div class="kanban-title">✔️ 已完成</div>
                        <div class="kanban-count">${completed.length}</div>
                    </div>
                    <div class="kanban-cards">
                        ${completed.map(task => renderKanbanCard(task)).join('')}
                    </div>
                </div>
            </div>
        `;
    };
    
    function renderKanbanCard(task) {
        const statusColors = {
            pending: 'warning',
            in_progress: 'info',
            review: 'primary',
            completed: 'success'
        };
        
        return `
            <div class="kanban-card">
                <div class="kanban-card-title">${task.title}</div>
                <div class="kanban-card-meta">
                    <span class="badge badge-${statusColors[task.status]}">${task.skill}</span>
                    <span>⏰ ${task.deadline}</span>
                </div>
                <div class="kanban-card-footer">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 600;">
                            ${task.assignee ? task.assignee[0] : '?'}
                        </div>
                        <span style="font-size: 13px; color: var(--text-secondary);">${task.assignee || '未分配'}</span>
                    </div>
                    <button class="action-btn">编辑</button>
                </div>
            </div>
        `;
    }
    
    // 渲染员工管理
    function renderEmployeeManage() {
        contentArea.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <div>
                    <h2 style="font-size: 20px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">员工列表</h2>
                    <p style="color: var(--text-muted); font-size: 14px;">管理员工信息和技能标签</p>
                </div>
                <button class="btn btn-primary">➕ 添加员工</button>
            </div>
            
            <div class="employee-grid">
                ${mockData.employees.map(emp => `
                    <div class="employee-card">
                        <div class="employee-header">
                            <div class="employee-avatar">${emp.avatar}</div>
                            <div class="employee-info">
                                <div class="employee-name">${emp.name}</div>
                                <div class="employee-role">${emp.role}</div>
                            </div>
                        </div>
                        
                        <div class="employee-skills">
                            ${emp.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                        </div>
                        
                        <div class="employee-stats">
                            <div class="employee-stat">
                                <div class="employee-stat-value">${emp.tasksCompleted}</div>
                                <div class="employee-stat-label">完成任务</div>
                            </div>
                            <div class="employee-stat">
                                <div class="employee-stat-value">${emp.completionRate}%</div>
                                <div class="employee-stat-label">完成率</div>
                            </div>
                            <div class="employee-stat">
                                <div class="employee-stat-value">${emp.contribution}</div>
                                <div class="employee-stat-label">贡献度</div>
                            </div>
                            <div class="employee-stat">
                                <div class="employee-stat-value">${emp.currentLoad}%</div>
                                <div class="employee-stat-label">当前负荷</div>
                            </div>
                        </div>
                        
                        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); display: flex; gap: 8px;">
                            <button class="btn btn-secondary" style="flex: 1;">编辑</button>
                            <button class="btn btn-secondary" style="flex: 1;">查看任务</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // 渲染设置页面
    function renderSettings() {
        contentArea.innerHTML = `
            <div class="card" style="margin-bottom: 20px;">
                <div class="card-header">
                    <h3 class="card-title">🤖 AI配置</h3>
                </div>
                <div style="padding: 20px 0;">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary);">智谱AI API Key</label>
                        <input type="text" id="apiKeyInput" placeholder="请输入你的智谱AI API Key" 
                               value="${localStorage.getItem('zhipu_api_key') || ZHIPU_API_KEY}"
                               style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; background: white; color: var(--text-primary);">
                        <div style="margin-top: 8px; font-size: 13px; color: var(--text-muted);">
                            获取API Key：访问 <a href="https://open.bigmodel.cn/" target="_blank" style="color: var(--primary);">智谱AI开放平台</a> 注册并获取免费API Key
                        </div>
                        <div style="margin-top: 8px; padding: 8px 12px; background: rgba(16, 185, 129, 0.1); border-radius: 6px; font-size: 13px; color: var(--success);">
                            ✅ 已配置默认API Key，可直接使用AI功能
                        </div>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary);">AI模型</label>
                        <select id="modelSelect" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; background: white; color: var(--text-primary); cursor: pointer;">
                            <option value="glm-4-flash">GLM-4-Flash (推荐，免费)</option>
                            <option value="glm-4">GLM-4</option>
                            <option value="glm-3-turbo">GLM-3-Turbo</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" onclick="saveAISettings()">💾 保存配置</button>
                    <button class="btn btn-secondary" onclick="testAIConnection()" style="margin-left: 12px;">🔍 测试连接</button>
                </div>
            </div>
            
            <div class="card" style="margin-bottom: 20px;">
                <div class="card-header">
                    <h3 class="card-title">📊 任务配置</h3>
                </div>
                <div style="padding: 20px 0;">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary);">默认任务优先级</label>
                        <select style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; background: white; color: var(--text-primary); cursor: pointer;">
                            <option value="high">高</option>
                            <option value="medium" selected>中</option>
                            <option value="low">低</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary);">任务自动分配</label>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" checked style="width: 18px; height: 18px;">
                            <span style="color: var(--text-secondary);">启用AI智能分配任务给员工</span>
                        </label>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary);">任务逾期提醒（提前天数）</label>
                        <input type="number" value="1" min="0" max="7" 
                               style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; background: white; color: var(--text-primary);">
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🎨 界面设置</h3>
                </div>
                <div style="padding: 20px 0;">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary);">主题模式</label>
                        <select style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; background: white; color: var(--text-primary); cursor: pointer;">
                            <option value="light" selected>浅色模式</option>
                            <option value="dark">深色模式</option>
                            <option value="auto">跟随系统</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary);">语言</label>
                        <select style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; background: white; color: var(--text-primary); cursor: pointer;">
                            <option value="zh-CN" selected>简体中文</option>
                            <option value="en-US">English</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }
    
    // AI任务生成按钮 - 点击跳转到AI任务页面
    aiTaskBtn.addEventListener('click', function() {
        // 切换到AI任务生成页面
        navItems.forEach(i => i.classList.remove('active'));
        document.querySelector('[data-page="ai-task"]').classList.add('active');
        pageTitle.textContent = 'AI任务生成';
        renderAITaskPage();
    });
    
    // 发送消息
    window.sendMessage = async function() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        if (!message) return;
        
        const chatMessages = document.getElementById('chatMessages');
        
        // 添加用户消息
        chatMessages.innerHTML += `
            <div class="chat-message user">
                <div class="message-avatar">👤</div>
                <div class="message-content">
                    <p>${message}</p>
                </div>
            </div>
        `;
        
        input.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 添加加载提示
        chatMessages.innerHTML += `
            <div class="chat-message ai" id="loadingMessage">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <p>正在分析任务需求，请稍候...</p>
                </div>
            </div>
        `;
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 尝试调用智谱AI
        const apiKey = localStorage.getItem('zhipu_api_key') || ZHIPU_API_KEY;
        let aiResponse;
        
        if (apiKey && apiKey !== 'your_api_key_here') {
            try {
                aiResponse = await callZhipuAI(message, apiKey);
            } catch (error) {
                console.error('AI调用失败:', error);
                aiResponse = aiResponses.taskAnalysis; // 使用fallback
            }
        } else {
            // 使用预设回复
            await new Promise(resolve => setTimeout(resolve, 1500));
            aiResponse = aiResponses.taskAnalysis;
        }
        
        // 移除加载提示
        document.getElementById('loadingMessage').remove();
        
        // 显示AI回复
        chatMessages.innerHTML += `
            <div class="chat-message ai">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <p>${aiResponse.message}</p>
                    <div class="task-preview">
                        <div class="task-preview-header">
                            <div class="task-preview-title">📌 ${aiResponse.tasks.parent.title}</div>
                            <span class="badge badge-warning">高优先级</span>
                        </div>
                        <div style="color: var(--text-muted); font-size: 13px; margin-bottom: 12px;">
                            截止时间：${aiResponse.tasks.parent.deadline} | 核心词条：${aiResponse.tasks.parent.keywords.join(' / ')}
                        </div>
                        <div class="task-tree">
                            ${aiResponse.tasks.children.map((task, idx) => `
                                <div class="task-node subtask">
                                    <div class="task-node-header">
                                        <div class="task-node-title">├─ ${task.title}</div>
                                    </div>
                                    <div class="task-node-meta">
                                        <span>技能：${task.skill}</span>
                                        <span>建议：${task.suggested.join('/')}</span>
                                        <span>贡献度：${task.contribution}</span>
                                        <span>⏰ ${task.deadline}</span>
                                    </div>
                                    <div style="font-size: 13px; color: var(--text-muted); margin-top: 8px;">
                                        ${task.description}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div style="display: flex; gap: 12px; margin-top: 20px;">
                            <button class="btn btn-primary" onclick="confirmTasks()">✅ 确认创建</button>
                            <button class="btn btn-secondary" onclick="editTasks()">✏️ 修改方案</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };
    
    // 调用智谱AI API
    async function callZhipuAI(userMessage, apiKey) {
        const systemPrompt = `你是一个任务管理助手。用户会描述一个大任务，你需要：
1. 分析任务目标和KPI
2. 将大任务拆解为3-5个子任务
3. 为每个子任务匹配合适的技能要求
4. 推荐合适的员工（从：林诗雨、陈星辰、苏晓月、江逸凡中选择）
5. 估算每个子任务的贡献度和截止时间

员工技能：
- 林诗雨：技术写作、金融分析、数据分析
- 陈星辰：社区运营、视频脚本、用户增长
- 苏晓月：内容编辑、案例研究、SEO优化
- 江逸凡：新媒体运营、图文设计、活动策划

请以JSON格式返回，格式如下：
{
  "message": "分析说明",
  "tasks": {
    "parent": {
      "title": "父任务标题",
      "deadline": "YYYY-MM-DD",
      "priority": "high/medium/low",
      "keywords": ["关键词1", "关键词2"]
    },
    "children": [
      {
        "title": "子任务标题",
        "skill": "所需技能",
        "suggested": ["推荐员工1", "推荐员工2"],
        "contribution": 30,
        "deadline": "YYYY-MM-DD",
        "description": "任务描述"
      }
    ]
  }
}`;

        const response = await fetch(ZHIPU_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: localStorage.getItem('ai_model') || 'glm-4-flash',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error('API调用失败');
        }
        
        const data = await response.json();
        const aiText = data.choices[0].message.content;
        
        // 尝试解析JSON
        try {
            const jsonMatch = aiText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.error('JSON解析失败:', e);
        }
        
        // 如果解析失败，返回默认响应
        return aiResponses.taskAnalysis;
    }
    
    // 确认创建任务
    window.confirmTasks = function() {
        alert('✅ 任务已创建！员工将收到站内通知。');
        closeAIModal();
    };
    
    // 编辑任务
    window.editTasks = function() {
        alert('✏️ 进入任务编辑模式...');
    };
    
    // 保存AI设置
    window.saveAISettings = function() {
        const apiKey = document.getElementById('apiKeyInput').value.trim();
        const model = document.getElementById('modelSelect').value;
        
        if (apiKey) {
            localStorage.setItem('zhipu_api_key', apiKey);
            localStorage.setItem('ai_model', model);
            alert('✅ AI配置已保存！');
        } else {
            alert('⚠️ 请输入API Key');
        }
    };
    
    // 测试AI连接
    window.testAIConnection = async function() {
        const apiKey = document.getElementById('apiKeyInput').value.trim();
        
        if (!apiKey) {
            alert('⚠️ 请先输入API Key');
            return;
        }
        
        const btn = event.target;
        btn.disabled = true;
        btn.textContent = '🔄 测试中...';
        
        try {
            const response = await fetch(ZHIPU_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'glm-4-flash',
                    messages: [
                        { role: 'user', content: '你好' }
                    ]
                })
            });
            
            if (response.ok) {
                alert('✅ API连接成功！');
            } else {
                const error = await response.json();
                alert('❌ API连接失败：' + (error.error?.message || '请检查API Key是否正确'));
            }
        } catch (error) {
            alert('❌ 网络错误：' + error.message);
        } finally {
            btn.disabled = false;
            btn.textContent = '🔍 测试连接';
        }
    };
    
    // 初始化模型选择
    setTimeout(() => {
        const modelSelect = document.getElementById('modelSelect');
        if (modelSelect) {
            const savedModel = localStorage.getItem('ai_model') || 'glm-4-flash';
            modelSelect.value = savedModel;
        }
    }, 100);
    
    // 初始加载数据看板
    renderDashboard();
});
