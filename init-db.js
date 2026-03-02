const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// 创建数据库连接
const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
    if (err) {
        console.error('❌ 数据库连接失败:', err.message);
    } else {
        console.log('✅ 数据库连接成功');
    }
});

// 初始化数据库表
function initDatabase() {
    console.log('🔄 开始初始化数据库...');

    // 创建用户表
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            avatar TEXT,
            role TEXT NOT NULL,
            skills TEXT,
            contribution INTEGER DEFAULT 0,
            level TEXT,
            tasks_completed INTEGER DEFAULT 0,
            completion_rate INTEGER DEFAULT 0,
            current_load INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ 创建用户表失败:', err.message);
        } else {
            console.log('✅ 用户表创建成功');
            insertDefaultUsers();
        }
    });

    // 创建任务表
    db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            parent_id INTEGER,
            type TEXT DEFAULT 'child',
            status TEXT DEFAULT 'pending',
            priority TEXT DEFAULT 'medium',
            progress INTEGER DEFAULT 0,
            deadline DATE,
            assignee_id INTEGER,
            keywords TEXT,
            contribution INTEGER DEFAULT 0,
            description TEXT,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (assignee_id) REFERENCES users(id),
            FOREIGN KEY (parent_id) REFERENCES tasks(id),
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ 创建任务表失败:', err.message);
        } else {
            console.log('✅ 任务表创建成功');
            insertDefaultTasks();
        }
    });

    // 创建通知表
    db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            is_read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ 创建通知表失败:', err.message);
        } else {
            console.log('✅ 通知表创建成功');
        }
    });

    // 创建文件表
    db.run(`
        CREATE TABLE IF NOT EXISTS task_files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER NOT NULL,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER,
            uploaded_by INTEGER NOT NULL,
            uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (task_id) REFERENCES tasks(id),
            FOREIGN KEY (uploaded_by) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ 创建文件表失败:', err.message);
        } else {
            console.log('✅ 文件表创建成功');
        }
    });
}

// 插入默认用户
function insertDefaultUsers() {
    const defaultPassword = bcrypt.hashSync('123456', 10);
    
    const users = [
        {
            username: 'admin',
            password: defaultPassword,
            name: '管理员',
            avatar: '管',
            role: 'admin',
            skills: null,
            contribution: 0,
            level: '超级管理员',
            tasks_completed: 0,
            completion_rate: 100,
            current_load: 0
        },
        {
            username: 'linshiyu',
            password: defaultPassword,
            name: '林诗雨',
            avatar: '林',
            role: 'employee',
            skills: '技术写作,金融分析,数据分析',
            contribution: 2450,
            level: '黄金写手',
            tasks_completed: 45,
            completion_rate: 98,
            current_load: 75
        },
        {
            username: 'chenxingchen',
            password: defaultPassword,
            name: '陈星辰',
            avatar: '陈',
            role: 'employee',
            skills: '社区运营,视频脚本,用户增长',
            contribution: 1980,
            level: '白银运营',
            tasks_completed: 38,
            completion_rate: 95,
            current_load: 82
        },
        {
            username: 'suxiaoyue',
            password: defaultPassword,
            name: '苏晓月',
            avatar: '苏',
            role: 'employee',
            skills: '内容编辑,案例研究,SEO优化',
            contribution: 1650,
            level: '青铜编辑',
            tasks_completed: 32,
            completion_rate: 92,
            current_load: 68
        },
        {
            username: 'jiangyifan',
            password: defaultPassword,
            name: '江逸凡',
            avatar: '江',
            role: 'employee',
            skills: '新媒体运营,图文设计,活动策划',
            contribution: 1420,
            level: '青铜专员',
            tasks_completed: 28,
            completion_rate: 90,
            current_load: 55
        }
    ];

    const stmt = db.prepare(`
        INSERT OR IGNORE INTO users (username, password, name, avatar, role, skills, contribution, level, tasks_completed, completion_rate, current_load)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    users.forEach(user => {
        stmt.run(
            user.username,
            user.password,
            user.name,
            user.avatar,
            user.role,
            user.skills,
            user.contribution,
            user.level,
            user.tasks_completed,
            user.completion_rate,
            user.current_load
        );
    });

    stmt.finalize(() => {
        console.log('✅ 默认用户插入成功（密码：123456）');
    });
}

// 插入默认任务
function insertDefaultTasks() {
    const tasks = [
        // 父任务
        { id: 1, title: '无人驾驶Q3覆盖计划', type: 'parent', status: 'in_progress', priority: 'high', progress: 60, deadline: '2024-03-30', assignee_id: null, keywords: 'ULL,远大,5ms,无人驾驶', contribution: 0, description: 'Q3季度无人驾驶词条覆盖计划', parent_id: null, created_by: 1 },
        // 子任务
        { id: 11, title: '知乎技术文×5', type: 'child', status: 'in_progress', priority: 'high', progress: 40, deadline: '2024-03-15', assignee_id: 2, keywords: 'ULL,远大,5ms', contribution: 30, description: '撰写5篇关于无人驾驶技术的深度文章', parent_id: 1, created_by: 1 },
        { id: 12, title: '论坛问答×10', type: 'child', status: 'pending', priority: 'medium', progress: 0, deadline: '2024-03-20', assignee_id: 3, keywords: 'ULL,远大,无人驾驶', contribution: 20, description: '在技术论坛进行问答互动', parent_id: 1, created_by: 1 },
        { id: 13, title: '案例研究×5', type: 'child', status: 'completed', priority: 'high', progress: 100, deadline: '2024-03-10', assignee_id: 4, keywords: 'ULL,案例分析', contribution: 35, description: '分析无人驾驶领域的成功案例', parent_id: 1, created_by: 1 },
        
        // 第二个父任务
        { id: 2, title: '5ms延迟技术推广', type: 'parent', status: 'pending', priority: 'medium', progress: 20, deadline: '2024-04-15', assignee_id: null, keywords: '5ms,低延迟,技术架构', contribution: 0, description: '5ms延迟技术推广计划', parent_id: null, created_by: 1 },
        { id: 21, title: '技术白皮书撰写', type: 'child', status: 'in_progress', priority: 'medium', progress: 30, deadline: '2024-03-25', assignee_id: 2, keywords: '5ms,低延迟,技术架构', contribution: 40, description: '撰写5ms延迟技术白皮书', parent_id: 2, created_by: 1 },
        { id: 22, title: '视频脚本创作', type: 'child', status: 'pending', priority: 'high', progress: 0, deadline: '2024-04-01', assignee_id: 3, keywords: '5ms,视频,推广', contribution: 30, description: '创作技术推广视频脚本', parent_id: 2, created_by: 1 },
        
        // 第三个父任务
        { id: 3, title: '远大品牌词条优化', type: 'parent', status: 'review', priority: 'high', progress: 85, deadline: '2024-03-18', assignee_id: null, keywords: '远大,品牌,ULL', contribution: 0, description: '远大品牌词条优化计划', parent_id: null, created_by: 1 },
        { id: 31, title: '百度百科更新', type: 'child', status: 'review', priority: 'high', progress: 90, deadline: '2024-03-18', assignee_id: 4, keywords: '远大,品牌,ULL', contribution: 35, description: '更新百度百科词条内容', parent_id: 3, created_by: 1 },
        { id: 32, title: '知乎问答覆盖', type: 'child', status: 'completed', priority: 'medium', progress: 100, deadline: '2024-03-12', assignee_id: 5, keywords: '远大,知乎', contribution: 25, description: '在知乎进行品牌问答覆盖', parent_id: 3, created_by: 1 }
    ];

    const stmt = db.prepare(`
        INSERT OR IGNORE INTO tasks (id, title, type, status, priority, progress, deadline, assignee_id, keywords, contribution, description, parent_id, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    tasks.forEach(task => {
        stmt.run(
            task.id,
            task.title,
            task.type,
            task.status,
            task.priority,
            task.progress,
            task.deadline,
            task.assignee_id,
            task.keywords,
            task.contribution,
            task.description,
            task.parent_id,
            task.created_by
        );
    });

    stmt.finalize(() => {
        console.log('✅ 默认任务插入成功');
    });
}

// 执行初始化
initDatabase();

// 延迟关闭数据库连接，确保所有操作完成
setTimeout(() => {
    db.close((err) => {
        if (err) {
            console.error('❌ 数据库关闭失败:', err.message);
        } else {
            console.log('✅ 数据库初始化完成，连接已关闭');
            console.log('\n📝 默认账户信息：');
            console.log('   管理员 - 用户名: admin, 密码: 123456');
            console.log('   林诗雨 - 用户名: linshiyu, 密码: 123456');
            console.log('   陈星辰 - 用户名: chenxingchen, 密码: 123456');
            console.log('   苏晓月 - 用户名: suxiaoyue, 密码: 123456');
            console.log('   江逸凡 - 用户名: jiangyifan, 密码: 123456');
            console.log('\n🚀 现在可以运行 npm start 启动服务器');
        }
    });
}, 2000);

module.exports = db;
