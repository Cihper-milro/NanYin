// 方言音频播放模块 - 修复播放按钮版本
const AudioPlayer = {
    audioElement: null,
    playButton: null,
    pauseButton: null,
    dialectSelect: null,
    clipSelect: null,
    currentAudio: null,
    currentClip: null,
    isInitialized: false,
    
    // 音频数据配置（与 audios/ 目录一一对应，共 7 段录音，新增录音后需同步这里）
    audioFiles: {
        'meizhou': {
            name: '梅州话',
            description: '客家话分支，梅州地区方言，保留古汉语特点。',
            files: [
                { name: '他把橘子剥了皮，但是没吃', file: './audios/梅州话/梅州话（他把橘子剥了皮，但是没吃）.m4a' },
                { name: '他们把教室都装上了空调', file: './audios/梅州话/梅州话（他们把教室都装上了空调）.m4a' }
            ]
        },
        'danjia': {
            name: '疍家话',
            description: '水上居民方言，主要分布在广东沿海地区。',
            files: [
                { name: '河里游着好多小鱼', file: './audios/疍家话/疍家话（河里游着好多小鱼）.m4a' },
                { name: '他们把教室都装上了空调', file: './audios/疍家话/疍家话（他们把教室都装上了空调）.m4a' }
            ]
        },
        'leizhou': {
            name: '雷州话',
            description: '雷州半岛方言，属于闽语分支。',
            files: [
                { name: '你去洗碗', file: './audios/雷州话/雷州话（你去洗碗）.m4a' },
                { name: '他们把教室都装上了空调', file: './audios/雷州话/雷州话（他们把教室都装上了空调）.m4a' }
            ]
        },
        'shaoguan': {
            name: '韶关话',
            description: '粤北韶关地区方言，具有独特的地方特色。',
            files: [
                { name: '他们把教室都装上了空调', file: './audios/韶关话/广东韶关话(他们把教室都装上了空调).m4a' }
            ]
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
        this.clipSelect = document.getElementById('audio-clip');
        
        console.log('找到的元素:', {
            audioElement: !!this.audioElement,
            playButton: !!this.playButton,
            pauseButton: !!this.pauseButton,
            dialectSelect: !!this.dialectSelect,
            clipSelect: !!this.clipSelect
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

        // 音频片段选择变化事件
        if (this.clipSelect) {
            this.clipSelect.onchange = function() {
                console.log('音频片段选择变化:', this.value);
                self.onClipChange();
            };
        }

        // 播放结束后恢复播放按钮状态
        this.audioElement.onended = function() {
            self.showPlayButton();
        };

        // 初始化时按当前方言填充片段列表
        this.populateClips(this.dialectSelect.value);
        
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
        
        const clip = this.getSelectedClip(dialect);
        if (!clip) {
            Utils.showMessage('该方言暂无可播放的音频', 'warning');
            return;
        }

        this.currentAudio = audioData;
        this.currentClip = clip;
        
        if (audioData.files && audioData.files.length > 0) {
            const audioPath = clip.file;
            
            console.log('准备播放音频:', audioPath);
            
            // 重置音频元素
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
            
            // 设置音频源
            this.audioElement.src = audioPath;
            this.audioElement.load();
            
            // 显示音频信息
            this.showAudioInfo(audioData, clip);
            
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
        // 切换方言时停止当前播放，回到可播放状态
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
        }
        this.showPlayButton();

        this.currentAudio = null;
        this.currentClip = null;

        // 刷新该方言下的音频片段列表
        this.populateClips(dialect);

        if (dialect && this.audioFiles[dialect]) {
            this.showAudioInfo(this.audioFiles[dialect], this.getSelectedClip(dialect));
        }
    },

    // 按方言填充可选的音频片段
    populateClips: function(dialect) {
        if (!this.clipSelect) {
            return;
        }

        const audioData = dialect ? this.audioFiles[dialect] : null;
        if (!audioData || !audioData.files || audioData.files.length === 0) {
            this.clipSelect.innerHTML = '<option value="">' + (dialect ? '暂无可选音频' : '请先选择方言类型') + '</option>';
            this.clipSelect.value = '';
            return;
        }

        this.clipSelect.innerHTML = audioData.files.map(function(item, index) {
            return '<option value="' + index + '">' + item.name + '</option>';
        }).join('');

        // 回到第一条，避免残留上一种方言的选择
        this.clipSelect.value = '0';
    },

    // 取当前选中的音频片段，未选择时回退到第一条
    getSelectedClip: function(dialect) {
        const audioData = this.audioFiles[dialect];
        if (!audioData || !audioData.files || audioData.files.length === 0) {
            return null;
        }

        const index = this.clipSelect ? parseInt(this.clipSelect.value, 10) : 0;
        if (isNaN(index) || index < 0 || index >= audioData.files.length) {
            return audioData.files[0];
        }

        return audioData.files[index];
    },

    // 音频片段选择变化处理
    onClipChange: function() {
        const dialect = this.dialectSelect ? this.dialectSelect.value : '';
        if (!dialect) {
            return;
        }

        // 切换片段时停止当前播放
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
        }
        this.showPlayButton();

        const clip = this.getSelectedClip(dialect);
        if (clip) {
            this.currentClip = clip;
            this.showAudioInfo(this.audioFiles[dialect], clip);
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