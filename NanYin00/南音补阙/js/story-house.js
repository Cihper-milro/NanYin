// 亲子故事屋模块
const StoryHouse = {
    // 故事数据
    stories: [
        {
            id: 1,
            title: "三只小猪",
            description: "经典童话故事，讲述三只小猪建造房屋抵御大灰狼的智慧故事。",
            duration: "5分钟",
            age: "3-8岁"
        },
        {
            id: 2,
            title: "龟兔赛跑",
            description: "伊索寓言经典，教育孩子不要骄傲，坚持就是胜利。",
            duration: "4分钟",
            age: "4-10岁"
        },
        {
            id: 3,
            title: "小马过河",
            description: "中国经典寓言，告诉孩子要勇于尝试，亲自实践才能获得真知。",
            duration: "6分钟",
            age: "5-12岁"
        },
        {
            id: 4,
            title: "狼来了",
            description: "经典诚信教育故事，教育孩子要诚实，不要说谎。",
            duration: "3分钟",
            age: "3-9岁"
        }
    ],

    // 初始化
    init: function() {
        this.bindEvents();
        this.renderStories();
    },

    // 绑定事件
    bindEvents: function() {
        const self = this;
        
        // 播放故事
        document.getElementById('play-story').addEventListener('click', function() {
            self.playStory();
        });

        // 暂停故事
        document.getElementById('pause-story').addEventListener('click', function() {
            self.pauseStory();
        });

        // 故事卡片点击事件
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('story-play-btn')) {
                const storyId = e.target.getAttribute('data-story');
                self.playStoryCard(storyId);
            }
        });
    },

    // 渲染故事列表
    renderStories: function() {
        const storiesGrid = document.querySelector('.stories-grid');
        storiesGrid.innerHTML = '';
        
        this.stories.forEach(story => {
            const storyCard = document.createElement('div');
            storyCard.className = 'story-card';
            storyCard.innerHTML = `
                <h4>${story.title}</h4>
                <p>${story.description}</p>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 0.9rem; color: #666;">
                    <span><i class="far fa-clock"></i> ${story.duration}</span>
                    <span><i class="far fa-user"></i> ${story.age}</span>
                </div>
                <button class="btn story-play-btn" data-story="${story.id}" style="padding: 8px 15px; font-size: 0.9rem;">
                    <i class="fas fa-play"></i> 播放故事
                </button>
            `;
            storiesGrid.appendChild(storyCard);
        });
    },

    // 播放故事
    playStory: function() {
        const dialect = document.getElementById('story-dialect').value;
        if (!dialect) {
            Utils.showMessage('请选择故事方言', 'warning');
            return;
        }
        
        let dialectName = "";
        switch(dialect) {
            case "cantonese": dialectName = "粤语"; break;
            case "shanghainese": dialectName = "上海话"; break;
            case "sichuanese": dialectName = "四川话"; break;
            case "mandarin": dialectName = "普通话"; break;
            default: dialectName = "方言";
        }
        
        Utils.showMessage(`开始播放${dialectName}版《三只小猪》故事`, 'info');
    },

    // 暂停故事
    pauseStory: function() {
        Utils.showMessage('故事已暂停', 'info');
    },

    // 播放故事卡片
    playStoryCard: function(storyId) {
        const story = this.stories.find(s => s.id == storyId);
        if (!story) return;
        
        const dialect = document.getElementById('story-dialect').value;
        let dialectName = "方言";
        if (dialect) {
            switch(dialect) {
                case "cantonese": dialectName = "粤语"; break;
                case "shanghainese": dialectName = "上海话"; break;
                case "sichuanese": dialectName = "四川话"; break;
                case "mandarin": dialectName = "普通话"; break;
                default: dialectName = "方言";
            }
        }
        
        Utils.showMessage(`开始播放${dialectName}版《${story.title}》故事`, 'info');
    }
};