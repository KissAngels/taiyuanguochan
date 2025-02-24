
// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
    // 设置默认时间范围
    const now = new Date();
    const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    document.getElementById('startTime').value = startTime.toISOString().slice(0, 16);
    document.getElementById('endTime').value = now.toISOString().slice(0, 16);
    updateCurrentTime();
    loadMeterList();
    // 初始化饼图
    initChartsBingTu();
    // 初始化曲线图
    initChartsQuXian();
    // 初始化表格数据
    updateEventTable();
    // 设备列表下拉框改变事件
    const selectElement = document.getElementById('meterList');
    selectElement.addEventListener('change', function () {
        loadTypeCount();
        loadVoltageValue();
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
    loadVoltageValue();
    updateCurrentTime();
}, 1000);

// 初始化图表-饼图
function initChartsBingTu() {
    // 事件分布统计图表
    const distributionChart = echarts.init(document.getElementById('eventDistribution'));
    const distributionOption = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'horizontal',
            bottom: 10,
            data: ['电流越限', '频率越限', '骤升骤降', '波形畸变']
        },
        series: [
            {
                name: '事件分布',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '50%'],
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    position: 'outside',
                    formatter: '{b}: {c}次',
                    fontSize: 14
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '16',
                        fontWeight: 'bold'
                    }
                }
            }
        ]
    };
    distributionChart.setOption(distributionOption);

}

// 初始化图表-曲线图
function initChartsQuXian() {
    // 闪变趋势图表
    const flickerChart = echarts.init(document.getElementById('flickerTrend'));
    const flickerOption = {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['A相电压', 'B相电压', 'C相电压']
        },
        xAxis: {
            type: 'time',
            boundaryGap: false
        },
        yAxis: {
            type: 'value',
            name: '电压单位：V'
        }
    };
    flickerChart.setOption(flickerOption);
    loadVoltageValue();
}

// 初始化图表-事件详情
function initChartsEventDetail() {
    //给波形图数据赋值
    const waveformChart = echarts.init(document.getElementById('eventWaveform'));
    const waveformOption = {
        title: {
            text: `波形图`
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
        },
        yAxis: {
            type: 'value'
        }
    };
    waveformChart.setOption(waveformOption);
}

// 更新事件表格
function updateEventTable() {
    const tbody = document.querySelector('#eventTable tbody');
    try {
        $.ajax({
            type: "get",
            cache: false,
            url: "/Home/GetAlarmLog",
            data: {
                meterId: $("#meterList").val(),
                startTime: $("#startTime").val(),
                endTime: $("#endTime").val()
            },
            success: function (response) {
                var result = eval("" + response + "");
                tbody.innerHTML = result.map(event => `
                <tr>
                    <td>${formatDate(event.RecTime)}</td>
                    <td>${event.MeterName}</td>
                    <td>${event.Contents}</td>
                    <td>${event.AlarmTypeName}</td>
                    <td><span class="severity-轻度">轻度</span></td>
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

// 导出事件记录
function exportEvents() {
    // 准备Excel数据
    const headers = ['时间', '事件类型', '相别', '持续时间', '幅值', '严重程度'];
    const data = mockEventData.map(event => [
        event.time,
        event.type,
        event.phase,
        event.duration,
        event.amplitude,
        event.severity
    ]);

    // 创建工作簿
    const wb = XLSX.utils.book_new();

    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // 设置列宽
    const colWidths = [18, 12, 8, 10, 10, 10];
    ws['!cols'] = colWidths.map(w => ({ wch: w }));

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '事件记录');

    // 生成文件名
    const fileName = `事件记录_${new Date().toLocaleDateString().replace(/\//g, '')}.xlsx`;

    // 导出Excel文件
    XLSX.writeFile(wb, fileName);
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
                initChartsEventDetail();
                const waveformChart = echarts.init(document.getElementById('eventWaveform'));
                var result = eval("" + response + "");
                waveformChart.setOption({ xAxis: { data: result.map(item => formatShortDate(item.RecTime)) } });
                waveformChart.setOption({ series: [] });
                waveformChart.setOption({ legend: [] });
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

// 关闭模态框
document.querySelector('.close').onclick = function () {
    document.getElementById('eventModal').style.display = 'none';
}

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
                loadTypeCount();
            },
            error: function () {
            }
        });
    } catch (error) {
    }
}

// 读取各类型事件数量
function loadTypeCount() {
    $("#currentOverShoot").html("");
    $("#frequencyOverShoot").html("");
    $("#steepening").html("");
    $("#waveformDisturbance").html("");
    try {
        $.ajax({
            type: "get",
            cache: false,
            url: "/Home/GetTypeCount",
            data: {
                meterId: $("#meterList").val(),
                startTime: $("#startTime").val(),
                endTime: $("#endTime").val()
            },
            success: function (response) {
                var typecount = eval("" + response + "");
                for (var i = 0; i < typecount.length; i++) {
                    var count = typecount[i].Count;
                    switch (typecount[i].Types) {
                        case 21:
                            $("#currentOverShoot").html(count);
                            break;
                        case 22:
                            $("#frequencyOverShoot").html(count);
                            break;
                        case 23:
                            $("#steepening").html(count);
                            break;
                        default:
                            $("#waveformDisturbance").html(count);
                            break;
                    }
                }
                showDistribution(typecount);
            },
            error: function () {
            }
        });
    } catch (error) {
    }
}

// 显示事件分布统计
function showDistribution(typecount) {
    try {
        var data = [];
        for (var i = 0; i < typecount.length; i++) {
            var count = typecount[i].Count;
            switch (typecount[i].Types) {
                case 21:
                    data.push({
                        value: count,
                        name: '电流越限',
                        itemStyle: { color: '#FF6B6B' }
                    });
                    break;
                case 22:
                    data.push({
                        value: count,
                        name: '频率越限',
                        itemStyle: { color: '#4ECDC4' }
                    });
                    break;
                case 23:
                    data.push({
                        value: count,
                        name: '骤升骤降',
                        itemStyle: { color: '#45B7D1' }
                    });
                    break;
                default:
                    data.push({
                        value: count,
                        name: '波形畸变',
                        itemStyle: { color: '#96CEB4' }
                    });
                    break;
            }
        };
        const distributionChart = echarts.init(document.getElementById('eventDistribution'));
        distributionChart.setOption({ series: { data: data } });
    } catch (error) { }
}

// 查询电压数值
function loadVoltageValue() {
    try {
        $.ajax({
            type: "get",
            cache: false,
            url: "/Home/GetVoltageValue",
            data: {
                meterId: $("#meterList").val(),
                startTime: $("#startTime").val(),
                endTime: $("#endTime").val()
            },
            success: function (response) {
                var data = eval("" + response + "");
                var series = [{
                    name: 'A相电压',
                    type: 'line',
                    data: data.map(item => ({
                        name: item.RecTime.toString(),
                        value: [
                            item.RecTime,
                            item.Va
                        ]
                    }))
                }, {
                    name: 'B相电压',
                    type: 'line',
                    data: data.map(item => ({
                        name: item.RecTime.toString(),
                        value: [
                            item.RecTime,
                            item.Vb
                        ]
                    }))
                }, {
                    name: 'C相电压',
                    type: 'line',
                    data: data.map(item => ({
                        name: item.RecTime.toString(),
                        value: [
                            item.RecTime,
                            item.Vc
                        ]
                    }))
                }]
                const flickerChart = echarts.init(document.getElementById('flickerTrend'));
                flickerChart.setOption({ series: series });
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