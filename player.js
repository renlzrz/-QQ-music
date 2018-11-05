(function (window) {
    function Player($audio) {
        return new Player.prototype.init($audio);
    }
    Player.prototype = {
        constructor:Player,
        musicList:[],
        init:function ($audio) {
            this.$audio = $audio;
            this.audio = $audio.get(0);
        },
        currentIndex: -1,
        playMusic: function (index,music) {
            // 判断是否同一首音乐
            if(this.currentIndex == index){
                if(this.audio.paused){
                    this.audio.play();
                }else {
                    this.audio.pause();
                }
            }else {
                this.$audio.attr('src', music.link_url);
                this.audio.play();
                this.currentIndex = index;
            }
        },
        preIndex: function () {
            var index = this.currentIndex - 1;
            if(index < 0){
                index = this.musicList.length - 1;
            }
            return index
        },
        nextIndex: function () {
            var index = this.currentIndex + 1;
            if(index >this.musicList.length - 1){
                index = 0;
            }
            return index
        },
        // 删除对应音乐
        changeMusic: function (index) {
            this.musicList.splice(index,1);
            if(index < this.currentIndex){
                this.currentIndex = this.currentIndex -1;
            }
        },
        getMusicDuration: function () {
            return this.audio.duration;
        },
        getMusicCurrenTime: function () {
            return this.audio.currentTime;
        },
        // 监听播放进度
        musicTimeUpdate:function (callBack) {
            var $this = this;
            this.$audio.on('timeupdate',function () {
                var duration = $this.audio.duration;
                // 获取当前时间
                var currentTime = $this.audio.currentTime;
                var timeStr = $this.formatDate(currentTime,duration);
                callBack(currentTime,duration,timeStr);

            });
        },
        // 定义一个格式化时间
        formatDate: function (currentTime,duration) {
                var endMin = parseInt(duration / 60);
                var endSec = parseInt(duration % 60);
                if(endMin < 10){
                    endMin = '0' + endMin;
                }
                if(endSec < 10){
                    endSec = '0' + endSec;
                }

                var startMin = parseInt(currentTime / 60);
                var startSec = parseInt(currentTime % 60);
                if(startMin < 10){
                    startMin = '0' + startMin;
                }
                if(startSec < 10){
                    startSec = '0' + startSec;
                }
                return startMin+ ':' +startSec+ '/' +endMin+ ':' +endSec;

        },

        musicSeekTo: function (value) {
            this.audio.currentTime = this.audio.duration * value;
        },
        musicVoiceSeekTo:function (value) {
            this.audio.volume = value;
        }
        


    };
    Player.prototype.init.prototype = Player.prototype;
    window.Player = Player;
})(window);