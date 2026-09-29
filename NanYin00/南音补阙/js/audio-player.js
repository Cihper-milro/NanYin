// 方言音频播放模块 - 修复播放按钮版本
const AudioPlayer = {
    audioElement: null,
    playButton: null,
    pauseButton: null,
    dialectSelect: null,
    currentAudio: null,
    isInitialized: false,
    
    // 音频数据配置
    audioFiles: {
        'meizhou': {
            name: '梅州话',
            files: [
                { name: '他们把教室都装上了空调', file: './audios/梅州话/梅州话（他们把教室都装上了空调）.m4a' }
            ],
            description: '客家话分支，梅州地区方言，保留古汉语特点。'
        },
        'danjia': {
            name: '疍家话',
            files: [
                { name: '他们把教室都装上了空调', file: './audios/疍家话/疍家话（他们把教室都装上了空调）.m4a' }
            ],
            description: '水上居民方言，主要分布在广东沿海地区。'
        },
        'leizhou': {
            name: '雷州话',
            files: [
                { name: '他们把教室都装上了空调', file: './audios/雷州话/雷州话（他们把教室都装上了空调）.m4a' }
            ],
            description: '雷州半岛方言，属于闽语分支。'
        },
        'shaoguan': {
            name: '韶关话',
            files: [
                { name: '他们把教室都装上了空调', file: './audios/广东韶关话(他们把教室都装上了空调).m4a' }
            ],
            description: '粤北韶关地区方言，具有独特的地方特色。'
        }
    },

    // 初始化音频播放器
    init: function() {
        if (this.isInitialized) {
            console.log('音频播放器已经初始化，跳过');
            return;
        }
        
        console.log('开始初始化音频播放器...');
        
        // 立即尝试初始化
        this.tryInitialize();
    },

    // 尝试初始化
    tryInitialize: function() {
        this.audioElement = document.getElementById('dialect-audio');
        this.playButton = document.getElementById('play-audio');
        this.pauseButton = document.getElementById('pause-audio');
        this.dialectSelect = document.getElementById('audio-dialect');
        
        console.log('找到的元素:', {
            audioElement: !!this.audioElement,
            playButton: !!this.playButton,
            pauseButton: !!this.pauseButton,
            dialectSelect: !!this.dialectSelect
        });
        
        if (!this.audioElement || !this.playButton || !this.pauseButton || !this.dialectSelect) {
            console.log('音频播放器元素未找到，将在500ms后重试');
            setTimeout(() => {
                this.tryInitialize();
            }, 500);
            return;
        }
        
        this.bindEvents();
        this.isInitialized = true;
        console.log('音频播放器初始化完成，播放按钮已绑定事件');
        
        // 测试播放按钮
        console.log('播放按钮状态:', this.playButton);
        console.log('播放按钮点击事件:', this.playButton.onclick);
    },

    // 绑定事件
    bindEvents: function() {
        const self = this;
        
        // 播放按钮点击事件 - 使用更可靠的方式
        this.playButton.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('播放按钮被点击，开始播放音频');
            self.playSelectedAudio();
        };
        
        // 暂停按钮点击事件
        this.pauseButton.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            self.pauseAudio();
        };
        
        // 方言选择变化事件
        this.dialectSelect.onchange = function() {
            console.log('方言选择变化:', this.value);
            self.onDialectChange(this.value);
        };
        
        console.log('所有事件绑定完成');
    },

    // 播放选中的音频
    playSelectedAudio: function() {
        console.log('开始播放音频流程...');
        
        const dialect = this.dialectSelect.value;
        console.log('选择的方言:', dialect);
        
        if (!dialect) {
            console.warn('未选择方言类型');
            Utils.showMessage('请先选择方言类型', 'warning');
            return;
        }
        
        const audioData = this.audioFiles[dialect];
        if (!audioData) {
            console.error('方言数据不存在:', dialect);
            Utils.showMessage('该方言的音频文件不存在', 'error');
            return;
        }
        
        this.currentAudio = audioData;
        
        if (audioData.files && audioData.files.length > 0) {
            const firstAudio = audioData.files[0];
            const audioPath = firstAudio.file;
            
            console.log('准备播放音频:', audioPath);
            
            // 重置音频元素
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
            
            // 设置音频源
            this.audioElement.src = audioPath;
            
            // 显示音频信息
            this.showAudioInfo(audioData, firstAudio);
            
            // 直接播放，不使用事件监听
            const self = this;
            setTimeout(() => {
                console.log('开始播放音频...');
                self.audioElement.play().then(() => {
                    console.log('音频播放成功');
                    self.showPauseButton();
                }).catch(error => {
                    console.error('音频播放失败:', error);
                    Utils.showMessage('音频播放失败: ' + error.message, 'error');
                });
            }, 100);
        }
    },

    // 暂停音频
    pauseAudio: function() {
        this.audioElement.pause();
        this.showPlayButton();
    },

    // 方言选择变化处理
    onDialectChange: function(dialect) {
        if (dialect && this.currentAudio && this.currentAudio !== this.audioFiles[dialect]) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
            this.showPlayButton();
        }
    },

    // 显示播放按钮
    showPlayButton: function() {
        this.playButton.style.display = 'inline-block';
        this.pauseButton.style.display = 'none';
    },

    // 显示暂停按钮
    showPauseButton: function() {
        this.playButton.style.display = 'none';
        this.pauseButton.style.display = 'inline-block';
    },

    // 显示音频信息
    showAudioInfo: function(audioData, currentFile) {
        const infoElement = document.getElementById('audio-info');
        const nameElement = document.getElementById('current-audio-name');
        const descElement = document.getElementById('audio-description');
        
        if (infoElement && nameElement && descElement) {
            if (currentFile) {
                nameElement.textContent = `${audioData.name} - ${currentFile.name}`;
            } else {
                nameElement.textContent = audioData.name;
            }
            descElement.textContent = audioData.description;
            infoElement.style.display = 'block';
        }
    }
};