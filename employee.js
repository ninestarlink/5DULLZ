// 员工工作台主逻辑
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentArea = document.getElementById('contentArea');
    const pageTitle = document.getElementById('pageTitle');
    const userMenu = document.getElementById('userMenu');
    const userDropdown = document.getElementById('userDropdown');
    const taskDetailModal = document.getElementById('taskDetailModal');
    
    // 获取当前用户
    let currentUser = localStorage.getItem('currentUser') || 'linshiyu';
    let userData = employeeData[currentUser];
    
    // 更新用户信息显示
    function updateUserDisplay() {
        document.getElementById('userAvatar').textContent = userData.avatar;
        document.getElementById('userName').textContent = userData.name;
    }
    
    updateUserDisplay();
    
    // 用户菜单切换
    userMenu.addEventListener('click', function(e) {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
    });
    
    // 点击其他地方关闭下拉菜单
    document.addEventListener('click', function() {
        userDropdown.classList.remove('active');
    });
    
    // 用户切换
    document.querySelectorAll('.dropdown-item[data-user]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            currentUser = this.dataset.user;
            userData = employeeData[currentUser];
            localStorage.setItem('currentUser', currentUser);
            updateUserDisplay();
            userDropdown.classList.remove('active');
            // 重新加载当前页面
            const activePage = document.querySelector('.nav-item.active').dataset.page;
            loadPage(activePage);
        });
    });
    
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
            case 'my-tasks':
                pageTitle.textContent = '我的任务';
                renderMyTasks();
                break;
            case 'profile':
                pageTitle.textContent = '个人资料';
                renderProfile();
                break;
            case 'notifications':
                pageTitle.textContent = '通知中心';
                renderNotifications();
                break;
        }
    }
    
    // 渲染我的任务
    function renderMyTasks() {
        const tasks = userData.tasks;
        const pending = tasks.filter(t => t.status === 'pending');
        const inProgress = tasks.filter(t => t.status === 'in_progress');
        const review = tasks.filter(t => t.status === 'review');
        const completed = tasks.filter(t => t.status === 'completed');
        
        contentArea.innerHTML = `
            <!-- 筛选栏 -->
            <div class="filter-bar">
                <div class="filter-row">
                    <div class="filter-group">
                        <span class="filter-label">状态：</span>
                        <select class="filter-select">
                            <option>全部</option>
                            <option>待处理</option>
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
                            <option>逾期</option>
                        </select>
                    </div>
                    <input type="text" class="search-input" placeholder="🔍 搜索任务...">
                </div>
            </div>
            
            <!-- 视图切换 -->
            <div style="display: flex; gap: 12px; margin-bottom: 20px;">
                <button class="btn btn-primary" onclick="showKanbanView()">📊 看板视图</button>
                <button class="btn btn-secondary" onclick="showListView()">📋 列表视图</button>
            </div>
            
            <!-- 看板视图 -->
            <div id="kanbanView">
                <div class="kanban-board">
                    <div class="kanban-column">
                        <div class="kanban-header">
                            <div class="kanban-title">📌 待处理</div>
                            <div class="kanban-count">${pending.length}</div>
                        </div>
                        <div class="kanban-cards">
                            ${pending.map(task => renderTaskCard(task)).join('')}
                        </div>
                    </div>
                    
                    <div class="kanban-column">
                        <div class="kanban-header">
                            <div class="kanban-title">▶️ 进行中</div>
                            <div class="kanban-count">${inProgress.length}</div>
                        </div>
                        <div class="kanban-cards">
                            ${inProgress.map(task => renderTaskCard(task)).join('')}
                        </div>
                    </div>
                    
                    <div class="kanban-column">
                        <div class="kanban-header">
                            <div class="kanban-title">✅ 待验收</div>
                            <div class="kanban-count">${review.length}</div>
                        </div>
                        <div class="kanban-cards">
                            ${review.map(task => renderTaskCard(task)).join('')}
                        </div>
                    </div>
                    
                    <div class="kanban-column">
                        <div class="kanban-header">
                            <div class="kanban-title">✔️ 已完成</div>
                            <div class="kanban-count">${completed.length}</div>
                        </div>
                        <div class="kanban-cards">
                            ${completed.map(task => renderTaskCard(task)).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 渲染任务卡片
    function renderTaskCard(task) {
        const statusMap = {
            pending: { badge: 'warning', text: '待处理' },
            in_progress: { badge: 'info', text: '进行中' },
            review: { badge: 'primary', text: '待验收' },
            completed: { badge: 'success', text: '已完成' }
        };
        
        const priorityMap = {
            high: { badge: 'danger', text: '高' },
            medium: { badge: 'warning', text: '中' },
            low: { badge: 'info', text: '低' }
        };
        
        return `
            <div class="task-card ${task.priority}" onclick="openTaskDetail(${task.id})">
                <div class="task-card-header">
                    <div>
                        <div class="task-card-title">${task.title}</div>
                        ${task.parent ? `<div class="task-card-parent">📌 ${task.parent}</div>` : ''}
                    </div>
                    <span class="badge badge-${statusMap[task.status].badge}">${statusMap[task.status].text}</span>
                </div>
                <div class="task-card-meta">
                    <span>🏷️ ${task.keywords.join(' · ')}</span>
                    <span>⏰ ${task.deadline}</span>
                    <span>💎 ${task.contribution}</span>
                </div>
            </div>
        `;
    }
    
    // 打开任务详情
    window.openTaskDetail = function(taskId) {
        const task = userData.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const taskDetailContent = document.getElementById('taskDetailContent');
        taskDetailContent.innerHTML = `
            <div class="task-detail-section">
                <div class="task-detail-title">📋 任务信息</div>
                <div class="task-detail-content">
                    <div class="task-detail-row">
                        <span class="task-detail-label">任务标题</span>
                        <span class="task-detail-value">${task.title}</span>
                    </div>
                    ${task.parent ? `
                    <div class="task-detail-row">
                        <span class="task-detail-label">父任务</span>
                        <span class="task-detail-value">${task.parent}</span>
                    </div>
                    ` : ''}
                    <div class="task-detail-row">
                        <span class="task-detail-label">词条清单</span>
                        <div class="keyword-list">
                            ${task.keywords.map(kw => `<span class="keyword-tag">${kw}</span>`).join('')}
                        </div>
                    </div>
                    <div class="task-detail-row">
                        <span class="task-detail-label">基础贡献度</span>
                        <span class="task-detail-value">${task.contribution}</span>
                    </div>
                    <div class="task-detail-row">
                        <span class="task-detail-label">截止时间</span>
                        <span class="task-detail-value">${task.deadline}</span>
                    </div>
                    <div class="task-detail-row">
                        <span class="task-detail-label">任务描述</span>
                        <span class="task-detail-value">${task.description}</span>
                    </div>
                </div>
            </div>
            
            <div class="task-detail-section">
                <div class="task-detail-title">📝 执行步骤</div>
                <div class="task-detail-content">
                    <ol class="step-list">
                        <li class="step-item">线下创作内容（Word/文本编辑器）</li>
                        <li class="step-item">在目标平台发布内容</li>
                        <li class="step-item">保存发布内容为文件（Word/PDF/TXT）</li>
                        <li class="step-item">上传文件并提交任务</li>
                    </ol>
                </div>
            </div>
            
            ${task.status !== 'completed' ? `
            <div class="task-detail-section">
                <div class="task-detail-title">📎 提交任务</div>
                <div class="task-detail-content">
                    <div class="file-upload-area" id="fileUploadArea">
                        <div class="file-upload-icon">📄</div>
                        <div class="file-upload-text">点击或拖拽文件到此处上传</div>
                        <div class="file-upload-hint">支持格式：.doc .docx .pdf .txt | 大小限制：≤10MB</div>
                        <input type="file" id="fileInput" style="display: none;" accept=".doc,.docx,.pdf,.txt">
                    </div>
                    <div id="uploadedFiles"></div>
                    <button class="btn btn-primary" style="width: 100%; margin-top: 16px;" onclick="submitTask(${task.id})">提交任务</button>
                </div>
            </div>
            ` : `
            <div class="ai-score-card">
                <div class="score-header">
                    <div class="score-icon">✅</div>
                    <div class="score-title">任务已完成</div>
                    <div class="score-subtitle">该任务已通过AI评分验收</div>
                </div>
                <div class="contribution-display">
                    <div class="contribution-label">获得贡献度</div>
                    <div class="contribution-value">+${task.contribution}</div>
                </div>
            </div>
            `}
        `;
        
        // 文件上传交互
        if (task.status !== 'completed') {
            const fileUploadArea = document.getElementById('fileUploadArea');
            const fileInput = document.getElementById('fileInput');
            const uploadedFiles = document.getElementById('uploadedFiles');
            
            fileUploadArea.addEventListener('click', () => fileInput.click());
            
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    displayUploadedFile(file);
                }
            });
            
            // 拖拽上传
            fileUploadArea.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.classList.add('dragover');
            });
            
            fileUploadArea.addEventListener('dragleave', function() {
                this.classList.remove('dragover');
            });
            
            fileUploadArea.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('dragover');
                const file = e.dataTransfer.files[0];
                if (file) {
                    displayUploadedFile(file);
                }
            });
            
            function displayUploadedFile(file) {
                const fileSize = (file.size / 1024).toFixed(2) + ' KB';
                uploadedFiles.innerHTML = `
                    <div class="uploaded-file">
                        <div class="file-icon">📄</div>
                        <div class="file-info">
                            <div class="file-name">${file.name}</div>
                            <div class="file-size">${fileSize}</div>
                        </div>
                        <button class="file-remove" onclick="this.parentElement.remove()">×</button>
                    </div>
                `;
            }
        }
        
        taskDetailModal.classList.add('active');
    };
    
    // 关闭任务详情
    window.closeTaskDetail = function() {
        taskDetailModal.classList.remove('active');
    };
    
    // 提交任务
    window.submitTask = function(taskId) {
        const uploadedFiles = document.getElementById('uploadedFiles');
        if (!uploadedFiles.innerHTML.trim()) {
            alert('请先上传文件！');
            return;
        }
        
        // 模拟AI评分
        setTimeout(() => {
            const result = Math.random() > 0.3 ? aiScoreResults.success : aiScoreResults.failed;
            showAIScore(result);
        }, 1500);
    };
    
    // 显示AI评分结果
    function showAIScore(result) {
        const taskDetailContent = document.getElementById('taskDetailContent');
        taskDetailContent.innerHTML = `
            <div class="ai-score-card">
                <div class="score-header">
                    <div class="score-icon">${result.icon}</div>
                    <div class="score-title">${result.title}</div>
                    <div class="score-subtitle">${result.subtitle}</div>
                </div>
                
                <div class="score-details">
                    <div class="score-item ${result.scores.coverage.status}">
                        <div class="score-item-label">${result.scores.coverage.label}</div>
                        <div class="score-item-value">${result.scores.coverage.value}</div>
                    </div>
                    <div class="score-item ${result.scores.quality.status}">
                        <div class="score-item-label">${result.scores.quality.label}</div>
                        <div class="score-item-value">${result.scores.quality.value}</div>
                    </div>
                </div>
                
                ${result.status === 'success' ? `
                    <div class="contribution-display">
                        <div class="contribution-label">获得贡献度</div>
                        <div class="contribution-value">+${result.contribution}</div>
                        <div style="font-size: 13px; margin-top: 8px; opacity: 0.9;">${result.formula}</div>
                    </div>
                ` : `
                    <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; border-left: 4px solid var(--danger);">
                        <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 12px;">失败原因：</div>
                        ${result.issues.map(issue => `<div style="color: var(--text-secondary); margin-bottom: 8px;">${issue}</div>`).join('')}
                    </div>
                `}
                
                <button class="btn ${result.status === 'success' ? 'btn-success' : 'btn-primary'}" 
                        style="width: 100%; margin-top: 20px;" 
                        onclick="closeTaskDetail()">
                    ${result.status === 'success' ? '✅ 确认' : '🔄 重新提交'}
                </button>
            </div>
        `;
    }
    
    // 渲染个人资料
    function renderProfile() {
        contentArea.innerHTML = `
            <div class="profile-card">
                <div class="profile-header">
                    <div class="profile-avatar">${userData.avatar}</div>
                    <div class="profile-info">
                        <div class="profile-name">${userData.name}</div>
                        <div class="profile-skills">
                            ${userData.skills.map(skill => `<span class="profile-skill-tag">${skill}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="profile-stats">
                    <div class="profile-stat">
                        <div class="profile-stat-value">${userData.contribution}</div>
                        <div class="profile-stat-label">累计贡献度</div>
                    </div>
                    <div class="profile-stat">
                        <div class="profile-stat-value">${userData.tasksCompleted}</div>
                        <div class="profile-stat-label">完成任务</div>
                    </div>
                    <div class="profile-stat">
                        <div class="profile-stat-value">${userData.completionRate}%</div>
                        <div class="profile-stat-label">完成率</div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">⭐ 等级徽章</h3>
                </div>
                <div style="text-align: center; padding: 40px;">
                    <div style="font-size: 64px; margin-bottom: 16px;">🏆</div>
                    <div style="font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
                        ${userData.level}
                    </div>
                    <div style="color: var(--text-muted);">
                        继续努力，向下一级进发！
                    </div>
                </div>
            </div>
            
            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <h3 class="card-title">📊 数据统计</h3>
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; padding: 20px;">
                    <div style="text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
                            ${userData.tasks.filter(t => t.status === 'pending').length}
                        </div>
                        <div style="color: var(--text-muted);">待处理任务</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
                            ${userData.tasks.filter(t => t.status === 'in_progress').length}
                        </div>
                        <div style="color: var(--text-muted);">进行中任务</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
                            ${userData.tasks.filter(t => t.status === 'review').length}
                        </div>
                        <div style="color: var(--text-muted);">待验收任务</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
                            ${userData.tasks.filter(t => t.status === 'completed').length}
                        </div>
                        <div style="color: var(--text-muted);">已完成任务</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 渲染通知中心
    function renderNotifications() {
        contentArea.innerHTML = `
            <div class="notification-list">
                ${notifications.map(notif => `
                    <div class="notification-item ${notif.unread ? 'unread' : ''}">
                        <div class="notification-icon ${notif.type}">
                            ${notif.icon}
                        </div>
                        <div class="notification-content">
                            <div class="notification-title">${notif.title}</div>
                            <div class="notification-text">${notif.content}</div>
                            <div class="notification-time">${notif.time}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // 初始加载我的任务
    renderMyTasks();
});
