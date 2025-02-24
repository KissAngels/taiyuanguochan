// 时间显示更新
function updateTime() {
    const timeElement = document.getElementById('currentTime');
    timeElement.textContent = new Date().toLocaleString();
}
setInterval(updateTime, 1000);
updateTime();

// 电流数据模拟器
class CurrentDataSimulator {
    constructor() {
        this.baseCurrent = 10;
        this.historicalData = {
            A: this.generateInitialData(),
            B: this.generateInitialData(),
            C: this.generateInitialData()
        };
        this.waveformPhase = 0;
    }

    generateInitialData() {
        const data = [];
        const now = new Date();
        for (let i = 0; i < 100; i++) {
            data.push([
                new Date(now - (100 - i) * 1000),
                this.baseCurrent + (Math.random() - 0.5)
            ]);
        }
        return data;
    }

    generateCurrentData() {
        return {
            A: this.baseCurrent + (Math.random() - 0.5),
            B: this.baseCurrent + (Math.random() - 0.5),
            C: this.baseCurrent + (Math.random() - 0.5)
        };
    }

    generateWaveformData() {
        const points = {
            A: [], B: [], C: []
        };
        
        const samplePoints = 200;
        for (let i = 0; i < samplePoints; i++) {
            const x = i / samplePoints * 2 * Math.PI;
            const noise = 0.02;
            
            // 电流波形相对电压滞后30度(π/6)
            points.A.push([x, this.baseCurrent * Math.sqrt(2) * 
                Math.sin(x + this.waveformPhase - Math.PI/6) * 
                (1 + (Math.random() - 0.5) * noise)]);
            points.B.push([x, this.baseCurrent * Math.sqrt(2) * 
                Math.sin(x + this.waveformPhase - Math.PI/6 - (2 * Math.PI / 3)) * 
                (1 + (Math.random() - 0.5) * noise)]);
            points.C.push([x, this.baseCurrent * Math.sqrt(2) * 
                Math.sin(x + this.waveformPhase - Math.PI/6 - (4 * Math.PI / 3)) * 
                (1 + (Math.random() - 0.5) * noise)]);
        }
        
        this.waveformPhase += 0.1;
        if (this.waveformPhase >= 2 * Math.PI) {
            this.waveformPhase = 0;
        }
        
        return points;
    }

    generateHarmonicsData() {
        return {
            A: [100, ...Array(4).fill(0).map(() => Math.random() * 2)],
            B: [100, ...Array(4).fill(0).map(() => Math.random() * 2)],
            C: [100, ...Array(4).fill(0).map(() => Math.random() * 2)]
        };
    }

    updateHistoricalData(newData) {
        const now = new Date();
        Object.keys(this.historicalData).forEach(phase => {
            this.historicalData[phase].push([now, newData[phase]]);
            if (this.historicalData[phase].length > 100) {
                this.historicalData[phase].shift();
            }
        });
    }
}

// 初始化图表
function initCharts() {
    const currentWaveform = echarts.init(document.getElementById('currentWaveform'));
    const currentTrend = echarts.init(document.getElementById('currentTrend'));
    const currentHarmonics = echarts.init(document.getElementById('currentHarmonics'));

    currentWaveform.setOption({
        tooltip: { trigger: 'axis' },
        legend: { 
            data: ['A相', 'B相', 'C相'],
            selectedMode: false
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: { 
            type: 'value',
            name: '相位(rad)',
            min: 0,
            max: 2 * Math.PI,
            axisLabel: {
                formatter: function(value) {
                    return (value / Math.PI).toFixed(1) + 'π';
                }
            }
        },
        yAxis: { 
            type: 'value',
            name: '电流(A)',
            min: -20,
            max: 20,
            interval: 10
        },
        series: [
            {
                name: 'A相',
                type: 'line',
                smooth: true,
                symbol: 'none',
                lineStyle: { width: 2 },
                itemStyle: { color: '#FF4500' }
            },
            {
                name: 'B相',
                type: 'line',
                smooth: true,
                symbol: 'none',
                lineStyle: { width: 2 },
                itemStyle: { color: '#4169E1' }
            },
            {
                name: 'C相',
                type: 'line',
                smooth: true,
                symbol: 'none',
                lineStyle: { width: 2 },
                itemStyle: { color: '#32CD32' }
            }
        ]
    });

    // 趋势图配置
    currentTrend.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['A相', 'B相', 'C相'] },
        xAxis: { type: 'time' },
        yAxis: { type: 'value', name: '电流(A)' },
        series: [
            { name: 'A相', type: 'line', data: [] },
            { name: 'B相', type: 'line', data: [] },
            { name: 'C相', type: 'line', data: [] }
        ]
    });

    // 谐波图配置
    currentHarmonics.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['A相', 'B相', 'C相'] },
        xAxis: { type: 'category', data: ['基波', '2次', '3次', '4次', '5次'] },
        yAxis: { type: 'value', name: '含量(%)' },
        series: [
            { name: 'A相', type: 'bar', data: [] },
            { name: 'B相', type: 'bar', data: [] },
            { name: 'C相', type: 'bar', data: [] }
        ]
    });

    window.addEventListener('resize', function() {
        currentWaveform.resize();
        currentTrend.resize();
        currentHarmonics.resize();
    });

    return { currentWaveform, currentTrend, currentHarmonics };
}

// 更新显示数据
function updateDisplayData(simulator) {
    const currentData = simulator.generateCurrentData();
    
    // 更新卡片数据
    Object.keys(currentData).forEach(phase => {
        const value = currentData[phase].toFixed(1);
        document.querySelector(`.current-summary .card:nth-child(${phase === 'A' ? 1 : phase === 'B' ? 2 : 3}) .value`)
            .textContent = `${value} A`;
    });

    // 计算并更新三相不平衡度
    const values = Object.values(currentData);
    const avg = values.reduce((a, b) => a + b) / 3;
    const unbalance = Math.max(...values.map(v => Math.abs(v - avg) / avg)) * 100;
    document.querySelector('.current-summary .card:nth-child(4) .value').textContent = `${unbalance.toFixed(2)}%`;

    simulator.updateHistoricalData(currentData);
    updateCharts(simulator);
}

// 更新图表
function updateCharts(simulator) {
    const charts = echarts.getInstanceByDom(document.getElementById('currentWaveform'));
    const currentTrend = echarts.getInstanceByDom(document.getElementById('currentTrend'));
    const currentHarmonics = echarts.getInstanceByDom(document.getElementById('currentHarmonics'));

    // 更新波形图
    const waveformData = simulator.generateWaveformData();
    charts.setOption({
        animation: false,
        series: [
            { data: waveformData.A },
            { data: waveformData.B },
            { data: waveformData.C }
        ]
    });

    // 更新趋势图
    currentTrend.setOption({
        series: [
            { data: simulator.historicalData.A },
            { data: simulator.historicalData.B },
            { data: simulator.historicalData.C }
        ]
    });

    // 更新谐波图
    const harmonicsData = simulator.generateHarmonicsData();
    currentHarmonics.setOption({
        series: [
            { data: harmonicsData.A },
            { data: harmonicsData.B },
            { data: harmonicsData.C }
        ]
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initCharts();
    const simulator = new CurrentDataSimulator();
    
    setInterval(() => {
        updateDisplayData(simulator);
    }, 50);
});
