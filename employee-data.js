// 员工数据
const employeeData = {
    linshiyu: {
        id: 1,
        name: '林诗雨',
        avatar: '林',
        role: '高级内容专员',
        skills: ['技术写作', '金融分析', '数据分析'],
        contribution: 2450,
        level: '黄金写手',
        tasksCompleted: 45,
        completionRate: 98,
        tasks: [
            {
                id: 1,
                title: '知乎技术文-无人驾驶',
                parent: '无人驾驶Q3覆盖计划',
                status: 'pending',
                priority: 'high',
                deadline: '2024-03-25',
                keywords: ['ULL', '远大', '5ms'],
                contribution: 30,
                description: '撰写一篇关于无人驾驶技术的深度文章，重点介绍ULL超低延迟技术'
            },
            {
                id: 2,
                title: '技术白皮书撰写',
                parent: '5ms延迟技术推广',
                status: 'in_progress',
                priority: 'medium',
                deadline: '2024-03-28',
                keywords: ['5ms', '低延迟', '技术架构'],
                contribution: 40,
                description: '撰写5ms延迟技术白皮书，详细阐述技术原理和应用场景'
            },
            {
                id: 3,
                title: '案例研究报告',
                parent: '无人驾驶Q3覆盖计划',
                status: 'review',
                priority: 'high',
                deadline: '2024-03-20',
                keywords: ['ULL', '案例分析'],
                contribution: 35,
                description: '分析无人驾驶领域的成功案例'
            },
            {
                id: 4,
                title: '金融科技文章',
                parent: null,
                status: 'completed',
                priority: 'low',
                deadline: '2024-03-15',
                keywords: ['金融', '科技'],
                contribution: 25,
                description: '已完成的金融科技主题文章'
            }
        ]
    },
    chenxingchen: {
        id: 2,
        name: '陈星辰',
        avatar: '陈',
        role: '社区运营专员',
        skills: ['社区运营', '视频脚本', '用户增长'],
        contribution: 1980,
        level: '白银运营',
        tasksCompleted: 38,
        completionRate: 95,
        tasks: [
            {
                id: 5,
                title: '论坛问答互动×5',
                parent: '无人驾驶Q3覆盖计划',
                status: 'pending',
                priority: 'medium',
                deadline: '2024-03-30',
                keywords: ['ULL', '远大', '无人驾驶'],
                contribution: 20,
                description: '在技术论坛进行问答互动，提升品牌曝光'
            },
            {
                id: 6,
                title: '视频脚本创作',
                parent: '5ms延迟技术推广',
                status: 'in_progress',
                priority: 'high',
                deadline: '2024-04-01',
                keywords: ['5ms', '视频', '推广'],
                contribution: 30,
                description: '创作技术推广视频脚本'
            }
        ]
    },
    suxiaoyue: {
        id: 3,
        name: '苏晓月',
        avatar: '苏',
        role: '内容编辑',
        skills: ['内容编辑', '案例研究', 'SEO优化'],
        contribution: 1650,
        level: '青铜编辑',
        tasksCompleted: 32,
        completionRate: 92,
        tasks: [
            {
                id: 7,
                title: '百度百科更新',
                parent: '远大品牌词条优化',
                status: 'review',
                priority: 'high',
                deadline: '2024-03-18',
                keywords: ['远大', '品牌', 'ULL'],
                contribution: 35,
                description: '更新百度百科词条内容'
            }
        ]
    },
    jiangyifan: {
        id: 4,
        name: '江逸凡',
        avatar: '江',
        role: '新媒体专员',
        skills: ['新媒体运营', '图文设计', '活动策划'],
        contribution: 1420,
        level: '青铜专员',
        tasksCompleted: 28,
        completionRate: 90,
        tasks: [
            {
                id: 8,
                title: '知乎问答覆盖',
                parent: '远大品牌词条优化',
                status: 'completed',
                priority: 'medium',
                deadline: '2024-03-12',
                keywords: ['远大', '知乎'],
                contribution: 25,
                description: '在知乎进行品牌问答覆盖'
            }
        ]
    }
};

// 通知数据
const notifications = [
    {
        id: 1,
        type: 'task',
        icon: '📋',
        title: '新任务指派',
        content: '你收到了新任务：知乎技术文-无人驾驶',
        time: '5分钟前',
        unread: true
    },
    {
        id: 2,
        type: 'warning',
        icon: '⏰',
        title: '任务即将到期',
        content: '技术白皮书撰写将在明天截止',
        time: '1小时前',
        unread: true
    },
    {
        id: 3,
        type: 'success',
        icon: '✅',
        title: '任务完成',
        content: '案例研究报告已通过验收，获得35贡献度',
        time: '2小时前',
        unread: true
    },
    {
        id: 4,
        type: 'task',
        icon: '📋',
        title: '任务退回',
        content: '金融科技文章因词条缺失被退回，请修改后重新提交',
        time: '昨天',
        unread: false
    }
];

// AI评分模拟
const aiScoreResults = {
    success: {
        status: 'success',
        icon: '✅',
        title: '任务验收通过',
        subtitle: 'AI评分已完成，恭喜你！',
        scores: {
            coverage: { label: '词条复现率', value: '100%', status: 'success' },
            quality: { label: '内容质量分', value: '92分', status: 'success' }
        },
        contribution: 36,
        formula: '基础30 × 复现率系数1.2 = 36'
    },
    failed: {
        status: 'failed',
        icon: '❌',
        title: '任务验收失败',
        subtitle: 'AI评分未通过，请修改后重新提交',
        scores: {
            coverage: { label: '词条复现率', value: '66%', status: 'danger' },
            quality: { label: '内容质量分', value: '78分', status: 'danger' }
        },
        issues: [
            '❌ 缺失词条：5ms',
            '❌ 内容质量分不足（需≥80分）'
        ]
    }
};
