// 古诗词吟诵模块
const PoetryReciter = {
    // 古诗词数据
    poetryData: {
        "quiet-night-thought": {
            title: "《静夜思》 - 李白",
            content: "床前明月光，疑是地上霜。<br>举头望明月，低头思故乡。",
            description: "唐代诗人李白的代表作，表达游子思乡之情。"
        },
        "spring-morning": {
            title: "《春晓》 - 孟浩然",
            content: "春眠不觉晓，处处闻啼鸟。<br>夜来风雨声，花落知多少。",
            description: "描写春天早晨的景色，语言清新自然。"
        },
        "ascend-stork-tower": {
            title: "《登鹳雀楼》 - 王之涣",
            content: "白日依山尽，黄河入海流。<br>欲穷千里目，更上一层楼。",
            description: "登高望远之作，蕴含深刻哲理。"
        },
        "return-native": {
            title: "《回乡偶书》 - 贺知章",
            content: "少小离家老大回，乡音无改鬓毛衰。<br>儿童相见不相识，笑问客从何处来。",
            description: "描写久别回乡的感慨，语言质朴深情。"
        }
    },

    // 初始化
    init: function() {
        this.bindEvents();
    },

    // 绑定事件
    bindEvents: function() {
        const self = this;
        
        // 播放吟诵
        document.getElementById('play-poetry').addEventListener('click', function() {
            self.playPoetryRecitation();
        });

        // 慢速播放
        document.getElementById('slow-play').addEventListener('click', function() {
            self.playSlowRecitation();
        });

        // 跟读模式
        document.getElementById('follow-read').addEventListener('click', function() {
            self.followReadMode();
        });
    },

    // 播放古诗词吟诵
    playPoetryRecitation: function() {
        const dialect = document.getElementById('poetry-dialect').value;
        const poetry = document.getElementById('poetry-select').value;
        
        if (!dialect || !poetry) {
            Utils.showMessage('请选择吟诵方言和古诗词', 'warning');
            return;
        }
        
        const poetryInfo = this.poetryData[poetry];
        document.getElementById('poetry-title').textContent = poetryInfo.title;
        document.getElementById('poetry-content').innerHTML = `
            <div style="margin-bottom: 15px; color: #666; font-size: 1rem;">
                ${poetryInfo.description}
            </div>
            <div style="font-size: 1.3rem; line-height: 2;">
                ${poetryInfo.content}
            </div>
        `;
        
        let dialectName = "";
        switch(dialect) {
            case "cantonese": dialectName = "粤语"; break;
            case "shanghainese": dialectName = "上海话"; break;
            case "sichuanese": dialectName = "四川话"; break;
            case "minnan": dialectName = "闽南语"; break;
            default: dialectName = "方言";
        }
        
        Utils.showMessage(`正在用${dialectName}吟诵${poetryInfo.title}`, 'info');
    },

    // 慢速播放
    playSlowRecitation: function() {
        const poetryTitle = document.getElementById('poetry-title').textContent;
        if (poetryTitle === "古诗词内容将显示在这里") {
            Utils.showMessage('请先选择古诗词并播放', 'warning');
            return;
        }
        
        Utils.showMessage('正在慢速播放古诗词吟诵...', 'info');
    },

    // 跟读模式
    followReadMode: function() {
        const poetryTitle = document.getElementById('poetry-title').textContent;
        if (poetryTitle === "古诗词内容将显示在这里") {
            Utils.showMessage('请先选择古诗词并播放', 'warning');
            return;
        }
        
        Utils.showMessage('进入跟读模式：系统将播放一句，您跟读一句...', 'info');
    }
};