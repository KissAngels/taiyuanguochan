// 模拟数据生成函数
function generateRandomData(min, max, count) {
    return Array.from({ length: count }, () => 
        Math.floor(Math.random() * (max - min + 1)) + min
    );
}

// 更新卡片数据
function updateCards() {
    const voltage = (Math.random() * 10 + 215).toFixed(1);
    const current = (Math.random() * 5 + 8).toFixed(1);
    const powerFactor = (Math.random() * 0.1 + 0.85).toFixed(2);
    const frequency = (Math.random() * 0.1 + 49.95).toFixed(2);

    document.querySelector('.card:nth-child(1) .value').textContent = `${voltage} V`;
    document.querySelector('.card:nth-child(2) .value').textContent = `${current} A`;
    document.querySelector('.card:nth-child(3) .value').textContent = powerFactor;
    document.querySelector('.card:nth-child(4) .value').textContent = `${frequency} Hz`;
}

// 初始化实时波形图表
const waveformChart = echarts.init(document.getElementById('waveformChart'));
const waveformOption = {
    legend: {
        data: ['A相', 'B相', 'C相'],
        top: 10,
        right: 10
    },
    grid: {
        top: 50,
        left: 50,
        right: 50,
        bottom: 50
    },
    xAxis: {
        type: 'category',
        data: Array.from({length: 100}, (_, i) => i)
    },
    yAxis: {
        type: 'value',
        name: '幅值'
    },
    series: [
        {
            name: 'A相',
            type: 'line',
            smooth: true,
            data: Array.from({length: 100}, () => Math.sin(Math.random() * Math.PI) * 220),
            itemStyle: {color: '#FF6B6B'}
        },
        {
            name: 'B相',
            type: 'line',
            smooth: true,
            data: Array.from({length: 100}, () => Math.sin(Math.random() * Math.PI) * 220),
            itemStyle: {color: '#4ECDC4'}
        },
        {
            name: 'C相',
            type: 'line',
            smooth: true,
            data: Array.from({length: 100}, () => Math.sin(Math.random() * Math.PI) * 220),
            itemStyle: {color: '#45B7D1'}
        }
    ]
};
waveformChart.setOption(waveformOption);

// 初始化谐波分析图表
const harmonicsChart = echarts.init(document.getElementById('harmonicsChart'));
const harmonicsOption = {
    legend: {
        data: ['A相谐波', 'B相谐波', 'C相谐波'],
        top: 10,
        right: 10
    },
    grid: {
        top: 50,
        left: 50,
        right: 50,
        bottom: 50
    },
    xAxis: {
        type: 'category',
        data: ['1次', '3次', '5次', '7次', '9次', '11次', '13次'],
        name: '谐波次数'
    },
    yAxis: {
        type: 'value',
        name: '含有率(%)'
    },
    series: [
        {
            name: 'A相谐波',
            type: 'bar',
            data: [100, 4.2, 3.1, 2.8, 2.1, 1.9, 1.7],
            itemStyle: {color: '#FF6B6B'}
        },
        {
            name: 'B相谐波',
            type: 'bar',
            data: [100, 4.0, 3.3, 2.9, 2.0, 1.8, 1.6],
            itemStyle: {color: '#4ECDC4'}
        },
        {
            name: 'C相谐波',
            type: 'bar',
            data: [100, 4.1, 3.2, 2.7, 2.2, 1.7, 1.5],
            itemStyle: {color: '#45B7D1'}
        }
    ]
};
harmonicsChart.setOption(harmonicsOption);

// 窗口大小改变时，重新调整图表大小
window.addEventListener('resize', () => {
    waveformChart.resize();
    harmonicsChart.resize();
});

// 更新时间显示
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    document.querySelector('.time').textContent = timeString;
}

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    // 定时更新数据
    setInterval(() => {
        updateCards();
        updateTime();
        
        waveformChart.setOption({
            series: [
                {
                    name: 'A相',
                    data: Array.from({length: 100}, () => Math.sin(Math.random() * Math.PI) * 220)
                },
                {
                    name: 'B相',
                    data: Array.from({length: 100}, () => Math.sin(Math.random() * Math.PI) * 220)
                },
                {
                    name: 'C相',
                    data: Array.from({length: 100}, () => Math.sin(Math.random() * Math.PI) * 220)
                }
            ]
        });
        
        harmonicsChart.setOption({
            series: [
                {
                    name: 'A相谐波',
                    data: [100, 4.2, 3.1, 2.8, 2.1, 1.9, 1.7]
                },
                {
                    name: 'B相谐波',
                    data: [100, 4.0, 3.3, 2.9, 2.0, 1.8, 1.6]
                },
                {
                    name: 'C相谐波',
                    data: [100, 4.1, 3.2, 2.7, 2.2, 1.7, 1.5]
                }
            ]
        });
    }, 2000);
    
    // 初始更新
    updateCards();
    updateTime();
});
