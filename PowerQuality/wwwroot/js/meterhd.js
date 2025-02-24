
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
                tablename:"meterhd"
            },
            success: function (response) {
                var result = eval("" + response + "");
                tbody.innerHTML = result.map(event => `
                <tr>
                    <td>${formatDate(event.RecTime)}</td>
                    <td>${event.THDVa}</td>
                    <td>${event.THDVb}</td>
                    <td>${event.THDVc}</td>
                    <td>${event.THDIa}</td>
                    <td>${event.THDIb}</td>
                    <td>${event.THDIc}</td>
                    <td>${event.THDIc}</td>
                     <td><a href="#" onclick="showEventDetail(${event.MeterID}, '${event.RecTime}', '${event.AlarmTypeName}', '${event.MeterName}', '${event.Contents}')">查看详情</a></td>
                </tr>
                `).join('');
            },
            error: function () {
            }
        });
    } catch (error) {
    }
}

// 显示事件详情
function showEventDetail(meterid, rectime, typename, metername, contents) {
    const modal = document.getElementById('eventModal');
    modal.style.display = 'block';
    try {
        $.ajax({
            type: "get",
            cache: false,
            url: "/Home/GetWaveformData",
            data: {
                meterId: meterid,
                RecTime: rectime,
                type: typename
            },
            success: function (response) {
                var result = eval("" + response + "");
                initChartsEventDetail();
                const waveformChart = echarts.init(document.getElementById('eventWaveform'));
                waveformChart.setOption({ xAxis: { data: result.map(item => formatShortDate(item.RecTime)) } });
                if (typename == "电流越限") {
                    waveformChart.setOption({ title: { text: metername + "_电流_波形图" } });
                    waveformChart.setOption({ legend: { data: ['Ia', 'Ib', 'Ic'] } });
                    waveformChart.setOption({
                        series: [
                            {
                                name: 'Ia',
                                type: 'line',
                                data: result.map(item => item.Ia),
                                smooth: true
                            },
                            {
                                name: 'Ib',
                                type: 'line',
                                data: result.map(item => item.Ib),
                                smooth: true
                            },
                            {
                                name: 'Ic',
                                type: 'line',
                                data: result.map(item => item.Ic),
                                smooth: true
                            }
                        ]
                    });
                } else if (typename == "频率越限") {
                    waveformChart.setOption({ title: { text: metername + "_频率_波形图" } });
                    waveformChart.setOption({ legend: { data: ['F'] } });
                    waveformChart.setOption({
                        series: [
                            {
                                name: 'F',
                                type: 'line',
                                data: result.map(item => item.F),
                                smooth: true
                            }
                        ]
                    });
                } else if (typename == "骤升骤降") {
                    waveformChart.setOption({ title: { text: metername + "_电压_波形图" } });
                    waveformChart.setOption({ legend: { data: ['Va', 'Vb', 'Vc'] } });
                    waveformChart.setOption({
                        series: [
                            {
                                name: 'Va',
                                type: 'line',
                                data: result.map(item => item.Va),
                                smooth: true
                            },
                            {
                                name: 'Vb',
                                type: 'line',
                                data: result.map(item => item.Vb),
                                smooth: true
                            },
                            {
                                name: 'Vc',
                                type: 'line',
                                data: result.map(item => item.Vc),
                                smooth: true
                            }
                        ]
                    });
                } else {
                    waveformChart.setOption({ title: { text: metername + "_功率因数_波形图" } });
                    waveformChart.setOption({ legend: { data: ['PFa', 'PFb', 'PFc'] } });
                    waveformChart.setOption({
                        series: [
                            {
                                name: 'PFa',
                                type: 'line',
                                data: result.map(item => item.PFa),
                                smooth: true
                            },
                            {
                                name: 'PFb',
                                type: 'line',
                                data: result.map(item => item.PFb),
                                smooth: true
                            },
                            {
                                name: 'PFc',
                                type: 'line',
                                data: result.map(item => item.PFc),
                                smooth: true
                            }
                        ]
                    });
                }
            },
            error: function () {
            }
        });
    } catch (error) {
    }
    // 更新事件详情
    document.querySelector('.event-details').innerHTML = `
        <h3>事件信息</h3>
        <p>发生时间：${formatDate(rectime)}</p>
        <p>设备名称：${metername}</p>
        <p>事件内容：${contents}</p>
        <p>事件类别：${typename}</p>
        <p>严重程度：轻度</p>
    `;
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