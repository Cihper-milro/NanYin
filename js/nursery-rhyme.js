// 方言童谣模块
const NurseryRhyme = {
    // 童谣音频配置（与 audios/歌谣/ 目录一一对应，新增童谣后需同步这里）
    // 目录约定：audios/歌谣/<方言类>/<童谣名>/<童谣名>.mp3，同目录下另有「童谣词.txt」
    rhymeAudios: {
        'kejia': {
            name: '客家歌谣',
            files: {
                'moonlight-starlight': './audios/歌谣/客家歌谣/月光光，星子光/月光光，星子光.mp3',
                'moonlight-four-directions': './audios/歌谣/客家歌谣/月光光，照四方/月光光，照四方.mp3'
            }
        }
    },

    // 童谣词（正文照抄各目录下的「童谣词.txt」，不改字）
    rhymeData: {
        'moonlight-starlight': {
            title: '《月光光，星子光》',
            content: '月光光，星子光。当梨熟，菊花香。城里人，搽粉香。城隍庙，好烧香。烧了香，寿年长。百过岁，响叮当。请人客，包槟榔。做生日，娶新娘。',
            description: '客家童谣。以月光、星子起兴，从当梨熟、菊花香一路唱到城里人搽粉、城隍庙烧香，再唱到长寿百岁、请客包槟榔、做生日娶新娘，把乡间的节令与喜事挨个点了一遍。'
        },
        'moonlight-four-directions': {
            title: '《月光光，照四方》',
            content: '月光光，照四方。骑白马，过莲堂。莲堂背，种韭菜。韭菜花，结亲家。亲家门口一口塘，养个鲤嘛八尺长。短个拿来煮酒食，长个卖来做学堂，做个学堂四四方，读书写字念文章。',
            description: '客家童谣。骑白马过莲堂、种韭菜结亲家，门前一口塘养出八尺长的鲤鱼，短的煮酒待客、长的卖钱办义学，一路唱到读书写字念文章，把耕读传家的心愿唱进了童谣里。'
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

    // 创建（或复用）童谣专用 audio 元素：不新增页面结构、不改动任何样式
    setupAudio: function() {
        if (this.audioElement) {
            return this.audioElement;
        }

        this.audioElement = document.getElementById('rhyme-audio');
        if (!this.audioElement) {
            this.audioElement = document.createElement('audio');
            this.audioElement.id = 'rhyme-audio';
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

        // 播放/暂停童谣（同一个按钮切换）
        const playButton = document.getElementById('play-rhyme');
        if (playButton) {
            playButton.addEventListener('click', function() {
                self.togglePlay();
            });
        }

        // 切换方言类或童谣时，先停掉正在播放的录音，避免串音
        ['rhyme-dialect', 'rhyme-select'].forEach(function(id) {
            const select = document.getElementById(id);
            if (select) {
                select.addEventListener('change', function() {
                    self.stop();
                    self.refreshPreview();
                });
            }
        });
    },

    // 播放 / 暂停切换
    togglePlay: function() {
        const dialectSelect = document.getElementById('rhyme-dialect');
        const rhymeSelect = document.getElementById('rhyme-select');
        const dialect = dialectSelect ? dialectSelect.value : '';
        const rhyme = rhymeSelect ? rhymeSelect.value : '';

        if (!dialect || !rhyme) {
            Utils.showMessage('请选择童谣方言和童谣', 'warning');
            return;
        }

        const audio = this.setupAudio();
        const src = this.getAudioPath(dialect, rhyme);
        const dialectName = this.getDialectName(dialect);
        const rhymeInfo = this.rhymeData[rhyme];

        this.renderRhyme(rhyme);

        if (!src) {
            Utils.showMessage(dialectName + '暂无' + (rhymeInfo ? rhymeInfo.title : '该童谣') + '的录音', 'warning');
            return;
        }

        // 当前这段正在播放 → 暂停
        if (this.isPlaying && this.currentPath === src) {
            audio.pause();
            Utils.showMessage('已暂停童谣', 'info');
            return;
        }

        // 换了方言或换了童谣 → 重新指定音源；同一段续播则从头开始
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
            Utils.showMessage('正在播放' + dialectName + (rhymeInfo ? rhymeInfo.title : ''), 'info');
        }).catch(function(error) {
            self.setPlaying(false);
            Utils.showMessage('童谣播放失败：' + error.message, 'error');
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
        const button = document.getElementById('play-rhyme');
        if (button) {
            button.textContent = this.isPlaying ? '暂停童谣' : '播放童谣';
        }
    },

    // 取指定方言类 + 指定童谣的音频路径
    getAudioPath: function(dialect, rhyme) {
        const data = this.rhymeAudios[dialect];
        if (!data || !data.files) {
            return '';
        }
        return data.files[rhyme] || '';
    },

    // 取方言显示名称
    getDialectName: function(dialect) {
        const data = this.rhymeAudios[dialect];
        return data ? data.name : '方言';
    },

    // 渲染童谣词（沿用古诗词吟诵模块的结构与行内样式）
    renderRhyme: function(rhymeKey) {
        const rhymeInfo = this.rhymeData[rhymeKey];
        if (!rhymeInfo) {
            return;
        }

        document.getElementById('rhyme-title').textContent = rhymeInfo.title;
        document.getElementById('rhyme-content').innerHTML = `
            <div style="margin-bottom: 15px; color: #666; font-size: 1rem;">
                ${rhymeInfo.description}
            </div>
            <div style="font-size: 1.3rem; line-height: 2;">
                ${rhymeInfo.content}
            </div>
        `;
    },

    // 选择变化时的文本预览：选全了显示童谣词，没选全恢复占位提示
    refreshPreview: function() {
        const dialectSelect = document.getElementById('rhyme-dialect');
        const rhymeSelect = document.getElementById('rhyme-select');
        const dialect = dialectSelect ? dialectSelect.value : '';
        const rhyme = rhymeSelect ? rhymeSelect.value : '';

        if (!dialect || !rhyme) {
            document.getElementById('rhyme-title').textContent = '童谣词将显示在这里';
            document.getElementById('rhyme-content').innerHTML = '';
            return;
        }

        this.renderRhyme(rhyme);
    }
};