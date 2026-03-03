// 智谱AI API配置和调用
const ZHIPU_CONFIG = {
    apiKey: 'f0ff79595f3f4f48b83d54d0b08859e2.OKKS4OG4IOqHeHLP',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4-flash'
};

// 智谱AI API类
class ZhipuAI {
    constructor(config) {
        this.apiKey = config.apiKey;
        this.baseURL = config.baseURL;
        this.model = config.model;
    }
    
    // 发送聊天请求
    async chat(messages, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    temperature: options.temperature || 0.7,
                    max_tokens: options.max_tokens || 2000,
                    stream: false
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || '智谱AI请求失败');
            }
            
            const data = await response.json();
            return data.choices[0].message.content;
            
        } catch (error) {
            console.error('智谱AI调用失败:', error);
            throw error;
        }
    }
    
    // 生成任务
    async generateTasks(prompt, context = {}) {
        const systemPrompt = `你是一个专业的任务管理助手。根据用户的需求，生成详细的任务列表。

任务格式要求：
- 每个任务包含：标题、描述、优先级（high/medium/low）、预计工作量（小时）、关键词
- 任务要具体、可执行、有明确的交付物
- 根据任务复杂度合理分配优先级
- 关键词要准确反映任务内容

请以JSON格式返回任务列表，格式如下：
{
  "tasks": [
    {
      "title": "任务标题",
      "description": "详细描述",
      "priority": "high",
      "estimatedHours": 8,
      "keywords": ["关键词1", "关键词2"],
      "contribution": 30
    }
  ]
}`;

        const userPrompt = `${prompt}

${context.employees ? `可分配的员工：${context.employees.map(e => e.name).join('、')}` : ''}
${context.deadline ? `截止日期：${context.deadline}` : ''}`;

        try {
            const response = await this.chat([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ]);
            
            // 解析JSON响应
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                return result.tasks || [];
            }
            
            throw new Error('AI返回格式错误');
            
        } catch (error) {
            console.error('生成任务失败:', error);
            throw error;
        }
    }
    
    // 优化任务描述
    async optimizeTaskDescription(task) {
        const prompt = `请优化以下任务描述，使其更加清晰、具体、可执行：

任务标题：${task.title}
当前描述：${task.description || '无'}

要求：
1. 明确任务目标和交付物
2. 列出关键步骤
3. 说明验收标准
4. 保持简洁专业

请直接返回优化后的描述文本。`;

        try {
            const response = await this.chat([
                { role: 'user', content: prompt }
            ]);
            
            return response.trim();
            
        } catch (error) {
            console.error('优化描述失败:', error);
            throw error;
        }
    }
    
    // 智能分配任务
    async suggestAssignment(task, employees) {
        const prompt = `根据任务需求和员工技能，推荐最合适的员工。

任务信息：
- 标题：${task.title}
- 描述：${task.description}
- 关键词：${task.keywords?.join('、') || '无'}
- 优先级：${task.priority}

员工信息：
${employees.map(emp => `
- ${emp.name}
  技能：${emp.skills?.join('、') || '无'}
  当前负荷：${emp.currentLoad || 0}%
  完成率：${emp.completionRate || 0}%
`).join('\n')}

请推荐最合适的员工，并说明理由。格式：
{
  "employeeId": 员工ID,
  "employeeName": "员工姓名",
  "reason": "推荐理由"
}`;

        try {
            const response = await this.chat([
                { role: 'user', content: prompt }
            ]);
            
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            throw new Error('AI返回格式错误');
            
        } catch (error) {
            console.error('智能分配失败:', error);
            throw error;
        }
    }
}

// 创建全局实例
const zhipuAI = new ZhipuAI(ZHIPU_CONFIG);

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ZhipuAI, zhipuAI, ZHIPU_CONFIG };
}
