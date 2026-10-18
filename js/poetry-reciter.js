// 古诗词吟诵模块
const PoetryReciter = {
    // 吟诵音频配置（与 audios/ 目录一一对应，新增录音后需同步这里）
    // 目前 云南话 / 安徽话 / 河南话 / 粤语 各有一段《静夜思》和一段《春晓》，
    // 客家话有「灯塔话」「李田话」两个念法人，各占一个条目，方便同一首诗对比着听
    recitationAudios: {
        'yunnan': {
            name: '云南话',
            files: {
                'quiet-night-thought': './audios/云南话/云南话1《静夜思》.m4a',
                'spring-morning': './audios/云南话/云南话1《春晓》.m4a'
            }
        },
        'anhui': {
            name: '安徽话',
            files: {
                'quiet-night-thought': './audios/安徽话/静夜思安徽话.mp3',
                'spring-morning': './audios/安徽话/春晓安徽话.mp3'
            }
        },
        'henan': {
            name: '河南话',
            files: {
                'quiet-night-thought': './audios/河南话/静夜思河南话.m4a',
                'spring-morning': './audios/河南话/春晓河南话.m4a'
            }
        },
        'cantonese': {
            name: '粤语',
            files: {
                'quiet-night-thought': './audios/粤语/静夜思 粤语.m4a',
                'spring-morning': './audios/粤语/春晓 粤语.m4a'
            }
        },
        'kejia-dengta': {
            name: '客家话（灯塔话）',
            files: {
                'quiet-night-thought': './audios/客家话/静夜思 灯塔话.m4a',
                'spring-morning': './audios/客家话/春晓 灯塔话.m4a'
            }
        },
        'kejia-litian': {
            name: '客家话（李田话）',
            files: {
                'quiet-night-thought': './audios/客家话/静夜思 李田话.m4a',
                'spring-morning': './audios/客家话/春晓 李田话.m4a'
            }
        }
    },

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

    // 播放器状态
    audioElement: null,
    currentPath: '',
    isPlaying: false,

    // 初始化
    init: function() {
        this.setupAudio();
        this.bindEvents();
    },

    // 创建（或复用）吟诵专用 audio 元素：不新增页面结构、不改动任何样式
    setupAudio: function() {
        if (this.audioElement) {
            return this.audioElement;
        }

        this.audioElement = document.getElementById('poetry-audio');
        if (!this.audioElement) {
            this.audioElement = document.createElement('audio');
            this.audioElement.id = 'poetry-audio';
            this.audioElement.preload = 'none';
            this.audioElement.style.display = 'none';
            document.body.appendChild(this.audioElement);
        }

        const self = this;
        this.audioElement.addEventListener('play', function() {
            self.setPlaying(true);
        });
        this.audioElement.addEventListener('pause', function() {
            self.setPlaying(false);
        });
        this.audioElement.addEventListener('ended', function() {
            self.setPlaying(false);
        });

        return this.audioElement;
    },

    // 绑定事件
    bindEvents: function() {
        const self = this;

        // 播放/暂停吟诵（同一个按钮切换）
        const playButton = document.getElementById('play-poetry');
        if (playButton) {
            playButton.addEventListener('click', function() {
                self.togglePlay();
            });
        }

        // 切换吟诵方言或古诗词时，先停掉正在播放的录音，避免声音串台
        ['poetry-dialect', 'poetry-select'].forEach(function(id) {
            const select = document.getElementById(id);
            if (select) {
                select.addEventListener('change', function() {
                    self.stop();
                    self.refreshPreview();
                });
            }
        });

        // 慢速播放
        const slowButton = document.getElementById('slow-play');
        if (slowButton) {
            slowButton.addEventListener('click', function() {
                self.playSlowRecitation();
            });
        }

        // 跟读模式
        const followButton = document.getElementById('follow-read');
        if (followButton) {
            followButton.addEventListener('click', function() {
                self.followReadMode();
            });
        }
    },

    // 播放 / 暂停切换
    togglePlay: function() {
        const dialectSelect = document.getElementById('poetry-dialect');
        const poetrySelect = document.getElementById('poetry-select');
        const dialect = dialectSelect ? dialectSelect.value : '';
        const poetry = poetrySelect ? poetrySelect.value : '';

        if (!dialect || !poetry) {
            Utils.showMessage('请选择吟诵方言和古诗词', 'warning');
            return;
        }

        const audio = this.setupAudio();
        const src = this.getAudioPath(dialect, poetry);
        const dialectName = this.getDialectName(dialect);
        const poetryInfo = this.poetryData[poetry];

        this.renderPoetry(poetry);

        if (!src) {
            Utils.showMessage(dialectName + '暂无' + (poetryInfo ? poetryInfo.title : '该诗') + '的吟诵录音', 'warning');
            return;
        }

        // 当前这段正在播放 → 暂停
        if (this.isPlaying && this.currentPath === src) {
            audio.pause();
            Utils.showMessage('已暂停吟诵', 'info');
            return;
        }

        // 换了方言或换了诗 → 重新指定音源；同一段续播则从头开始
        if (this.currentPath !== src) {
            audio.pause();
            audio.src = src;
            this.currentPath = src;
            audio.load();
        } else {
            audio.currentTime = 0;
        }

        const self = this;
        audio.play().then(function() {
            Utils.showMessage('正在用' + dialectName + '吟诵' + (poetryInfo ? poetryInfo.title : ''), 'info');
        }).catch(function(error) {
            self.setPlaying(false);
            Utils.showMessage('吟诵播放失败：' + error.message, 'error');
        });
    },

    // 停止播放并复位
    stop: function() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
        }
        this.currentPath = '';
        this.setPlaying(false);
    },

    // 同步按钮文案（样式类不变，仅切换文字）
    setPlaying: function(flag) {
        this.isPlaying = !!flag;
        const button = document.getElementById('play-poetry');
        if (button) {
            button.textContent = this.isPlaying ? '暂停吟诵' : '播放吟诵';
        }
    },

    // 取指定方言 + 指定诗词的音频路径
    getAudioPath: function(dialect, poetry) {
        const data = this.recitationAudios[dialect];
        if (!data || !data.files) {
            return '';
        }
        return data.files[poetry] || '';
    },

    // 取方言显示名称
    getDialectName: function(dialect) {
        const data = this.recitationAudios[dialect];
        return data ? data.name : '方言';
    },

    // 渲染诗词正文（沿用原有结构与行内样式）
    renderPoetry: function(poetryKey) {
        const poetryInfo = this.poetryData[poetryKey];
        if (!poetryInfo) {
            return;
        }

        document.getElementById('poetry-title').textContent = poetryInfo.title;
        document.getElementById('poetry-content').innerHTML = `
            <div style="margin-bottom: 15px; color: #666; font-size: 1rem;">
                ${poetryInfo.description}
            </div>
            <div style="font-size: 1.3rem; line-height: 2;">
                ${poetryInfo.content}
            </div>
        `;
    },

    // 选择变化时的文本预览：选全了显示诗词，没选全恢复占位提示
    refreshPreview: function() {
        const dialectSelect = document.getElementById('poetry-dialect');
        const poetrySelect = document.getElementById('poetry-select');
        const dialect = dialectSelect ? dialectSelect.value : '';
        const poetry = poetrySelect ? poetrySelect.value : '';

        if (!dialect || !poetry) {
            document.getElementById('poetry-title').textContent = '古诗词内容将显示在这里';
            document.getElementById('poetry-content').innerHTML = '';
            return;
        }

        this.renderPoetry(poetry);
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
