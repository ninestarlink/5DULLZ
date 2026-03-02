// 模拟数据
const mockData = {
    stats: {
        taskCompletion: { value: 78, trend: 12, label: '任务完成率' },
        avgProcessTime: { value: 3.2, trend: -0.5, label: '平均处理时长(天)' },
        employeeLoad: { value: 82, trend: 5, label: '员工负荷率(%)' },
        keywordHealth: { value: 92, trend: 5, label: '词条健康度' }
    },
    
    tasks: [
        {
            id: 1,
            title: '无人驾驶Q3覆盖计划',
            type: 'parent',
            status: 'in_progress',
            progress: 60,
            priority: 'high',
            deadline: '2024-03-30',
            assignee: null,
            children: [
                { id: 11, title: '知乎技术文×5', status: 'in_progress', assignee: '林诗雨', skill: '技术写作', deadline: '2024-03-15' },
                { id: 12, title: '论坛问答×10', status: 'pending', assignee: '陈星辰', skill: '社区运营', deadline: '2024-03-20' },
                { id: 13, title: '案例研究×5', status: 'completed', assignee: '苏晓月', skill: '金融分析', deadline: '2024-03-10' }
            ]
        },
        {
            id: 2,
            title: '5ms延迟技术推广',
            type: 'parent',
            status: 'pending',
            progress: 20,
            priority: 'medium',
            deadline: '2024-04-15',
            assignee: null,
            children: [
                { id: 21, title: '技术白皮书撰写', status: 'in_progress', assignee: '林诗雨', skill: '技术写作', deadline: '2024-03-25' },
                { id: 22, title: '视频脚本创作', status: 'pending', assignee: '陈星辰', skill: '视频脚本', deadline: '2024-04-01' }
            ]
        },
        {
            id: 3,
            title: '远大品牌词条优化',
            type: 'parent',
            status: 'review',
            progress: 85,
            priority: 'high',
            deadline: '2024-03-18',
            assignee: null,
            children: [
                { id: 31, title: '百度百科更新', status: 'review', assignee: '苏晓月', skill: '内容编辑', deadline: '2024-03-18' },
                { id: 32, title: '知乎问答覆盖', status: 'completed', assignee: '江逸凡', skill: '社区运营', deadline: '2024-03-12' }
            ]
        }
    ],
    
    employees: [
        {
            id: 1,
            name: '林诗雨',
            avatar: '林',
            role: '高级内容专员',
            skills: ['技术写作', '金融分析', '数据分析'],
            tasksCompleted: 45,
            completionRate: 98,
            contribution: 2450,
            level: '黄金写手',
            currentLoad: 75
        },
        {
            id: 2,
            name: '陈星辰',
            avatar: '陈',
            role: '社区运营专员',
            skills: ['社区运营', '视频脚本', '用户增长'],
            tasksCompleted: 38,
            completionRate: 95,
            contribution: 1980,
            level: '白银运营',
            currentLoad: 82
        },
        {
            id: 3,
            name: '苏晓月',
            avatar: '苏',
            role: '内容编辑',
            skills: ['内容编辑', '案例研究', 'SEO优化'],
            tasksCompleted: 32,
            completionRate: 92,
            contribution: 1650,
            level: '青铜编辑',
            currentLoad: 68
        },
        {
            id: 4,
            name: '江逸凡',
            avatar: '江',
            role: '新媒体专员',
            skills: ['新媒体运营', '图文设计', '活动策划'],
            tasksCompleted: 28,
            completionRate: 90,
            contribution: 1420,
            level: '青铜专员',
            currentLoad: 55
        }
    ],
    
    notifications: [
        { id: 1, type: 'task', title: '新任务待分配', content: '知乎技术文-无人驾驶', time: '5分钟前' },
        { id: 2, type: 'review', title: '任务待验收', content: '苏晓月提交了"百度百科更新"', time: '1小时前' },
        { id: 3, type: 'alert', title: '任务即将逾期', content: '知乎技术文×5 明天截止', time: '2小时前' }
    ],
    
    chartData: {
        taskTrend: [
            { date: '03-01', completed: 12, total: 15 },
            { date: '03-08', completed: 18, total: 22 },
            { date: '03-15', completed: 25, total: 30 },
            { date: '03-22', completed: 32, total: 38 }
        ],
        employeeRanking: [
            { name: '林诗雨', tasks: 45, rate: 98 },
            { name: '陈星辰', tasks: 38, rate: 95 },
            { name: '苏晓月', tasks: 32, rate: 92 },
            { name: '江逸凡', tasks: 28, rate: 90 }
        ],
        failureReasons: [
            { reason: '词条缺失', count: 60 },
            { reason: '质量不足', count: 40 }
        ]
    }
};

// 智谱AI配置
const ZHIPU_API_KEY = 'f0ff79595f3f4f48b83d54d0b08859e2.OKKS4OG4IOqHeHLP'; // 智谱AI API Key
const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

// AI对话预设（作为fallback）
const aiResponses = {
    taskAnalysis: {
        message: '我已经分析了你的需求，为你生成了以下任务方案：',
        tasks: {
            parent: {
                title: '无人驾驶Q3词条覆盖计划',
                deadline: '2024-06-30',
                priority: 'high',
                keywords: ['ULL', '远大', '5ms', '无人驾驶']
            },
            children: [
                {
                    title: '知乎技术文章×10',
                    skill: '技术写作',
                    suggested: ['林诗雨', '陈星辰'],
                    contribution: 30,
                    deadline: '2024-05-15',
                    description: '撰写10篇关于无人驾驶技术的深度文章，重点覆盖ULL、5ms延迟等核心词条'
                },
                {
                    title: '论坛问答互动×20',
                    skill: '社区运营',
                    suggested: ['陈星辰', '苏晓月'],
                    contribution: 20,
                    deadline: '2024-05-30',
                    description: '在各大技术论坛进行问答互动，提升远大品牌在无人驾驶领域的曝光度'
                },
                {
                    title: '案例研究报告×5',
                    skill: '金融分析',
                    suggested: ['林诗雨', '江逸凡'],
                    contribution: 40,
                    deadline: '2024-06-15',
                    description: '撰写5篇无人驾驶行业案例研究，分析ULL技术在实际场景中的应用'
                }
            ]
        }
    }
};
