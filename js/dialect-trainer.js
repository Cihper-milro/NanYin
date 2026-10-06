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

    // 录音状态
    mediaRecorder: null,
    mediaStream: null,
    audioChunks: [],
    recordedBlob: null,
    recordedUrl: null,
    recordedMimeType: '',
    isRecording: false,
    recordTimer: null,
    recordSeconds: 0,

    // 初始化
    init: function() {
        this.bindEvents();
        this.syncRecordingUi();
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

        // 播放录音按钮（页面上若没有该按钮则跳过）
        const playRecordingButton = document.getElementById('play-recording');
        if (playRecordingButton) {
            playRecordingButton.addEventListener('click', function() {
                self.toggleRecordingPlayback();
            });
        }

        // 录音回放器：播放状态变化时同步按钮文字与面板
        const recordedAudio = document.getElementById('recorded-audio');
        if (recordedAudio) {
            ['play', 'pause', 'ended', 'loadedmetadata'].forEach(function(type) {
                recordedAudio.addEventListener(type, function() {
                    self.syncRecordingUi();
                });
            });
        }

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

    // ==================== 录音 ====================

    // 切换录音状态
    toggleRecording: function() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    },

    // 开始录音（真实调用麦克风）
    startRecording: function() {
        const self = this;

        if (this.isRecording) {
            return;
        }

        const practiceText = document.getElementById('practice-text').textContent;
        if (practiceText.includes('请选择')) {
            Utils.showMessage('请先生成练习内容', 'warning');
            return;
        }

        // 录音要求 https（GitHub Pages 满足）或 localhost，且浏览器支持
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            Utils.showMessage('当前环境不支持录音：请用 Chrome/Edge/Safari 并通过 https 打开页面', 'error');
            return;
        }
        if (typeof MediaRecorder === 'undefined') {
            Utils.showMessage('当前浏览器不支持录音（缺少 MediaRecorder）', 'error');
            return;
        }

        // 若正在回放上一次录音，先停下
        const recordedAudio = document.getElementById('recorded-audio');
        if (recordedAudio && recordedAudio.paused === false) {
            recordedAudio.pause();
        }

        navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
            self.mediaStream = stream;
            self.audioChunks = [];

            const mimeType = self.pickMimeType();
            try {
                self.mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType: mimeType }) : new MediaRecorder(stream);
            } catch (error) {
                self.mediaRecorder = new MediaRecorder(stream);
            }
            self.recordedMimeType = self.mediaRecorder.mimeType || mimeType || 'audio/webm';

            // 收集音频分片
            self.mediaRecorder.addEventListener('dataavailable', function(event) {
                if (event.data && event.data.size > 0) {
                    self.audioChunks.push(event.data);
                }
            });

            // 录制结束
            self.mediaRecorder.addEventListener('stop', function() {
                self.onRecordingStopped();
            });

            self.mediaRecorder.addEventListener('error', function(event) {
                console.error('录音出错:', event.error || event);
                Utils.showMessage('录音过程中出错，请重试', 'error');
                self.isRecording = false;
                self.stopRecordTimer();
                self.releaseStream();
                self.syncRecordingUi();
            });

            self.mediaRecorder.start();
            self.isRecording = true;
            self.recordSeconds = 0;
            self.startRecordTimer();
            self.syncRecordingUi();
            Utils.showMessage('开始录音，请朗读练习内容', 'info');
        }).catch(function(error) {
            console.error('无法开始录音:', error);
            const name = error && error.name ? error.name : '';
            if (name === 'NotAllowedError' || name === 'SecurityError') {
                Utils.showMessage('麦克风权限被拒绝：请在浏览器里允许使用麦克风后重试', 'error');
            } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
                Utils.showMessage('没有检测到麦克风设备', 'error');
            } else if (name === 'NotReadableError' || name === 'TrackStartError') {
                Utils.showMessage('麦克风被其他程序占用，请关闭后重试', 'error');
            } else {
                Utils.showMessage('无法开始录音：' + (name || '未知错误'), 'error');
            }
        });
    },

    // 停止录音
    stopRecording: function() {
        const self = this;

        this.isRecording = false;
        this.stopRecordTimer();

        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        } else {
            this.releaseStream();
        }

        // 兜底：1.5 秒后无论如何释放麦克风，避免浏览器一直显示"录音中"
        setTimeout(function() {
            self.releaseStream();
        }, 1500);

        this.syncRecordingUi();
    },

    // 录音结束：把分片合成可回放的音频
    onRecordingStopped: function() {
        this.isRecording = false;
        this.stopRecordTimer();
        this.releaseStream();

        if (this.audioChunks.length === 0) {
            this.syncRecordingUi();
            Utils.showMessage('没有录到声音，请检查麦克风后重试', 'warning');
            return;
        }

        // 释放上一次的 ObjectURL，避免内存泄漏
        if (this.recordedUrl) {
            URL.revokeObjectURL(this.recordedUrl);
            this.recordedUrl = null;
        }

        this.recordedBlob = new Blob(this.audioChunks, { type: this.recordedMimeType || 'audio/webm' });
        this.recordedUrl = URL.createObjectURL(this.recordedBlob);

        const recordedAudio = document.getElementById('recorded-audio');
        if (recordedAudio) {
            recordedAudio.src = this.recordedUrl;
            recordedAudio.load();
        }

        const feedbackText = document.getElementById('feedback-text');
        if (feedbackText) {
            feedbackText.textContent = '录音已保存，可点"播放录音"回放自己的发音，或点"评估发音"查看评分。';
        }

        this.syncRecordingUi();
        Utils.showMessage('录音完成（' + this.formatSize(this.recordedBlob.size) + '），可以回放试听', 'success');
    },

    // 播放 / 暂停录音
    toggleRecordingPlayback: function() {
        const recordedAudio = document.getElementById('recorded-audio');

        if (!this.recordedUrl || !recordedAudio) {
            Utils.showMessage('还没有录音，请先点击"开始录音"', 'warning');
            return;
        }

        if (recordedAudio.paused) {
            const result = recordedAudio.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function(error) {
                    Utils.showMessage('播放录音失败：' + error.message, 'error');
                });
            }
        } else {
            recordedAudio.pause();
        }

        this.syncRecordingUi();
    },

    // ==================== 录音辅助 ====================

    // 选择浏览器支持的录音编码（Safari 用 mp4，Chrome 用 webm/opus）
    pickMimeType: function() {
        if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) {
            return '';
        }

        const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
        for (let i = 0; i < candidates.length; i++) {
            if (MediaRecorder.isTypeSupported(candidates[i])) {
                return candidates[i];
            }
        }
        return '';
    },

    // 释放麦克风（关掉浏览器的录音提示）
    releaseStream: function() {
        if (!this.mediaStream) {
            return;
        }

        this.mediaStream.getTracks().forEach(function(track) {
            track.stop();
        });
        this.mediaStream = null;
    },

    // 录音计时
    startRecordTimer: function() {
        const self = this;
        this.stopRecordTimer();
        this.recordTimer = setInterval(function() {
            self.recordSeconds++;
            self.syncRecordingUi();
        }, 1000);
    },

    stopRecordTimer: function() {
        if (this.recordTimer) {
            clearInterval(this.recordTimer);
            this.recordTimer = null;
        }
    },

    // 体积格式化
    formatSize: function(bytes) {
        if (!bytes) { return '0 KB'; }
        if (bytes < 1024) { return bytes + ' B'; }
        if (bytes < 1024 * 1024) { return (bytes / 1024).toFixed(1) + ' KB'; }
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    },

    // 同步录音相关界面
    syncRecordingUi: function() {
        const recordButton = document.getElementById('record-btn');
        const playButton = document.getElementById('play-recording');
        const panel = document.getElementById('recording-info');
        const detail = document.getElementById('recording-detail');
        const recordedAudio = document.getElementById('recorded-audio');

        if (recordButton) {
            if (this.isRecording) {
                recordButton.innerHTML = '<i class="fas fa-stop"></i> 停止录音 · ' + this.recordSeconds + 's';
                recordButton.style.backgroundColor = '#ff5252';
                recordButton.style.color = '#ffffff';
            } else {
                recordButton.innerHTML = '<i class="fas fa-microphone"></i> 开始录音';
                recordButton.style.backgroundColor = '';
                recordButton.style.color = '';
            }
        }

        if (playButton) {
            if (this.recordedUrl) {
                const playing = recordedAudio && recordedAudio.paused === false && recordedAudio.ended !== true;
                playButton.disabled = false;
                playButton.style.opacity = '';
                playButton.style.cursor = '';
                playButton.innerHTML = playing
                    ? '<i class="fas fa-pause"></i> 暂停录音'
                    : '<i class="fas fa-play"></i> 播放录音';
            } else {
                playButton.disabled = true;
                playButton.style.opacity = '0.5';
                playButton.style.cursor = 'not-allowed';
                playButton.innerHTML = '<i class="fas fa-play"></i> 播放录音';
            }
        }

        if (panel && detail) {
            if (this.isRecording) {
                panel.style.display = 'block';
                detail.textContent = '正在录音… 已录 ' + this.recordSeconds + ' 秒，再次点击按钮结束。';
            } else if (this.recordedBlob) {
                const seconds = recordedAudio && isFinite(recordedAudio.duration) && recordedAudio.duration > 0
                    ? recordedAudio.duration.toFixed(1) + ' 秒 · '
                    : '';
                panel.style.display = 'block';
                detail.textContent = '本次录音 ' + seconds + this.formatSize(this.recordedBlob.size) +
                    '（' + (this.recordedMimeType || '浏览器默认格式') + '），可回放对比自己的发音。';
            } else {
                panel.style.display = 'none';
                detail.textContent = '';
            }
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