// API配置文件
const API_CONFIG = {
    // 开发环境（本地）
    development: {
        baseURL: 'http://localhost:3000',
        timeout: 10000
    },
    // 生产环境（云端）
    production: {
        baseURL: 'https://5dullz-production.up.railway.app', // Railway部署地址
        timeout: 30000
    }
};

// 自动检测环境
const ENV = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'development' 
    : 'production';

const API_BASE_URL = API_CONFIG[ENV].baseURL;
const API_TIMEOUT = API_CONFIG[ENV].timeout;

// API请求封装
class API {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.timeout = API_TIMEOUT;
        this.token = localStorage.getItem('auth_token');
    }

    // 设置token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    // 获取请求头
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    // 通用请求方法
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers
            }
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: '请求失败' }));
                throw new Error(error.error || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('请求超时');
            }
            console.error('API请求错误:', error);
            throw error;
        }
    }

    // GET请求
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    // POST请求
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT请求
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE请求
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // 文件上传
    async upload(endpoint, file) {
        const formData = new FormData();
        formData.append('file', file);

        const url = `${this.baseURL}${endpoint}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('文件上传失败');
        }

        return await response.json();
    }
}

// 创建API实例
const api = new API();

// 具体的API方法
const AuthAPI = {
    // 登录
    login: (username, password) => api.post('/api/login', { username, password }),
    
    // 获取当前用户
    getCurrentUser: () => api.get('/api/user/me'),
    
    // 登出
    logout: () => {
        api.setToken(null);
        window.location.href = '/index.html';
    }
};

const TaskAPI = {
    // 获取任务列表
    getTasks: (params) => api.get('/api/tasks', params),
    
    // 获取单个任务
    getTask: (id) => api.get(`/api/tasks/${id}`),
    
    // 创建任务
    createTask: (data) => api.post('/api/tasks', data),
    
    // 更新任务
    updateTask: (id, data) => api.put(`/api/tasks/${id}`, data),
    
    // 删除任务
    deleteTask: (id) => api.delete(`/api/tasks/${id}`),
    
    // 上传任务文件
    uploadFile: (taskId, file) => api.upload(`/api/tasks/${taskId}/upload`, file),
    
    // 获取任务文件
    getTaskFiles: (taskId) => api.get(`/api/tasks/${taskId}/files`)
};

const EmployeeAPI = {
    // 获取员工列表
    getEmployees: () => api.get('/api/employees')
};

const NotificationAPI = {
    // 获取通知列表
    getNotifications: () => api.get('/api/notifications'),
    
    // 标记已读
    markAsRead: (id) => api.put(`/api/notifications/${id}/read`)
};

const StatsAPI = {
    // 获取统计数据
    getStats: () => api.get('/api/stats')
};

// 导出
window.API = api;
window.AuthAPI = AuthAPI;
window.TaskAPI = TaskAPI;
window.EmployeeAPI = EmployeeAPI;
window.NotificationAPI = NotificationAPI;
window.StatsAPI = StatsAPI;

console.log('🚀 API配置完成');
console.log('📡 当前环境:', ENV);
console.log('🌐 API地址:', API_BASE_URL);
