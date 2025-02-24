// 更新时间显示
function updateTime() {
    const timeElement = document.getElementById('currentTime');
    timeElement.textContent = new Date().toLocaleString();
}
setInterval(updateTime, 1000);
updateTime();

// 谐波数据模拟器
class HarmonicsSimulator {
    constructor() {
        this.baseFrequency = 50; // 基波频率50Hz
        this.samplePoints = 1000;
        this.harmonicOrders = 13; // 考虑到13次谐波
    }

    // 生成基本波形数据
    generateWaveformData() {
        const voltage = [];
        const current = [];
        const combined = [];
        
        for (let i = 0; i < this.samplePoints; i++) {
            const t = i / this.samplePoints;
            let v = 0;
            let c = 0;
            
            // 基波
            v += 220 * Math.sin(2 * Math.PI * this.baseFrequency * t);
            c += 5 * Math.sin(2 * Math.PI * this.baseFrequency * t - Math.PI / 6); // 电流滞后30度
            
            // 添加谐波
            for (let n = 2; n <= 5; n++) {
                const vAmp = 220 * (0.05 / n) * Math.random();
                const cAmp = 5 * (0.08 / n) * Math.random();
                v += vAmp * Math.sin(2 * Math.PI * n * this.baseFrequency * t);
                c += cAmp * Math.sin(2 * Math.PI * n * this.baseFrequency * t);
            }
            
            voltage.push([t * 20, v]);
            current.push([t * 20, c]);
            combined.push([t * 20, v / 44]); // 电压缩小显示与电流叠加
        }
        
        return { voltage, current, combined };
    }

    // 生成频谱数据
    generateSpectrumData() {
        const voltageSpectrum = [];
        const currentSpectrum = [];
        
        // 基波100%
        voltageSpectrum.push(100);
        currentSpectrum.push(100);
        
        // 2-13次谐波
        for (let i = 2; i <= this.harmonicOrders; i++) {
            voltageSpectrum.push(Number((Math.random() * (8 / i)).toFixed(2)));
            currentSpectrum.push(Number((Math.random() * (12 / i)).toFixed(2)));
        }
        
        return { voltageSpectrum, currentSpectrum };
    }

    // 更新卡片数据
    updateSummaryCards() {
        const cards = document.querySelectorAll('.harmonics-summary .card .value');
        
        // 更新电压总谐波畸变率
        cards[0].textContent = (2 + Math.random()).toFixed(2) + '%';
        
        // 更新电流总谐波畸变率
        cards[1].textContent = (3 + Math.random()).toFixed(2) + '%';
        
        // 更新谐波无功功率
        cards[2].textContent = (0.2 + Math.random() * 0.2).toFixed(2) + ' kVar';
        
        // 更新谐波功率因数
        cards[3].textContent = (0.95 + Math.random() * 0.04).toFixed(2);
    }
}

// 初始化图表
document.addEventListener('DOMContentLoaded', function() {
    const simulator = new HarmonicsSimulator();
    
    // 初始化波形图
    const waveformChart = echarts.init(document.getElementById('harmonicsWaveform'));
    const voltageSpectrumChart = echarts.init(document.getElementById('voltageSpectrum'));
    const currentSpectrumChart = echarts.init(document.getElementById('currentSpectrum'));
    
    // 波形图配置
    const waveformOption = {
        tooltip: {
            trigger: 'axis',
            formatter: '{b}ms\n{a}: {c}V'
        },
        legend: {
            data: ['电压波形', '电流波形', '基波'],
            bottom: 10
        },
        grid: {
            top: 50,
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            name: '时间(ms)'
        },
        yAxis: {
            type: 'value',
            name: '幅值'
        },
        series: [
            {
                name: '电压波形',
                type: 'line',
                smooth: true,
                data: [],
                itemStyle: { color: '#FF4B4B' }
            },
            {
                name: '电流波形',
                type: 'line',
                smooth: true,
                data: [],
                itemStyle: { color: '#FFA74B' }
            },
            {
                name: '基波',
                type: 'line',
                smooth: true,
                data: [],
                itemStyle: { color: '#4BFF4B' }
            }
        ]
    };

    // 频谱图配置
    const spectrumOption = {
        title: {
            text: '',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: '{b}次谐波: {c}%'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            name: '谐波次数',
            data: Array.from({length: 13}, (_, i) => i + 1 + '次')
        },
        yAxis: {
            type: 'value',
            name: '含量(%)',
            max: 100
        },
        series: [{
            type: 'bar',
            data: [],
            itemStyle: { color: '#1890ff' }
        }]
    };

    // 设置初始配置
    waveformChart.setOption(waveformOption);
    voltageSpectrumChart.setOption({
        ...spectrumOption
    });
    currentSpectrumChart.setOption({
        ...spectrumOption
    });

    // 定时更新数据
    function updateCharts() {
        // 更新波形数据
        const waveformData = simulator.generateWaveformData();
        waveformChart.setOption({
            series: [
                { data: waveformData.voltage },
                { data: waveformData.current },
                { data: waveformData.combined }
            ]
        });

        // 更新频谱数据
        const spectrumData = simulator.generateSpectrumData();
        voltageSpectrumChart.setOption({
            series: [{ data: spectrumData.voltageSpectrum }]
        });
        currentSpectrumChart.setOption({
            series: [{ data: spectrumData.currentSpectrum }]
        });

        // 更新卡片数据
        simulator.updateSummaryCards();
    }

    // 初始更新
    updateCharts();

    // 定时更新
    setInterval(updateCharts, 1000);

    // 响应窗口大小变化
    window.addEventListener('resize', function() {
        waveformChart.resize();
        voltageSpectrumChart.resize();
        currentSpectrumChart.resize();
    });
});
