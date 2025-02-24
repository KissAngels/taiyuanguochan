
// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
    // 设置默认时间范围
    const now = new Date();
    const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    document.getElementById('startTime').value = startTime.toISOString().slice(0, 16);
    document.getElementById('endTime').value = now.toISOString().slice(0, 16);
    updateCurrentTime();
    loadMeterList();
    // 设备列表下拉框改变事件
    const selectElement = document.getElementById('meterList');
    selectElement.addEventListener('change', function () {
        updateEventTable();
    });
});

// 更新当前时间
function updateCurrentTime() {
    const timeElement = document.getElementById('currentTime');
    const now = new Date();
    timeElement.textContent = formatDate(now);
}

//定时执行
setInterval(function () {
    updateCurrentTime();
}, 1000);

// 获取仪表列表
function loadMeterList() {
    try {
        $.ajax({
            type: "get",
            cache: false,
            url: "/Home/GetMeterinfonetList",
            success: function (response) {
                var meterList = eval("" + response + "");
                for (var i = 0; i < meterList.length; i++) {
                    var option = document.createElement("option");
                    option.text = meterList[i].MeterName;
                    option.value = meterList[i].MeterId;
                    document.getElementById("meterList").add(option);
                }
                 updateEventTable();
            },
            error: function () {
            }
        });
    } catch (error) {
    }
}

// 更新事件表格
function updateEventTable() {
    const tbody = document.querySelector('#eventTable tbody');
    try {
        $.ajax({
            type: "get",
            cache: false,
            url: "/Home/GetData",
            data: {
                meterId: $("#meterList").val(),
                startTime: $("#startTime").val(),
                endTime: $("#endTime").val(),
                tablename:"powerdegree"
            },
            success: function (response) {
                var result = eval("" + response + "");
                tbody.innerHTML = result.map(event => `
                <tr>
                    <td>${formatDate(event.RecTime)}</td>
                    <td>${event.Kwh}</td>
                    <td>${event.Kvarh}</td>
                    <td>${event.Kvah}</td>
                </tr>
                `).join('');
            },
            error: function () {
            }
        });
    } catch (error) {
    }
}

// 格式化长日期
function formatDate(datestr) {
    var date = new Date(datestr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

// 格式化短日期
function formatShortDate(datestr) {
    var date = new Date(datestr);
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    return `${minute}:${second}`;
}