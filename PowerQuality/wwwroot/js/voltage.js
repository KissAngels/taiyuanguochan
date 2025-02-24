// 在DOM加载完成后初始化图表
document.addEventListener('DOMContentLoaded', function() {
    // 初始化三相电压实时波形图
    const voltageWaveform = echarts.init(document.getElementById('voltageWaveform'));
    
    // 生成更真实的模拟数据
    const points = 100;
    const time = Array.from({length: points}, (_, i) => i);
    
    // 基准电压值（标称值220V）
    const baseVoltageA = 221.5; // A相略高
    const baseVoltageB = 219.8; // B相略低
    const baseVoltageC = 220.3; // C相接近标称值
    
    // 添加随机波动函数 - 修改为保留两位小数
    function addNoise(value, amplitude = 0.5) {
        return Number((value + (Math.random() - 0.5) * amplitude).toFixed(2));
    }

    // 添加偏移值
    const offsetA = 440;
    const offsetB = 220;
    const offsetC = 0;

    // 生成三相电压数据
    const phaseA = time.map(t => {
        // A相基本波形 + 随机波动 + 微小3次谐波
        const fundamental = baseVoltageA * Math.sin(t * 2 * Math.PI / points);
        const thirdHarmonic = baseVoltageA * 0.02 * Math.sin(t * 6 * Math.PI / points);
        return Number((Math.abs(fundamental + thirdHarmonic + addNoise(0, 0.8)) + offsetA).toFixed(2));
    });

    const phaseB = time.map(t => {
        // B相基本波形（相差120度）+ 随机波动 + 微小5次谐波
        const fundamental = baseVoltageB * Math.sin(t * 2 * Math.PI / points + (2 * Math.PI / 3));
        const fifthHarmonic = baseVoltageB * 0.015 * Math.sin(t * 10 * Math.PI / points);
        return Number((Math.abs(fundamental + fifthHarmonic + addNoise(0, 0.6)) + offsetB).toFixed(2));
    });

    const phaseC = time.map(t => {
        // C相基本波形（相差240度）+ 随机波动 + 微小7次谐波
        const fundamental = baseVoltageC * Math.sin(t * 2 * Math.PI / points + (4 * Math.PI / 3));
        const seventhHarmonic = baseVoltageC * 0.01 * Math.sin(t * 14 * Math.PI / points);
        return Number((Math.abs(fundamental + seventhHarmonic + addNoise(0, 0.7)) + offsetC).toFixed(2));
    });

    // 配置项
    const option = {
        title: {
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                let result = `时间点：${params[0].dataIndex}<br/>`;
                params.forEach(param => {
                    let actualValue = 0;
                    if (param.seriesName === 'A相') {
                        actualValue = (param.value - offsetA).toFixed(2);
                    } else if (param.seriesName === 'B相') {
                        actualValue = (param.value - offsetB).toFixed(2);
                    } else {
                        actualValue = param.value.toFixed(2);
                    }
                    result += `${param.seriesName}：${actualValue}V<br/>`;
                });
                return result;
            }
        },
        legend: {
            data: ['A相', 'B相', 'C相'],
            bottom: '5%'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            name: '时间',
            data: time
        },
        yAxis: {
            type: 'value',
            name: '电压(V)',
            min: 0,
            max: 660,
            interval: 220,
            axisLabel: {
                formatter: function(value) {
                    if (value === 440) return 'A相';
                    if (value === 220) return 'B相';
                    if (value === 0) return 'C相';
                    return '';
                }
            }
        },
        series: [
            {
                name: 'A相',
                type: 'line',
                data: phaseA,
                smooth: true,
                lineStyle: {
                    width: 2
                },
                itemStyle: { color: '#FF4B4B' }
            },
            {
                name: 'B相',
                type: 'line',
                data: phaseB,
                smooth: true,
                lineStyle: {
                    width: 2
                },
                itemStyle: { color: '#FFA74B' }
            },
            {
                name: 'C相',
                type: 'line',
                data: phaseC,
                smooth: true,
                lineStyle: {
                    width: 2
                },
                itemStyle: { color: '#4BFF4B' }
            }
        ]
    };

    // 使用配置项设置图表
    voltageWaveform.setOption(option);

    // 定期更新数据，模拟实时效果
    setInterval(() => {
        // 更新数据
        const newPhaseA = phaseA.map(v => Number((addNoise(v - offsetA, 0.3) + offsetA).toFixed(2)));
        const newPhaseB = phaseB.map(v => Number((addNoise(v - offsetB, 0.3) + offsetB).toFixed(2)));
        const newPhaseC = phaseC.map(v => Number((addNoise(v, 0.3)).toFixed(2)));
        
        voltageWaveform.setOption({
            series: [
                { data: newPhaseA },
                { data: newPhaseB },
                { data: newPhaseC }
            ]
        });
    }, 1000);

    // 确保容器存在并且有尺寸
    const trendContainer = document.getElementById('voltageTrend');
    if (!trendContainer) {
        console.error('找不到趋势图容器');
        return;
    }

    // 初始化电压趋势图
    const voltageTrend = echarts.init(trendContainer);
    
    // 初始化时间和数据数组
    const maxDataPoints = 60;
    const times = Array(maxDataPoints).fill('').map((_, i) => {
        const time = new Date();
        time.setSeconds(time.getSeconds() - (maxDataPoints - 1 - i));
        return time.toLocaleTimeString('zh-CN', { hour12: false });
    });
    
    // 生成基础数据和模拟数据
    const trendA = Array(maxDataPoints).fill(null).map(() => Number((baseVoltageA + (Math.random() - 0.5) * 2).toFixed(2)));
    const trendB = Array(maxDataPoints).fill(null).map(() => Number((baseVoltageB + (Math.random() - 0.5) * 2).toFixed(2)));
    const trendC = Array(maxDataPoints).fill(null).map(() => Number((baseVoltageC + (Math.random() - 0.5) * 2).toFixed(2)));
    
    // 生成模拟预测数据 - 修复未定义错误
    const simulatedA = trendA.map(v => Number((v + Math.sin(Math.random() * Math.PI) * 1.5).toFixed(2)));
    const simulatedB = trendB.map(v => Number((v + Math.sin(Math.random() * Math.PI) * 1.5).toFixed(2)));
    const simulatedC = trendC.map(v => Number((v + Math.sin(Math.random() * Math.PI) * 1.5).toFixed(2)));

    // 电压趋势图配置
    const trendOption = {
        grid: {
            top: 40,
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true
        },
        title: {
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                let result = `时间：${params[0].axisValue}<br/>`;
                params.forEach(param => {
                    result += `${param.seriesName}：${param.value}V<br/>`;
                });
                return result;
            }
        },
        legend: {
            data: ['A相实测', 'B相实测', 'C相实测', 'A相模拟', 'B相模拟', 'C相模拟'],
            bottom: 0
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: times,
            axisLabel: {
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            name: '电压(V)',
            min: 210,
            max: 230,
            interval: 5
        },
        series: [
            {
                name: 'A相实测',
                type: 'line',
                data: trendA,
                smooth: true,
                itemStyle: { color: '#FF4B4B' }
            },
            {
                name: 'B相实测',
                type: 'line',
                data: trendB,
                smooth: true,
                itemStyle: { color: '#FFA74B' }
            },
            {
                name: 'C相实测',
                type: 'line',
                data: trendC,
                smooth: true,
                itemStyle: { color: '#4BFF4B' }
            },
            {
                name: 'A相模拟',
                type: 'line',
                data: simulatedA,
                smooth: true,
                lineStyle: {
                    type: 'dashed',
                    width: 1
                },
                itemStyle: { color: '#FF4B4B' },
                opacity: 0.5
            },
            {
                name: 'B相模拟',
                type: 'line',
                data: simulatedB,
                smooth: true,
                lineStyle: {
                    type: 'dashed',
                    width: 1
                },
                itemStyle: { color: '#FFA74B' },
                opacity: 0.5
            },
            {
                name: 'C相模拟',
                type: 'line',
                data: simulatedC,
                smooth: true,
                lineStyle: {
                    type: 'dashed',
                    width: 1
                },
                itemStyle: { color: '#4BFF4B' },
                opacity: 0.5
            }
        ]
    };

    // 立即设置配置并渲染
    voltageTrend.setOption(trendOption, true);

    // 每秒更新趋势图数据
    const trendTimer = setInterval(() => {
        if (!document.getElementById('voltageTrend')) {
            clearInterval(trendTimer);
            return;
        }
        const now = new Date();
        const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false });
        
        times.shift();
        times.push(timeStr);
        
        // 更新实测数据
        trendA.shift();
        trendB.shift();
        trendC.shift();
        
        const newA = Number((baseVoltageA + (Math.random() - 0.5) * 2).toFixed(2));
        const newB = Number((baseVoltageB + (Math.random() - 0.5) * 2).toFixed(2));
        const newC = Number((baseVoltageC + (Math.random() - 0.5) * 2).toFixed(2));
        
        trendA.push(newA);
        trendB.push(newB);
        trendC.push(newC);
        
        // 更新模拟数据
        simulatedA.shift();
        simulatedB.shift();
        simulatedC.shift();
        
        // 使用新值计算模拟数据
        simulatedA.push(Number((newA + Math.sin(Math.random() * Math.PI) * 1.5).toFixed(2)));
        simulatedB.push(Number((newB + Math.sin(Math.random() * Math.PI) * 1.5).toFixed(2)));
        simulatedC.push(Number((newC + Math.sin(Math.random() * Math.PI) * 1.5).toFixed(2)));

        voltageTrend.setOption({
            xAxis: {
                data: times
            },
            series: [
                { data: trendA },
                { data: trendB },
                { data: trendC },
                { data: simulatedA },
                { data: simulatedB },
                { data: simulatedC }
            ]
        });
    }, 1000);

    // 确保容器存在并且有尺寸
    const harmonicsContainer = document.getElementById('voltageHarmonics');
    if (!harmonicsContainer) {
        console.error('找不到谐波图容器');
        return;
    }

    // 初始化电压谐波图表
    const harmonicsChart = echarts.init(harmonicsContainer);
    
    // 生成谐波数据函数
    function generateHarmonicsData() {
        const harmonics = [];
        // 生成2-13次谐波数据，基波设为100%
        for (let i = 1; i <= 13; i++) {
            if (i === 1) {
                harmonics.push(100); // 基波
            } else {
                // 随机生成各次谐波含量，且越高次谐波含量越小
                const value = Number((Math.random() * (10 / i)).toFixed(2));
                harmonics.push(value);
            }
        }
        return harmonics;
    }

    // 生成三相谐波数据
    const harmonicsA = generateHarmonicsData();
    const harmonicsB = generateHarmonicsData();
    const harmonicsC = generateHarmonicsData();

    // 谐波图表配置
    const harmonicsOption = {
        title: {
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: function(params) {
                return params.map(param => 
                    `${param.seriesName}<br/>${param.name}次谐波: ${param.value}%`
                ).join('<br/><br/>');
            }
        },
        legend: {
            data: ['A相', 'B相', 'C相'],
            bottom: 0
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
            data: Array.from({length: 13}, (_, i) => `${i + 1}`),
            axisLabel: {
                interval: 0
            }
        },
        yAxis: {
            type: 'value',
            name: '含量(%)',
            max: 100,
            axisLabel: {
                formatter: '{value}%'
            }
        },
        series: [
            {
                name: 'A相',
                type: 'bar',
                data: harmonicsA,
                itemStyle: { color: '#FF4B4B' }
            },
            {
                name: 'B相',
                type: 'bar',
                data: harmonicsB,
                itemStyle: { color: '#FFA74B' }
            },
            {
                name: 'C相',
                type: 'bar',
                data: harmonicsC,
                itemStyle: { color: '#4BFF4B' }
            }
        ]
    };

    harmonicsChart.setOption(harmonicsOption);

    // 定期更新谐波数据
    const harmonicsTimer = setInterval(() => {
        if (!document.getElementById('voltageHarmonics')) {
            clearInterval(harmonicsTimer);
            return;
        }
        
        const newHarmonicsA = generateHarmonicsData();
        const newHarmonicsB = generateHarmonicsData();
        const newHarmonicsC = generateHarmonicsData();

        harmonicsChart.setOption({
            series: [
                { data: newHarmonicsA },
                { data: newHarmonicsB },
                { data: newHarmonicsC }
            ]
        });
    }, 3000);

    // 确保图表容器在视口中可见时重新调整大小
    const resizeCharts = () => {
        if (document.getElementById('voltageTrend')) {
            voltageTrend.resize();
        }
        if (document.getElementById('voltageHarmonics')) {
            harmonicsChart.resize();
        }
    };

    window.addEventListener('resize', resizeCharts);
    // 响应窗口调整大小
    window.addEventListener('resize', function() {
        voltageWaveform.resize();
        voltageTrend.resize();
        harmonicsChart.resize();
    });
});
