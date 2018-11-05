(function (window) {
    function Progress($progressBar,$progressLine,$progressDot) {
        return new Progress.prototype.init($progressBar,$progressLine,$progressDot);
    }
    Progress.prototype = {
        constructor:Progress,
        init:function ($progressBar,$progressLine,$progressDot) {
            this.$progressBar = $progressBar;
            this.$progressLine = $progressLine;
            this.$progressDot = $progressDot;
        },
        isMove:false,

        // 进度条点击位移
        progressClick:function (callBack) {
            var $this = this; //this=progress
            this.$progressBar.click(function (event) {
                var normalLeft = $(this).offset().left;
                var eventLeft = event.pageX;
                // 设置前景宽度
                $this.$progressLine.css('width', eventLeft - normalLeft);
                $this.$progressDot.css('left', eventLeft - normalLeft);

                // 计算进度条比例
                var value = (eventLeft - normalLeft) / $(this).width();
                callBack(value);

            });
        },
        
        progressMove:function (callBack) {
            var $this = this;
            var barWidth = this.$progressBar.width();
            // 监听鼠标按下
            this.$progressBar.mousedown(function () {
                $this.isMove = true;
                var normalLeft = $(this).offset().left;

                // 监听鼠标移动
                $(document).mousemove(function () {
                    var eventLeft = event.pageX;
                    var offset = eventLeft - normalLeft;
                    if(offset >= 0 && offset <= barWidth){
                        // 设置前景宽度
                        $this.$progressLine.css('width', eventLeft - normalLeft);
                        $this.$progressDot.css('left', eventLeft - normalLeft);
                    };

                    // 计算进度条比例
                    var value = (eventLeft - normalLeft) / $(this).width();
                    callBack(value);
                });
            });
            // 监听鼠标抬起
            $(document).mouseup(function () {
                $(document).off('mousemove');
                $this.isMove = false;

            })

        },

        setProgress:function (value) {
            if(this.isMove) return;
            if(value < 0 || value > 100) return;

            this.$progressLine.css({
                width: value + '%'
            });
            this.$progressDot.css({
                left: value + '%'
            });
            return value;
        },

    };

    Progress.prototype.init.prototype = Progress.prototype;
    window.Progress = Progress;
})(window);