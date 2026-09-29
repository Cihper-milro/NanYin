// 主应用程序模块
const App = {
    // 初始化应用程序
    init: function() {
        this.initNavigation();
        this.initModules();
        this.bindGlobalEvents();
    },

    // 初始化导航
    initNavigation: function() {
        // 平滑滚动到锚点
        document.querySelectorAll('nav a, .btn[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    
                    if (targetId === '') {
                        // 首页链接
                        window.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });
                    } else {
                        Utils.scrollToElement(targetId);
                    }
                    
                    // 更新活动导航项
                    document.querySelectorAll('nav a').forEach(link => {
                        link.classList.remove('active');
                    });
                    this.classList.add('active');
                }
            });
        });

        // 滚动时更新活动导航项
        window.addEventListener('scroll', Utils.debounce(() => {
            const sections = document.querySelectorAll('section[id]');
            const scrollPosition = window.scrollY + 100;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                const sectionId = section.getAttribute('id');
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    document.querySelectorAll('nav a').forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, 100));
    },

    // 初始化各功能模块
    initModules: function() {
        // 初始化方言地图（必须第一个初始化）
        DialectMap.init();
        
        // 初始化其他模块
        DialectTrainer.init();
        PoetryReciter.init();
        StoryHouse.init();
        AudioPlayer.init();
        StoryHouse.init();
        
        console.log('所有模块初始化完成');
    },

    // 绑定全局事件
    bindGlobalEvents: function() {
        // 窗口大小变化时调整地图
        window.addEventListener('resize', Utils.debounce(() => {
            if (DialectMap.map) {
                setTimeout(() => {
                    DialectMap.map.invalidateSize();
                }, 200);
            }
        }, 250));

        // 页面加载完成后的初始化
        window.addEventListener('load', () => {
            Utils.showMessage('方言文化学习平台加载完成！', 'success');
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            // Alt+1 跳转到AI方言陪练
            if (e.altKey && e.key === '1') {
                e.preventDefault();
                Utils.scrollToElement('dialect');
            }
            // Alt+2 跳转到方言地图
            else if (e.altKey && e.key === '2') {
                e.preventDefault();
                Utils.scrollToElement('map');
                // 高亮第一个方言区域作为示例
                setTimeout(() => {
                    if (DialectMap.markers && DialectMap.markers.length > 0) {
                        DialectMap.markers[0].openPopup();
                    }
                }, 500);
            }
            // Esc 隐藏地图详情
            else if (e.key === 'Escape') {
                const mapDetails = document.getElementById('map-details');
                if (mapDetails.style.display !== 'none') {
                    mapDetails.style.display = 'none';
                }
            }
        });
    }
};

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});