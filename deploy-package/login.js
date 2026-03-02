// 登录逻辑
document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const quickBtns = document.querySelectorAll('.quick-btn');
    const loginForm = document.getElementById('loginForm');
    const quickLogin = document.getElementById('quickLogin');
    const errorMessage = document.getElementById('errorMessage');
    
    let currentRole = 'admin';
    
    // 显示错误信息
    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 5000);
        } else {
            alert(message);
        }
    }
    
    // 切换登录角色
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentRole = this.dataset.role;
            
            // 更新快速登录按钮
            updateQuickLogin(currentRole);
        });
    });
    
    // 更新快速登录选项
    function updateQuickLogin(role) {
        if (role === 'admin') {
            quickLogin.innerHTML = `
                <p>快速登录：</p>
                <div class="quick-btns">
                    <button type="button" class="quick-btn" data-user="admin">管理员</button>
                </div>
            `;
        } else {
            quickLogin.innerHTML = `
                <p>快速登录：</p>
                <div class="quick-btns">
                    <button type="button" class="quick-btn" data-user="linshiyu">林诗雨</button>
                    <button type="button" class="quick-btn" data-user="chenxingchen">陈星辰</button>
                    <button type="button" class="quick-btn" data-user="suxiaoyue">苏晓月</button>
                    <button type="button" class="quick-btn" data-user="jiangyifan">江逸凡</button>
                </div>
            `;
        }
        
        // 重新绑定快速登录事件
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                quickLoginHandler(this.dataset.user);
            });
        });
    }
    
    // 快速登录
    async function quickLoginHandler(username) {
        const password = '123456'; // 默认密码
        await performLogin(username, password);
    }
    
    // 执行登录
    async function performLogin(username, password) {
        try {
            // 显示加载状态
            const loginBtn = document.querySelector('.login-btn');
            const originalText = loginBtn.textContent;
            loginBtn.textContent = '登录中...';
            loginBtn.disabled = true;
            
            // 调用登录API
            const response = await AuthAPI.login(username, password);
            
            // 保存token
            API.setToken(response.token);
            
            // 保存用户信息
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            
            // 根据角色跳转
            if (response.user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'employee.html';
            }
        } catch (error) {
            console.error('登录失败:', error);
            showError(error.message || '登录失败，请检查用户名和密码');
            
            // 恢复按钮状态
            const loginBtn = document.querySelector('.login-btn');
            loginBtn.textContent = '登录';
            loginBtn.disabled = false;
        }
    }
    
    // 表单登录
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            showError('请输入用户名和密码');
            return;
        }
        
        await performLogin(username, password);
    });
    
    // 初始化快速登录按钮事件
    quickBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            quickLoginHandler(this.dataset.user);
        });
    });
    
    // 检查是否已登录
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('currentUser');
    if (token && user) {
        try {
            const userData = JSON.parse(user);
            if (userData.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'employee.html';
            }
        } catch (e) {
            // 清除无效数据
            localStorage.removeItem('auth_token');
            localStorage.removeItem('currentUser');
        }
    }
});
