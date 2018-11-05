$(function () {
    // 自定义滚动条
    $('.content-list').mCustomScrollbar();

    var $audio = $('audio');
    var player = new Player($audio);
    var progress;
    var voiceProgress;
    var lyric;
    initProgress();


    //加载歌曲列表
    getPlayerList();
    function getPlayerList() {
        $.ajax({
            url:"./source/musiclist.json",
            dataType:"json",
            success: function (data) {
                player.musicList = data;
                //遍历数据 创建音乐
                var $musicList = $('.content-list ul');
                $.each(data, function (index,ele) {
                    var $item = crateMusicItem(index,ele);
                    $musicList.append($item);
                });
                initMusicInfo(data[0]);
                initMusicLyric(data[0]);

            },
            error: function (e) {
                console.log(e);
            }
        })
    }
    // 初始化歌曲信息
    function initMusicInfo (music) {
        var $musicImage = $('.song-info-pic img');
        var $musicName = $('.song-info-name a');
        var $musicAblum = $('.song-info-ablum a');
        var $musicSinger = $('.song-info-singer a');
        var $musicProgressName = $('.music-progress-name');
        var $musicProgressTime = $('.music-progress-time');
        var $musicBg = $('.mask-bg');
        $musicImage.attr('src', music.cover);
        $musicName.text(music.name);
        $musicSinger.text(music.singer);
        $musicAblum.text(music.album);
        $musicProgressName.text(music.name + '/' +music.singer);
        $musicProgressTime.text('00:00' + '/' + music.time);
        $musicBg.css('background',"url('"+music.cover+"')");

    }

    // 初始化歌词
    function initMusicLyric(music) {
        lyric = new Lyric(music.link_lrc);
        var $lryicContainer = $('.song-lyric');
        lyric.loadLyric(function () {
            $.each(lyric.lyrics, function (index,ele) {
                var $item = $("<li>" +ele+ "<li>");
                $lryicContainer.append($item);
            })
        });
    }
    // 初始化进度条
    function initProgress(){
        var $progressBar = $('.music-progress-bar');
        var $progressLine = $('.music-progress-line');
        var $progressDot = $('.music-progress-dot');
        progress = Progress($progressBar,$progressLine,$progressDot);
        progress.progressClick(function (value) {
            player.musicSeekTo(value);
        });
        progress.progressMove(function (value) {
            player.musicSeekTo(value);
        });

        var $voiceBar = $('.music-voice-bar');
        var $voiceLine = $('.music-voice-line');
        var $voiceDot = $('.music-voice-dot');
        voiceProgress = Progress($voiceBar,$voiceLine,$voiceDot);
        voiceProgress.progressClick(function (value) {
            player.musicVoiceSeekTo(value);

        });
        voiceProgress.progressMove(function (value) {
            player.musicVoiceSeekTo(value);
        });
    }

    // 初始化事件监听
    initEvents();
    function initEvents() {
        // 监听歌曲移入移出事件
        $('.content-list').delegate('.list-music','mouseenter',function () {
            $(this).find('.list-menu').stop().fadeIn(100);
            $(this).find('.list-time a').stop().fadeIn(100);
            $(this).find('.list-time span').stop().fadeOut(100);
        });
        $('.content-list').delegate('.list-music','mouseleave',function () {
            $(this).find('.list-menu').stop().fadeOut(100);
            $(this).find('.list-time a').stop().fadeOut(100);
            $(this).find('.list-time span').stop().fadeIn(100);
        });

        // 监听复选框
        $('.content-list').delegate('.list-check','click',function () {
            $(this).toggleClass('list-checked');
        });

        // 子菜单播放按钮监听
        var $musicPlay = $('.music-play');
        $('.content-list').delegate('.list-menu-play','click',function () {
            var $item = $(this).parents('.list-music');
            $item.get(0).index;
            $(this).toggleClass('list-menu-play2');
            $(this).parents('.list-music').siblings().find('.list-menu-play').removeClass('list-menu-play2');

            // 同步播放按钮
            if($(this).attr('class').indexOf('list-menu-play2') != -1) {
                $musicPlay.addClass('music-play2');
                // 文字高亮
                $(this).parents('.list-music').find('div').css('color','#fff');
                $(this).parents('.list-music').siblings().find('div').css('color','rgba(255,255,255,0.5)');
            }else {
                $musicPlay.removeClass('music-play2');
                $(this).parents('.list-music').find('div').css('color','rgba(255,255,255,0.5)');
            }

            // 切换序号状态
            $(this).parents('.list-music').find('.list-number').toggleClass('list-number2');
            $(this).parents('.list-music').siblings().find('.list-number').removeClass('list-number2');

            // 播放音乐
            player.playMusic($item.get(0).index, $item.get(0).music);

            // 切换歌曲信息
            initMusicInfo($item.get(0).music);
            initMusicLyric($item.get(0).music);
        });

        // 监听底部播放按钮
        $musicPlay.click(function () {
            if(player.currentIndex == -1){
                $('.list-music').eq(0).find('.list-menu-play').trigger('click');

            }else{
                $('.list-music').eq(player.currentIndex).find('.list-menu-play').trigger('click');
            }
        })
        // 上一首
        $('.music-pre').click(function () {
            $('.list-music').eq(player.preIndex()).find('.list-menu-play').trigger('click');
        })
        // 下一首
        $('.music-next').click(function () {
            $('.list-music').eq(player.nextIndex()).find('.list-menu-play').trigger('click');
        })
        // 监听删除按钮
        $('.content-list').delegate('.list-menu-del','click',function () {
            var $item = $(this).parents('.list-music');
            // 判断删除的是否正在播放
            if($item.get(0).index == player.currentIndex){
                $('.music-next').trigger('click');
            }

            $item.remove();
            player.changeMusic($item.get(0).index);

            // 重新排序
            $('.list-music').each(function (index,els) {
                els.index = index;
                $('ele').find('.list-music').text(index + 1);
            })
        })

        // 监听播放进度
        player.musicTimeUpdate(function (currentTime,duration,timeStr) {
            // 同步时间
            $('.music-progress-time').text(timeStr);
            // 同步进度条
            var value = currentTime / duration * 100;

            progress.setProgress(value);

            // 歌词同步
            var index = lyric.currentIndex(currentTime);
            var $item = $('.song-lyric li').eq(index);
            $item.addClass('cur');
            $item.siblings().removeClass('cur');

            if(index <= 1) return;
            $('.song-lyric').css({
                marginTop:((-index + 1)* 30)
            });

        });
        // 监听声音按钮
        $('.music-voice-icon').click(function () {
            $(this).toggleClass('music-voice-icon2');
            // 声音切换
            if($(this).attr('class').indexOf('music-voice-icon2') != -1){
                player.musicVoiceSeekTo(0);
            }else{
                player.musicVoiceSeekTo(1);
            }
        })

    }


    // 定义一个方法创建一条音乐
    function crateMusicItem(index,music) {
        var $item = $('<li class="list-music">\n' +
            '                            <div class="list-check"><i></i></div>\n' +
            '                            <div class="list-number">'+(index+1)+'</div>\n' +
            '                            <div class="list-name">'+music.name+'\n' +
            '                                <div class="list-menu">\n' +
            '                                    <a href="javascript:;" title="播放" class="list-menu-play"></a>\n' +
            '                                    <a href="javascript:;" title="添加"></a>\n' +
            '                                    <a href="javascript:;" title="下载"></a>\n' +
            '                                    <a href="javascript:;" title="分享"></a>\n' +
            '                                </div>\n' +
            '                            </div>\n' +
            '                            <div class="list-singer">'+music.singer+'</div>\n' +
            '                            <div class="list-time">\n' +
            '                                <span>'+music.time+'</span>\n' +
            '                                <a href="javascript:;" class="list-menu-del" title="删除"></a>\n' +
            '                            </div>\n' +
            '                        </li>');
        $item.get(0).index = index;
        $item.get(0).music = music;
        return $item;
    }


})
