var api_accept = "application/vnd.twitchtv.v5+json";
var api_client_id = "kfa2xu0cyvzcidxjcxw8thum3bd9jf";
var fav_id_arr = JSON.parse( localStorage.getItem("fav_id_arr") );

if( typeof fav_id_arr == "undefined" || fav_id_arr == null ){
    localStorage.setItem( "fav_id_arr", JSON.stringify([]) );
    $("#clipWrap").html('<div class="clipWrapMessage">설정에서 채널을 등록해 주세요</div>');
}
else if(fav_id_arr.length == 0){
    $("#clipWrap").html('<div class="clipWrapMessage">설정에서 채널을 등록해 주세요</div>');
}
else{
    getStreams();
}


$("#settingBtn").on("click", function(e){
    e.preventDefault();
    getBookmark();
    $("#overlay").show();
    $("#settingModal").show();
});

$("#overlay, #closeSettingModal").on("click", function(e){
    e.preventDefault();
    $("#overlay").hide();
    $("#settingModal").hide();
});


function getBookmark(){
    $("#favList").html('<i id="bookmarkSpinner"></i>');

    var fav_id_arr = JSON.parse( localStorage.getItem("fav_id_arr") );
    var fav_id_arr_len = fav_id_arr.length;

    if(fav_id_arr_len == 0){
        $("#favList").html('<div class="favListMessage">등록된 채널이 없습니다.<br>채널을 등록해 주세요.</div>');
        return;
    }

    $.ajax({
        url: "https://api.twitch.tv/kraken/users?id=" + fav_id_arr.join(","),
        method: "GET",
        cache: false,
        dataType: "json",
        headers: {
            "Accept": api_accept,
            "Client-ID": api_client_id
        }
    })
    .done(function(data) {
        var usersArr = data.users;
        var code = "";

        for(var i=0; i<fav_id_arr_len; i++){
            var index = usersArr.findIndex(obj => obj._id == fav_id_arr[i]);

            if(index < 0){
                continue;
            }

            var user = usersArr[index];
            code += '<div class="favStreamer w3-animate-opacity-fast">';
            code +=     '<div class="favStreamerLeft">';
            code +=         '<img src="' + user.logo + '">';
            code +=         '<a href="https://www.twitch.tv/' + user.name + '" target="_blank" title="' + user.display_name + ' (' + user.name + ')' + '" data-name="' + user.name + '">' + user.display_name + ' (' + user.name + ')' + '</a>';
            code +=     '</div>';
            code +=     '<div class="favStreamerRight">';
            code +=         '<a class="streamerDelBtn" data-id="' + user._id + '" data-display-name="' + user.display_name + '" data-name="' + user.name + '">';
            code +=             '<i class="fa fa-minus-square"></i>';
            code +=         '</a>';
            code +=     '</div>';
            code += '</div>';
        }

        $("#favList").html(code);
    })
    .fail(function(xhr) {
        $("#favList").empty();
        alert("Twitch API Error: " + xhr.responseJSON.status + " " + xhr.responseJSON.error);
    });
}


$("#regForm").on("submit", function(e) {
	e.preventDefault();

    var channelCnt = JSON.parse(localStorage.getItem("fav_id_arr")).length;
    if(channelCnt >= 100){
        alert("최대 100개의 채널까지 등록가능합니다.");
        return;
    }

    var streamerId = $("#streamerId").val()
                    .replace(/^,/, '')
                    .replace(/,$/, '');

    $.ajax({
        url: "https://api.twitch.tv/kraken/users?login=" + streamerId,
        method: "GET",
        cache: false,
        dataType: "json",
        headers: {
            "Accept": api_accept,
            "Client-ID": api_client_id
        }
    })
    .done(function(data) {
        if(data._total < 1){
            alert("입력한 채널이 존재하지 않습니다.");
            return;
        }

        var fav_id_arr = JSON.parse( localStorage.getItem("fav_id_arr") );

        if(fav_id_arr.length == 0){
            $("#favList").empty();
        }

        var usersArr = data.users;
        var usersArrLen = usersArr.length;
        var code = "";

        for(var i=0; i<usersArrLen; i++){
            var user = usersArr[i];

            if(fav_id_arr.indexOf(user._id) > -1){
                alert(user.display_name + '(' + user.name + ')' + '\ 채널은 이미 등록되어 있습니다.');
                continue;
            }

            code += '<div class="favStreamer slideDown">';
            code +=     '<div class="favStreamerLeft">';
            code +=         '<img src="' + user.logo + '">';
            code +=         '<a href="https://www.twitch.tv/' + user.name + '" target="_blank" title="' + user.display_name + ' (' + user.name + ')' + '" data-name="' + user.name + '">' + user.display_name + ' (' + user.name + ')' + '</a>';
            code +=     '</div>';
            code +=     '<div class="favStreamerRight">';
            code +=         '<a class="streamerDelBtn" data-id="' + user._id + '" data-display-name="' + user.display_name + '" data-name="' + user.name + '">';
            code +=             '<i class="fa fa-minus-square"></i>';
            code +=         '</a>';
            code +=     '</div>';
            code += '</div>';
            fav_id_arr.unshift(user._id);
        }

        $("#favList").prepend(code);
        $("#streamerId").val("");
        localStorage.setItem( "fav_id_arr", JSON.stringify(fav_id_arr) );
    })
    .fail(function(xhr) {
        alert("Twitch API Error: " + xhr.responseJSON.status + " " + xhr.responseJSON.error);
    });
});


$("#favList").on("click", ".streamerDelBtn", function(e){
    var $thisElem = $(this);
    var id = $thisElem.attr("data-id");
    var displayName = $thisElem.attr("data-display-name");
    var name = $thisElem.attr("data-name");

    if( ! confirm(displayName + "(" + name + ") 채널을 삭제하시겠습니까?") ){
        return;
    }

    var $parElem = $thisElem.parent().parent();
    $parElem.addClass("fadeOutFast");
    setTimeout(function(){
        $parElem.remove();
    }, 400);

    var fav_id_arr = JSON.parse( localStorage.getItem("fav_id_arr") );
    var index = fav_id_arr.indexOf(id);

    if(index > -1){
        fav_id_arr.splice(index, 1);
        localStorage.setItem( "fav_id_arr", JSON.stringify(fav_id_arr) );
    }
});


function getStreams() {
    $("#loadingSpinner").fadeIn(300);

    $.ajax({
        url: "https://api.twitch.tv/kraken/streams?limit=100&channel=" + fav_id_arr.join(","),
        method: "GET",
        cache: false,
        dataType: "json",
        headers: {
            "Accept": api_accept,
            "Client-ID": api_client_id
        }
    })
    .done(function(data) {
        var streamsArr = data.streams;
        var streamsArrLen = streamsArr.length;
        var code = "";

        if(streamsArrLen == 0){
            $("#clipWrap").html('<div class="clipWrapMessage">생방송 중인 채널 없음</div>');
            return;
        }

        for(var i=0; i<streamsArrLen; i++) {
            var stream = streamsArr[i];
            code += '<div class="w3-col l3 m6 w3-margin-bottom">';
            code += '<div class="w3-card">';
            code +=     '<div class="w3-display-container clipThumbnail">';
            code +=         '<a href="' + stream.channel.url + '">';
            code +=             '<img src="assets/default_thumb.gif">';
            code +=             '<img src="' + stream.preview.large.replace("640x360", "440x248") + '" class="clipThumbImg">';
            code +=         '</a>';
            code +=         '<div>';
            code +=             '시청자 ' + addComma(stream.viewers) + '<span style="padding-left:2px">명</span>';
            code +=         '</div>';
            code +=         '<a class="closeStream">';
            code +=             '<i class="fa fa-times"></i>';
            code +=         '</a>';
            code +=     '</div>';
            code +=     '<div class="w3-container clipInfo">';
            code +=         '<div class="w3-col" style="width:50px">';
            code +=             '<img class="profileImg" src="' + stream.channel.logo + '" alt="프사">';
            code +=         '</div>';
            code +=         '<div class="w3-rest">';
            code +=             '<div class="clipSubject">';
            code +=                 '<a href="' + stream.channel.url + '" title="' + checkTitle(stream.channel.status) + '">' + checkTitle(stream.channel.status) + '</a>';
            code +=             '</div>';
            code +=             '<div class="clipCategory">';
            code +=                 '<a href="https://www.twitch.tv/' + stream.channel.name + '/videos" title="' + stream.channel.display_name + ' (' + stream.channel.name + ')">' + stream.channel.display_name + ' (' + stream.channel.name + ')</a>';
            code +=             '</div>';
            code +=             '<div class="clipCategory">';
            code +=                 '<a href="https://www.twitch.tv/directory/game/' + checkCategory(stream.game) + '" title="' + checkCategory(stream.game) + '">' + checkCategory(stream.game) + '</a>';
            code +=             '</div>';
            code +=         '</div>';
            code +=     '</div>';
            code += '</div>';
            code += '</div>';
        }

        $("#clipWrap").html(code);
    })
    .fail(function(xhr) {
        alert("Twitch API Error: " + xhr.responseJSON.status + " " + xhr.responseJSON.error);
    })
    .always(function() {
        $("#loadingSpinner").fadeOut(300);
    });
}


function addComma(data_value) {
	return Number(data_value).toLocaleString('en');
}


function checkTitle(title){
    if(!title){
        title = "Untitled Broadcast";
    }
    return title;
}


function checkCategory(category){
    if(!category){
        category = "No Category";
    }
    return category;
}


$("#helpBtn").on("click", function(e){
    var msg = "";
    msg += "[ 도움말 ]\n";
    msg += "최대 100개의 채널까지 등록 가능합니다.\n";
    msg += "아이디 입력은 쉼표로 구분해서 한번에 여러개 입력 가능합니다.\n";
    msg += "ex) twitch,faker,lck\n\n";
    msg += "이 설정들은 브라우저에 저장되는 데이터로 인터넷 사용기록을 삭제하면 날아갑니다.\n";
    msg += "다른 브라우저에서 사용할때는 옆의 \"등록아이디 리스트 복사\" 버튼으로 복사한 값을 옮겨서 입력할 수 있습니다.";
    alert(msg);
});


$("#copyBtn").on("click", function(e){
    var streamerIdList = "";

    $("#favList .favStreamerLeft a").each(function(index, item) {
        streamerIdList += $(this).attr("data-name") + ",";
    });

    streamerIdList = streamerIdList.replace(/^,/, '').replace(/,$/, '');

    if(!streamerIdList){
        alert("등록된 채널이 없습니다");
        return;
    }

    var idListAreaElem = document.getElementById("idListArea");
    idListAreaElem.innerHTML = streamerIdList;
    idListAreaElem.select();
    idListAreaElem.setSelectionRange(0, 99999);

    var copied;
    try{
        copied = document.execCommand("copy");
    }catch(ex) {
        copied = false;
    }

    if(copied) {
        alert("[복사완료]\n" + streamerIdList);
    }
    else{
        alert("복사를 지원하지 않는\n브라우저 입니다.");
    }

    idListAreaElem.innerHTML = "";
});


$("#resetBtn").on("click", function(e){
    if( confirm("등록한 모든 채널이 삭제됩니다.\n정말 초기화 하시겠습니까?") ){
        $("#favList").empty();
        localStorage.setItem( "fav_id_arr", JSON.stringify([]) );
    }
});


$("#clipWrap").on("click", ".closeStream", function(e){
    $(this).parent().parent().parent().remove();
});
