const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// 创建上传目录
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 配置文件上传
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 数据库连接
const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
    if (err) {
        console.error('❌ 数据库连接失败:', err.message);
    } else {
        console.log('✅ 数据库连接成功');
    }
});

// JWT验证中间件
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: '未提供认证令牌' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: '令牌无效' });
        }
        req.user = user;
        next();
    });
};

// ==================== 用户相关API ====================

// 登录
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: '数据库错误' });
        }
        if (!user) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                const token = jwt.sign(
                    { id: user.id, username: user.username, role: user.role },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );
                
                res.json({
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        name: user.name,
                        avatar: user.avatar,
                        role: user.role,
                        skills: user.skills ? user.skills.split(',') : [],
                        contribution: user.contribution,
                        level: user.level,
                        tasksCompleted: user.tasks_completed,
                        completionRate: user.completion_rate,
                        currentLoad: user.current_load
                    }
                });
            } else {
                res.status(401).json({ error: '用户名或密码错误' });
            }
        });
    });
});

// 获取当前用户信息
app.get('/api/user/me', authenticateToken, (req, res) => {
    db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) {
            return res.status(500).json({ error: '数据库错误' });
        }
        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }

        res.json({
            id: user.id,
            username: user.username,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
            skills: user.skills ? user.skills.split(',') : [],
            contribution: user.contribution,
            level: user.level,
            tasksCompleted: user.tasks_completed,
            completionRate: user.completion_rate,
            currentLoad: user.current_load
        });
    });
});

// 获取所有员工
app.get('/api/employees', authenticateToken, (req, res) => {
    db.all('SELECT * FROM users WHERE role = ?', ['employee'], (err, users) => {
        if (err) {
            return res.status(500).json({ error: '数据库错误' });
        }

        const employees = users.map(user => ({
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
            skills: user.skills ? user.skills.split(',') : [],
            tasksCompleted: user.tasks_completed,
            completionRate: user.completion_rate,
            contribution: user.contribution,
            level: user.level,
            currentLoad: user.current_load
        }));

        res.json(employees);
    });
});

// ==================== 任务相关API ====================

// 获取所有任务
app.get('/api/tasks', authenticateToken, (req, res) => {
    const { status, assignee_id, parent_id } = req.query;
    
    let query = 'SELECT t.*, u.name as assignee_name FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id WHERE 1=1';
    const params = [];

    if (status) {
        query += ' AND t.status = ?';
        params.push(status);
    }
    if (assignee_id) {
        query += ' AND t.assignee_id = ?';
        params.push(assignee_id);
    }
    if (parent_id !== undefined) {
        if (parent_id === 'null') {
            query += ' AND t.parent_id IS NULL';
        } else {
            query += ' AND t.parent_id = ?';
            params.push(parent_id);
        }
    }

    query += ' ORDER BY t.created_at DESC';

    db.all(query, params, (err, tasks) => {
        if (err) {
            return res.status(500).json({ error: '数据库错误' });
        }

        const formattedTasks = tasks.map(task => ({
            id: task.id,
            title: task.title,
            parentId: task.parent_id,
            type: task.type,
            status: task.status,
            priority: task.priority,
            progress: task.progress,
            deadline: task.deadline,
            assigneeId: task.assignee_id,
            assigneeName: task.assignee_name,
            keywords: task.keywords ? task.keywords.split(',') : [],
            contribution: task.contribution,
            description: task.description,
            createdAt: task.created_at,
            updatedAt: task.updated_at
        }));

        res.json(formattedTasks);
    });
});

// 获取单个任务
app.get('/api/tasks/:id', authenticateToken, (req, res) => {
    db.get(
        'SELECT t.*, u.name as assignee_name FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id WHERE t.id = ?',
        [req.params.id],
        (err, task) => {
            if (err) {
                return res.status(500).json({ error: '数据库错误' });
            }
            if (!task) {
                return res.status(404).json({ error: '任务不存在' });
            }

            res.json({
                id: task.id,
                title: task.title,
                parentId: task.parent_id,
                type: task.type,
                status: task.status,
                priority: task.priority,
                progress: task.progress,
                deadline: task.deadline,
                assigneeId: task.assignee_id,
                assigneeName: task.assignee_name,
                keywords: task.keywords ? task.keywords.split(',') : [],
                contribution: task.contribution,
                description: task.description,
                createdAt: task.created_at,
                updatedAt: task.updated_at
            });
        }
    );
});

// 创建任务
app.post('/api/tasks', authenticateToken, (req, res) => {
    const { title, parentId, type, status, priority, deadline, assigneeId, keywords, contribution, description } = req.body;

    db.run(
        `INSERT INTO tasks (title, parent_id, type, status, priority, deadline, assignee_id, keywords, contribution, description, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, parentId || null, type || 'child', status || 'pending', priority || 'medium', deadline, assigneeId || null, 
         Array.isArray(keywords) ? keywords.join(',') : keywords, contribution || 0, description, req.user.id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: '创建任务失败' });
            }

            // 如果分配了员工，创建通知
            if (assigneeId) {
                db.run(
                    'INSERT INTO notifications (user_id, type, title, content) VALUES (?, ?, ?, ?)',
                    [assigneeId, 'task', '新任务指派', `你收到了新任务：${title}`]
                );
            }

            res.json({ id: this.lastID, message: '任务创建成功' });
        }
    );
});

// 更新任务
app.put('/api/tasks/:id', authenticateToken, (req, res) => {
    const { title, status, priority, progress, deadline, assigneeId, keywords, contribution, description } = req.body;
    
    const updates = [];
    const params = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    if (priority !== undefined) { updates.push('priority = ?'); params.push(priority); }
    if (progress !== undefined) { updates.push('progress = ?'); params.push(progress); }
    if (deadline !== undefined) { updates.push('deadline = ?'); params.push(deadline); }
    if (assigneeId !== undefined) { updates.push('assignee_id = ?'); params.push(assigneeId); }
    if (keywords !== undefined) { 
        updates.push('keywords = ?'); 
        params.push(Array.isArray(keywords) ? keywords.join(',') : keywords); 
    }
    if (contribution !== undefined) { updates.push('contribution = ?'); params.push(contribution); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id);

    db.run(
        `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
        params,
        function(err) {
            if (err) {
                return res.status(500).json({ error: '更新任务失败' });
            }
            res.json({ message: '任务更新成功' });
        }
    );
});

// 删除任务
app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM tasks WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: '删除任务失败' });
        }
        res.json({ message: '任务删除成功' });
    });
});

// ==================== 文件上传API ====================

// 上传任务文件
app.post('/api/tasks/:id/upload', authenticateToken, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: '未上传文件' });
    }

    db.run(
        'INSERT INTO task_files (task_id, filename, original_name, file_path, file_size, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
        [req.params.id, req.file.filename, req.file.originalname, req.file.path, req.file.size, req.user.id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: '文件记录保存失败' });
            }

            res.json({
                id: this.lastID,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                message: '文件上传成功'
            });
        }
    );
});

// 获取任务文件列表
app.get('/api/tasks/:id/files', authenticateToken, (req, res) => {
    db.all(
        'SELECT * FROM task_files WHERE task_id = ?',
        [req.params.id],
        (err, files) => {
            if (err) {
                return res.status(500).json({ error: '数据库错误' });
            }
            res.json(files);
        }
    );
});

// ==================== 通知API ====================

// 获取用户通知
app.get('/api/notifications', authenticateToken, (req, res) => {
    db.all(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
        [req.user.id],
        (err, notifications) => {
            if (err) {
                return res.status(500).json({ error: '数据库错误' });
            }
            res.json(notifications);
        }
    );
});

// 标记通知为已读
app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
    db.run(
        'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: '更新失败' });
            }
            res.json({ message: '通知已标记为已读' });
        }
    );
});

// ==================== 统计API ====================

// 获取统计数据
app.get('/api/stats', authenticateToken, (req, res) => {
    const stats = {};

    // 任务完成率
    db.get(
        'SELECT COUNT(*) as total, SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed FROM tasks WHERE type = "child"',
        (err, result) => {
            if (err) return res.status(500).json({ error: '数据库错误' });
            
            stats.taskCompletion = {
                value: result.total > 0 ? Math.round((result.completed / result.total) * 100) : 0,
                total: result.total,
                completed: result.completed
            };

            // 员工负荷
            db.get('SELECT AVG(current_load) as avgLoad FROM users WHERE role = "employee"', (err, result) => {
                if (err) return res.status(500).json({ error: '数据库错误' });
                
                stats.employeeLoad = {
                    value: Math.round(result.avgLoad || 0)
                };

                res.json(stats);
            });
        }
    );
});

// ==================== 启动服务器 ====================

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║   🚀 任务管理系统服务器已启动              ║
║                                            ║
║   📡 服务器地址: http://localhost:${PORT}    ║
║   📊 数据库: SQLite (database.db)         ║
║                                            ║
║   📝 API文档:                              ║
║   POST   /api/login          - 登录       ║
║   GET    /api/user/me        - 用户信息   ║
║   GET    /api/employees      - 员工列表   ║
║   GET    /api/tasks          - 任务列表   ║
║   POST   /api/tasks          - 创建任务   ║
║   PUT    /api/tasks/:id      - 更新任务   ║
║   DELETE /api/tasks/:id      - 删除任务   ║
║   GET    /api/notifications  - 通知列表   ║
║   GET    /api/stats          - 统计数据   ║
║                                            ║
║   💡 提示: 按 Ctrl+C 停止服务器           ║
╚════════════════════════════════════════════╝
    `);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n\n🛑 正在关闭服务器...');
    db.close((err) => {
        if (err) {
            console.error('❌ 数据库关闭失败:', err.message);
        } else {
            console.log('✅ 数据库连接已关闭');
        }
        process.exit(0);
    });
});
