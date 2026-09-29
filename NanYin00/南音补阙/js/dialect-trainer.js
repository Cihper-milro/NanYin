// AI方言陪练模块
const DialectTrainer = {
    // 方言短语数据
    dialectPhrases: {
        cantonese: {
            greeting: "早晨（zou2 san4）- 早上好",
            daily: "唔该（m4 goi1）- 谢谢/请",
            food: "饮茶（jam2 caa4）- 喝茶吃点心",
            number: "一（jat1），二（ji6），三（saam1）"
        },
        shanghainese: {
            greeting: "侬好（non ho）- 你好",
            daily: "谢谢（xia xia）- 谢谢",
            food: "小笼包（xiao long bao）- 小笼包",
            number: "一（yi），二（ni），三（se）"
        },
        sichuanese: {
            greeting: "你好噻（ni hao sai）- 你好啊",
            daily: "要得（yao dei）- 好的",
            food: "火锅（ho guo）- 火锅",
            number: "一（yi），二（er），三（san）"
        },
        minnan: {
            greeting: "汝好（lí hó）- 你好",
            daily: "多谢（to-siā）- 谢谢",
            food: "蚵仔煎（ô-á-chian）- 海蛎煎",
            number: "一（it），二（jī），三（sam）"
        },
        hunanese: {
            greeting: "你好（ni hao）- 你好",
            daily: "多谢（duo xie）- 谢谢",
            food: "辣椒炒肉（la jiao chao rou）- 辣椒炒肉",
            number: "一（yi），二（a），三（san）"
        },
        hakka: {
            greeting: "你好（ngi ho）- 你好",
            daily: "承蒙（shin mung）- 谢谢",
            food: "酿豆腐（yong tau fu）- 酿豆腐",
            number: "一（yit），二（ngi），三（sam）"
        }
    },

    // 初始化
    init: function() {
        this.bindEvents();
    },

    // 绑定事件
    bindEvents: function() {
        const self = this;
        
        // 生成练习内容
        document.getElementById('generate-phrase').addEventListener('click', function() {
            self.generatePracticePhrase();
        });

        // 播放示范
        document.getElementById('play-btn').addEventListener('click', function() {
            self.playDemonstration();
        });

        // 录音按钮
        document.getElementById('record-btn').addEventListener('click', function() {
            self.toggleRecording();
        });

        // 评估按钮
        document.getElementById('evaluate-btn').addEventListener('click', function() {
            self.evaluatePronunciation();
        });
    },

    // 生成练习内容
    generatePracticePhrase: function() {
        const dialect = document.getElementById('dialect-select').value;
        const phraseType = document.getElementById('phrase-select').value;
        
        if (!dialect || !phraseType) {
            Utils.showMessage('请选择方言类型和练习短语', 'warning');
            return;
        }
        
        let phrase = "";
        let dialectName = "";
        
        switch(dialect) {
            case "cantonese":
                dialectName = "粤语";
                phrase = this.dialectPhrases.cantonese[phraseType] || "你好，世界！";
                break;
            case "shanghainese":
                dialectName = "上海话";
                phrase = this.dialectPhrases.shanghainese[phraseType] || "侬好，世界！";
                break;
            case "sichuanese":
                dialectName = "四川话";
                phrase = this.dialectPhrases.sichuanese[phraseType] || "你好，世界！";
                break;
            case "minnan":
                dialectName = "闽南语";
                phrase = this.dialectPhrases.minnan[phraseType] || "汝好，世界！";
                break;
            case "hunanese":
                dialectName = "湖南话";
                phrase = this.dialectPhrases.hunanese[phraseType] || "你好，世界！";
                break;
            case "hakka":
                dialectName = "客家话";
                phrase = this.dialectPhrases.hakka[phraseType] || "你好，世界！";
                break;
            default:
                dialectName = "方言";
                phrase = "你好，世界！";
        }
        
        document.getElementById('practice-text').innerHTML = 
            `<strong>${dialectName}练习：</strong> ${phrase}`;
        
        // 显示反馈区域
        document.getElementById('feedback').style.display = 'block';
        document.getElementById('feedback-text').textContent = 
            `已为您生成${dialectName}练习内容。点击"播放示范"听取正确发音，然后点击"开始录音"进行练习。`;
        
        // 模拟评分
        const score = Math.floor(Math.random() * 30) + 70;
        document.getElementById('score-display').innerHTML = 
            `<div style="margin-top:10px; background:#e9f7fe; padding:10px; border-radius:5px;">
                <strong>AI预测得分：${score}分</strong> (基于您过往练习数据)
             </div>`;
        
        Utils.showMessage(`${dialectName}练习内容已生成`, 'success');
    },

    // 播放示范
    playDemonstration: function() {
        const practiceText = document.getElementById('practice-text').textContent;
        if (practiceText.includes("请选择")) {
            Utils.showMessage('请先生成练习内容', 'warning');
            return;
        }
        
        Utils.showMessage('正在播放方言示范发音...', 'info');
        // 实际应用中这里会调用语音合成API
    },

    // 切换录音状态
    toggleRecording: function() {
        const practiceText = document.getElementById('practice-text').textContent;
        if (practiceText.includes("请选择")) {
            Utils.showMessage('请先生成练习内容', 'warning');
            return;
        }
        
        const btn = document.getElementById('record-btn');
        if (btn.innerHTML.includes("开始录音")) {
            btn.innerHTML = '<i class="fas fa-stop"></i> 停止录音';
            btn.style.backgroundColor = "#ff5252";
            Utils.showMessage('开始录音...请说出练习内容', 'info');
        } else {
            btn.innerHTML = '<i class="fas fa-microphone"></i> 开始录音';
            btn.style.backgroundColor = "#ff6b6b";
            
            // 模拟AI分析
            setTimeout(() => {
                const analysis = `
                    AI分析结果：
                    √ 发音准确度：85%
                    √ 语调自然度：78%
                    √ 流畅度：88%
                    √ 总体评分：84分
                    
                    建议：注意第三声的发音，可以多听几遍示范。
                `;
                Utils.showMessage('录音分析完成', 'success');
                document.getElementById('feedback-text').textContent = analysis;
            }, 1500);
        }
    },

    // 评估发音
    evaluatePronunciation: function() {
        const practiceText = document.getElementById('practice-text').textContent;
        if (practiceText.includes("请选择")) {
            Utils.showMessage('请先生成练习内容', 'warning');
            return;
        }
        
        const evaluation = `
            AI评估详情：
            1. 发音准确度: 82%
            2. 语调自然度: 76%
            3. 流畅度: 88%
            4. 节奏掌握: 75%
            5. 声调准确度: 80%
            
            综合评分: 80.2分
            
            改进建议：
            - 注意第三声的发音，可以多听几遍示范
            - 练习时可以放慢语速，确保每个音节清晰
            - 多听当地人的对话，模仿语调和节奏
        `;
        
        Utils.showMessage('发音评估完成', 'success');
        document.getElementById('feedback-text').textContent = evaluation;
    }
};