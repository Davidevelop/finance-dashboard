// ============================================
// DASHBOARD PAGE JAVASCRIPT - ENHANCED VERSION
// ============================================

// Verificar autenticação
if (!sessionStorage.getItem('isLoggedIn')) {
    window.location.href = 'index.html';
}

// ============================================
// THEME MANAGEMENT
// ============================================
const themeToggle = document.getElementById('themeToggle');
const themeDropdown = document.getElementById('themeDropdown');
const themeOptions = document.querySelectorAll('.theme-option');

// Carregar tema salvo
const savedTheme = localStorage.getItem('dashboard-theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

// Marca tema ativo
themeOptions.forEach(option => {
    if (option.dataset.theme === savedTheme) {
        option.classList.add('active');
    }
});

// Toggle dropdown
themeToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    themeDropdown.classList.toggle('show');
});

// Selecionar tema
themeOptions.forEach(option => {
    option.addEventListener('click', () => {
        const theme = option.dataset.theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('dashboard-theme', theme);
        
        themeOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        themeDropdown.classList.remove('show');
        
        // Atualiza gráficos com nova cor
        updateChartsTheme();
    });
});

// Fechar dropdown ao clicar fora
document.addEventListener('click', (e) => {
    if (!e.target.closest('.theme-selector')) {
        themeDropdown.classList.remove('show');
    }
});

// ============================================
// DATE FILTER
// ============================================
const dateRangeSelect = document.getElementById('dateRange');
const customDatePicker = document.getElementById('customDatePicker');
const applyDateFilter = document.getElementById('applyDateFilter');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');

dateRangeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
        customDatePicker.style.display = 'flex';
        
        // Define datas padrão
        const today = new Date();
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        
        endDateInput.value = today.toISOString().split('T')[0];
        startDateInput.value = lastMonth.toISOString().split('T')[0];
    } else {
        customDatePicker.style.display = 'none';
        updateDataByDateRange(parseInt(e.target.value));
    }
});

applyDateFilter.addEventListener('click', () => {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 0) {
        updateDataByDateRange(daysDiff);
        // Notificação visual
        showNotification(`✅ Dados filtrados: ${daysDiff} dias`, 'success');
    } else {
        showNotification('❌ Data final deve ser maior que a data inicial', 'error');
    }
});

function updateDataByDateRange(days) {
    console.log(`📅 Atualizando TODOS os dados para os últimos ${days} dias`);
    
    // Salva o período atual globalmente
    currentPeriodDays = days;
    
    // Define o label do período
    if (days <= 7) {
        currentPeriodLabel = 'Últimos 7 dias';
    } else if (days <= 30) {
        currentPeriodLabel = 'Últimos 30 dias';
    } else if (days <= 90) {
        currentPeriodLabel = 'Últimos 3 meses';
    } else if (days <= 180) {
        currentPeriodLabel = 'Últimos 6 meses';
    } else {
        currentPeriodLabel = 'Último ano';
    }
    
    // ============================================
    // PASSO 1: DEFINE OS TOTAIS DOS KPIs (valores fixos proporcionais)
    // ============================================
    const baseRevenueTotal = 2847650; // Receita anual base
    const baseExpensesTotal = 1654320; // Despesas anuais base
    
    // Calcula os totais proporcionais ao período
    const periodMultiplier = days / 365;
    const totalRevenue = Math.round(baseRevenueTotal * periodMultiplier);
    const totalExpenses = Math.round(baseExpensesTotal * periodMultiplier);
    const totalProfit = totalRevenue - totalExpenses;
    
    // ============================================
    // PASSO 2: DEFINE PERÍODOS E LABELS
    // ============================================
    let periods, labels;
    
    if (days <= 7) {
        periods = 7;
        labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        console.log('📅 Período: 7 dias da semana');
    } else if (days <= 30) {
        periods = 4;
        labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
        console.log('📅 Período: 4 semanas');
    } else if (days <= 90) {
        periods = 3;
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const today = new Date();
        labels = [];
        for (let i = periods - 1; i >= 0; i--) {
            const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
            labels.push(monthNames[month.getMonth()]);
        }
        console.log('📅 Período: 3 meses');
    } else if (days <= 180) {
        periods = 6;
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const today = new Date();
        labels = [];
        for (let i = periods - 1; i >= 0; i--) {
            const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
            labels.push(monthNames[month.getMonth()]);
        }
        console.log('📅 Período: 6 meses');
    } else {
        periods = 12;
        labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        console.log('📅 Período: 12 meses (ano completo)');
    }
    
    console.log('🏷️ Labels:', labels);
    
    // ============================================
    // PASSO 3: DISTRIBUI OS TOTAIS PELOS PERÍODOS
    // ============================================
    const newRevenue = distributeValueAcrossPeriods(totalRevenue, periods);
    const newExpenses = distributeValueAcrossPeriods(totalExpenses, periods);
    const newProfit = newRevenue.map((rev, idx) => rev - newExpenses[idx]);
    const newGrowth = generateDataForPeriod(periods, 12, 20, true);
    
    // Verifica se os totais batem (garantia de consistência)
    const sumRevenue = newRevenue.reduce((a, b) => a + b, 0);
    const sumExpenses = newExpenses.reduce((a, b) => a + b, 0);
    console.log(`✅ Receita: KPI=${totalRevenue.toLocaleString()} | Gráfico=${sumRevenue.toLocaleString()} | Match=${sumRevenue === totalRevenue}`);
    console.log(`✅ Despesas: KPI=${totalExpenses.toLocaleString()} | Gráfico=${sumExpenses.toLocaleString()} | Match=${sumExpenses === totalExpenses}`);
    
    // ============================================
    // 1. ATUALIZA GRÁFICO DE RECEITA VS DESPESAS
    // ============================================
    revenueExpenseChart.data.labels = labels;
    revenueExpenseChart.data.datasets[0].data = newRevenue;
    revenueExpenseChart.data.datasets[1].data = newExpenses;
    revenueExpenseChart.update('none'); // Atualiza sem animação para garantir mudança imediata
    
    console.log(`📊 Gráfico atualizado com ${periods} períodos:`, labels);
    
    // ============================================
    // 2. ATUALIZA GRÁFICO DE PERFORMANCE MENSAL
    // ============================================
    monthlyPerformanceChart.data.labels = labels;
    monthlyPerformanceChart.data.datasets[0].data = newProfit;
    monthlyPerformanceChart.data.datasets[0].backgroundColor = newProfit.map(p => 
        p > (totalProfit / periods) ? 'rgba(67, 233, 123, 0.8)' : 'rgba(99, 102, 241, 0.8)'
    );
    monthlyPerformanceChart.update('active');
    
    // ============================================
    // 3. ATUALIZA GRÁFICO DE TENDÊNCIA DE CRESCIMENTO
    // ============================================
    growthTrendChart.data.labels = labels;
    growthTrendChart.data.datasets[0].data = newGrowth;
    growthTrendChart.update('active');
    
    // ============================================
    // 4. ATUALIZA GRÁFICO DE DISTRIBUIÇÃO DE CUSTOS
    // ============================================
    const basePercentages = [35, 20, 15, 12, 10, 8];
    const variance = (Math.random() - 0.5) * 4;
    const newCostData = basePercentages.map((pct, idx) => {
        if (idx === 0) return pct;
        return Math.max(1, pct + (variance * (idx % 2 === 0 ? 1 : -1) * 0.3));
    });
    
    const sum = newCostData.reduce((a, b) => a + b, 0);
    const normalizedCostData = newCostData.map(v => Math.round((v / sum) * 100));
    
    costDistributionChart.data.datasets[0].data = normalizedCostData;
    costDistributionChart.update('active');
    
    // ============================================
    // 5. ATUALIZA KPIs COM VALORES EXATOS
    // ============================================
    const avgGrowth = newGrowth.reduce((a, b) => a + b, 0) / newGrowth.length;
    const roi = ((totalProfit / totalExpenses) * 100);
    
    animateValue(document.getElementById('totalRevenue'), 0, totalRevenue, 1000);
    animateValue(document.getElementById('totalExpenses'), 0, totalExpenses, 1000);
    animateValue(document.getElementById('netProfit'), 0, totalProfit, 1000);
    animateValue(document.getElementById('growthRate'), 0, avgGrowth, 1000);
    
    const roiElement = document.querySelector('.kpi-card:nth-child(4) .kpi-value');
    if (roiElement) {
        animateValue(roiElement, 0, roi, 1000);
    }
    
    // ============================================
    // 6. ATUALIZA LUCROS NO MAPA (proporcional ao lucro total)
    // ============================================
    updateMapProfits(totalProfit);
    
    // ============================================
    // 7. ATUALIZA TRANSAÇÕES (proporcional ao período)
    // ============================================
    updateTransactions(days, totalRevenue, totalExpenses);
    
    showNotification(`✅ Dashboard atualizado: ${currentPeriodLabel}`, 'success');
}

// Função para atualizar lucros nas regiões do mapa
function updateMapProfits(totalProfit) {
    // Distribui o lucro total pelas regiões mantendo as proporções originais
    const originalTotalProfit = financialData.regions.reduce((sum, r) => sum + r.profit, 0);
    
    financialData.regions.forEach(region => {
        // Mantém a proporção de cada região no total
        const proportion = region.profit / originalTotalProfit;
        const newProfit = Math.round(totalProfit * proportion);
        region.profit = newProfit;
        
        // Atualiza status baseado no novo valor
        const avgProfit = totalProfit / financialData.regions.length;
        if (region.profit > avgProfit * 1.5) region.status = 'high';
        else if (region.profit > avgProfit * 0.7) region.status = 'medium';
        else region.status = 'low';
    });
    
    // Re-renderiza o mapa
    renderMap();
}

// Função para atualizar transações baseado no período e valores reais
function updateTransactions(days, totalRevenue, totalExpenses) {
    const tbody = document.getElementById('transactionsBody');
    
    // Gera transações fictícias para o período
    const transactionsData = [];
    const numTransactions = Math.min(Math.ceil(days / 3), 8); // 1 transação a cada 3 dias, máx 8
    
    // Calcula quantas transações de receita vs despesa precisamos
    const numRevenueTransactions = Math.ceil(numTransactions * 0.4); // 40% receitas
    const numExpenseTransactions = numTransactions - numRevenueTransactions; // 60% despesas
    
    const revenueDescriptions = [
        'Receita de Vendas',
        'Receita de Assinaturas',
        'Receita de Projetos',
        'Receita de Consultoria'
    ];
    
    const expenseDescriptions = [
        'Pagamento de Salários',
        'Campanha Marketing Digital',
        'Serviços de Cloud',
        'Aluguel Escritório',
        'Consultoria Técnica'
    ];
    
    const categories = ['salarios', 'marketing', 'tech', 'ops'];
    
    const today = new Date();
    let revenueSum = 0;
    let expenseSum = 0;
    
    // Gera transações de receita
    for (let i = 0; i < numRevenueTransactions; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - Math.floor(i * (days / numTransactions)));
        
        const isLast = (i === numRevenueTransactions - 1);
        const value = isLast 
            ? (totalRevenue - revenueSum) // Última transação ajusta para total exato
            : Math.round((totalRevenue / numRevenueTransactions) * (0.8 + Math.random() * 0.4));
        
        revenueSum += value;
        
        transactionsData.push({
            id: `TXN-${String(transactionsData.length + 1).padStart(3, '0')}`,
            date: date.toISOString().split('T')[0],
            description: revenueDescriptions[i % revenueDescriptions.length],
            category: 'marketing',
            value: value,
            status: 'completed'
        });
    }
    
    // Gera transações de despesa
    for (let i = 0; i < numExpenseTransactions; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - Math.floor((i + numRevenueTransactions) * (days / numTransactions)));
        
        const isLast = (i === numExpenseTransactions - 1);
        const value = isLast 
            ? -(totalExpenses - expenseSum) // Última transação ajusta para total exato
            : -Math.round((totalExpenses / numExpenseTransactions) * (0.8 + Math.random() * 0.4));
        
        expenseSum += Math.abs(value);
        
        transactionsData.push({
            id: `TXN-${String(transactionsData.length + 1).padStart(3, '0')}`,
            date: date.toISOString().split('T')[0],
            description: expenseDescriptions[i % expenseDescriptions.length],
            category: categories[i % categories.length],
            value: value,
            status: Math.random() > 0.95 ? 'pending' : 'completed'
        });
    }
    
    // Ordena por data (mais recente primeiro)
    transactionsData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log(`📊 Transações: Receita=${revenueSum.toLocaleString()} | Despesas=${expenseSum.toLocaleString()}`);
    
    tbody.innerHTML = transactionsData.map(txn => `
        <tr>
            <td><span class="transaction-id">${txn.id}</span></td>
            <td>${new Date(txn.date).toLocaleDateString('pt-BR')}</td>
            <td>${txn.description}</td>
            <td><span class="transaction-category category-${txn.category}">${txn.category.charAt(0).toUpperCase() + txn.category.slice(1)}</span></td>
            <td class="transaction-value ${txn.value >= 0 ? 'value-positive' : 'value-negative'}">
                ${formatCurrency(Math.abs(txn.value))}
            </td>
            <td>
                <span class="transaction-status status-${txn.status}">
                    <i class="fas fa-${txn.status === 'completed' ? 'check-circle' : txn.status === 'pending' ? 'clock' : 'times-circle'}"></i>
                    ${txn.status === 'completed' ? 'Concluído' : txn.status === 'pending' ? 'Pendente' : 'Cancelado'}
                </span>
            </td>
        </tr>
    `).join('');
}

// Função auxiliar para gerar dados simulados
function generateDataForPeriod(periods, baseMin, baseMax, isPercentage = false) {
    const data = [];
    
    // Ajusta os valores baseado no período (valores base são mensais)
    // Para períodos menores que um mês, divide proporcionalmente
    let min = baseMin;
    let max = baseMax;
    
    if (periods === 7) {
        // 7 dias = ~1/4 de mês, divide por 30 (mensal) e multiplica por período
        min = (baseMin / 30) * 7;
        max = (baseMax / 30) * 7;
    } else if (periods === 4) {
        // 4 semanas = 1 mês
        min = baseMin;
        max = baseMax;
    } else if (periods < 12 && periods > 1) {
        // Para 3 ou 6 meses, mantém valores mensais
        min = baseMin;
        max = baseMax;
    }
    
    let lastValue = (min + max) / 2;
    
    for (let i = 0; i < periods; i++) {
        // Variação aleatória mas com tendência de crescimento
        const variance = (max - min) * 0.15;
        const trend = (max - min) * 0.02; // Pequena tendência de crescimento
        const change = (Math.random() - 0.4) * variance + trend;
        
        lastValue = Math.max(min, Math.min(max, lastValue + change));
        
        if (isPercentage) {
            data.push(parseFloat(lastValue.toFixed(1)));
        } else {
            data.push(Math.round(lastValue));
        }
    }
    
    return data;
}

// Nova função: Distribui um valor total pelos períodos com variação realista
// GARANTE que a soma dos valores retornados seja EXATAMENTE igual ao total
function distributeValueAcrossPeriods(total, periods) {
    const data = [];
    const avgValue = total / periods;
    
    // Gera valores com variação de ±20% da média
    let sum = 0;
    for (let i = 0; i < periods - 1; i++) {
        const variance = avgValue * 0.20; // 20% de variação
        const value = Math.round(avgValue + (Math.random() - 0.5) * 2 * variance);
        data.push(value);
        sum += value;
    }
    
    // O último período recebe o valor restante para garantir soma exata
    data.push(total - sum);
    
    return data;
}

// Função para mostrar notificações
function showNotification(message, type = 'info') {
    // Remove notificação anterior se existir
    const existingNotif = document.querySelector('.floating-notification');
    if (existingNotif) {
        existingNotif.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `floating-notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Anima entrada
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove após 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// DATE AND TIME
// ============================================
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('pt-BR', options);
}
updateDateTime();
setInterval(updateDateTime, 60000);

// ============================================
// SIDEBAR TOGGLE
// ============================================
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.sidebar');

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// ============================================
// FINANCIAL DATA
// ============================================
const financialData = {
    revenue: {
        total: 2847650,
        monthly: [450000, 480000, 520000, 495000, 510000, 530000, 560000, 540000, 580000, 600000, 620000, 650000]
    },
    expenses: {
        total: 1654320,
        monthly: [280000, 290000, 310000, 295000, 305000, 315000, 330000, 320000, 340000, 350000, 360000, 380000],
        distribution: {
            'Salários': 35,
            'Marketing': 20,
            'Infraestrutura': 15,
            'Tecnologia': 12,
            'Operacional': 10,
            'Outros': 8
        }
    },
    profit: 1193330,
    growthRate: 18.5,
    regions: [
        { name: 'São Paulo', lat: -23.5505, lng: -46.6333, profit: 650000, status: 'high' },
        { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, profit: 480000, status: 'medium' },
        { name: 'Belo Horizonte', lat: -19.9167, lng: -43.9345, profit: 320000, status: 'medium' },
        { name: 'Brasília', lat: -15.7939, lng: -47.8828, profit: 410000, status: 'medium' },
        { name: 'Curitiba', lat: -25.4284, lng: -49.2733, profit: 290000, status: 'medium' },
        { name: 'Porto Alegre', lat: -30.0346, lng: -51.2177, profit: 350000, status: 'medium' },
        { name: 'Salvador', lat: -12.9714, lng: -38.5014, profit: 245000, status: 'medium' },
        { name: 'Fortaleza', lat: -3.7172, lng: -38.5433, profit: 180000, status: 'low' },
        { name: 'Recife', lat: -8.0476, lng: -34.8770, profit: 195000, status: 'low' },
        { name: 'Manaus', lat: -3.1190, lng: -60.0217, profit: 165000, status: 'low' }
    ]
};

// ============================================
// UPDATE KPI VALUES
// ============================================
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        
        if (element.id === 'growthRate') {
            element.textContent = value.toFixed(1) + '%';
        } else {
            element.textContent = formatCurrency(value);
        }
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Animate KPI values
animateValue(document.getElementById('totalRevenue'), 0, financialData.revenue.total, 2000);
animateValue(document.getElementById('netProfit'), 0, financialData.profit, 2000);
animateValue(document.getElementById('totalExpenses'), 0, financialData.expenses.total, 2000);
animateValue(document.getElementById('growthRate'), 0, financialData.growthRate, 2000);

// ============================================
// CHART.JS CONFIGURATIONS
// ============================================

// Global Chart.js defaults
Chart.defaults.color = '#cbd5e1';
Chart.defaults.borderColor = 'rgba(148, 163, 184, 0.1)';
Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

let revenueExpenseChart, costDistributionChart, monthlyPerformanceChart, growthTrendChart;

// Revenue vs Expenses Chart
const revenueExpenseCtx = document.getElementById('revenueExpenseChart').getContext('2d');
revenueExpenseChart = new Chart(revenueExpenseCtx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        datasets: [
            {
                label: 'Receita',
                data: financialData.revenue.monthly,
                borderColor: '#4facfe',
                backgroundColor: 'rgba(79, 172, 254, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: '#4facfe',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            },
            {
                label: 'Despesas',
                data: financialData.expenses.monthly,
                borderColor: '#fa709a',
                backgroundColor: 'rgba(250, 112, 154, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: '#fa709a',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 13 }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                padding: 12,
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(148, 163, 184, 0.2)',
                borderWidth: 1,
                callbacks: {
                    label: function(context) {
                        return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(148, 163, 184, 0.1)' },
                ticks: {
                    callback: function(value) {
                        return 'R$ ' + (value / 1000) + 'K';
                    }
                }
            },
            x: { grid: { display: false } }
        }
    }
});

// Cost Distribution Chart
const costDistributionCtx = document.getElementById('costDistributionChart').getContext('2d');
costDistributionChart = new Chart(costDistributionCtx, {
    type: 'doughnut',
    data: {
        labels: Object.keys(financialData.expenses.distribution),
        datasets: [{
            data: Object.values(financialData.expenses.distribution),
            backgroundColor: ['#667eea', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#38f9d7'],
            borderWidth: 0,
            hoverOffset: 10
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: { size: 12 }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                padding: 12,
                callbacks: {
                    label: function(context) {
                        return context.label + ': ' + context.parsed + '%';
                    }
                }
            }
        }
    }
});

// Monthly Performance Chart
const monthlyPerformanceCtx = document.getElementById('monthlyPerformanceChart').getContext('2d');
const profit = financialData.revenue.monthly.map((rev, idx) => rev - financialData.expenses.monthly[idx]);
monthlyPerformanceChart = new Chart(monthlyPerformanceCtx, {
    type: 'bar',
    data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        datasets: [{
            label: 'Lucro Mensal',
            data: profit,
            backgroundColor: profit.map(p => p > 200000 ? 'rgba(67, 233, 123, 0.8)' : 'rgba(99, 102, 241, 0.8)'),
            borderRadius: 8,
            borderSkipped: false
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                padding: 12,
                callbacks: {
                    label: function(context) {
                        return 'Lucro: ' + formatCurrency(context.parsed.y);
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(148, 163, 184, 0.1)' },
                ticks: {
                    callback: function(value) {
                        return 'R$ ' + (value / 1000) + 'K';
                    }
                }
            },
            x: { grid: { display: false } }
        }
    }
});

// Growth Trend Chart
const growthTrendCtx = document.getElementById('growthTrendChart').getContext('2d');
const growthData = [12.5, 13.8, 14.2, 15.1, 16.3, 16.8, 17.5, 17.2, 18.1, 18.9, 19.2, 18.5];
growthTrendChart = new Chart(growthTrendCtx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        datasets: [{
            label: 'Taxa de Crescimento (%)',
            data: growthData,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                padding: 12,
                callbacks: {
                    label: function(context) {
                        return 'Crescimento: ' + context.parsed.y.toFixed(1) + '%';
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(148, 163, 184, 0.1)' },
                ticks: {
                    callback: function(value) {
                        return value + '%';
                    }
                }
            },
            x: { grid: { display: false } }
        }
    }
});

// ============================================
// ============================================
// TRANSACTIONS TABLE
// ============================================
const transactions = [
    { id: 'TXN-001', date: '2025-10-24', description: 'Pagamento de Salários', category: 'salarios', value: -125000, status: 'completed' },
    { id: 'TXN-002', date: '2025-10-23', description: 'Receita de Vendas', category: 'marketing', value: 450000, status: 'completed' },
    { id: 'TXN-003', date: '2025-10-22', description: 'Campanha Marketing Digital', category: 'marketing', value: -35000, status: 'completed' },
    { id: 'TXN-004', date: '2025-10-21', description: 'Serviços de Cloud Computing', category: 'tech', value: -12500, status: 'pending' },
    { id: 'TXN-005', date: '2025-10-20', description: 'Receita de Assinaturas', category: 'marketing', value: 85000, status: 'completed' },
    { id: 'TXN-006', date: '2025-10-19', description: 'Aluguel Escritório', category: 'ops', value: -22000, status: 'completed' },
    { id: 'TXN-007', date: '2025-10-18', description: 'Consultoria Técnica', category: 'tech', value: -18000, status: 'cancelled' },
    { id: 'TXN-008', date: '2025-10-17', description: 'Receita de Projetos', category: 'marketing', value: 195000, status: 'completed' }
];

function renderTransactions() {
    const tbody = document.getElementById('transactionsBody');
    tbody.innerHTML = transactions.map(txn => `
        <tr>
            <td><span class="transaction-id">${txn.id}</span></td>
            <td>${new Date(txn.date).toLocaleDateString('pt-BR')}</td>
            <td>${txn.description}</td>
            <td><span class="transaction-category category-${txn.category}">${txn.category.charAt(0).toUpperCase() + txn.category.slice(1)}</span></td>
            <td class="transaction-value ${txn.value >= 0 ? 'value-positive' : 'value-negative'}">
                ${formatCurrency(Math.abs(txn.value))}
            </td>
            <td>
                <span class="transaction-status status-${txn.status}">
                    <i class="fas fa-${txn.status === 'completed' ? 'check-circle' : txn.status === 'pending' ? 'clock' : 'times-circle'}"></i>
                    ${txn.status === 'completed' ? 'Concluído' : txn.status === 'pending' ? 'Pendente' : 'Cancelado'}
                </span>
            </td>
        </tr>
    `).join('');
}

renderTransactions();

// ============================================
// ALERTS
// ============================================
const alerts = [
    { type: 'warning', icon: 'exclamation-triangle', title: 'Despesas Elevadas', message: 'As despesas de marketing aumentaram 15% este mês.', time: '2 horas atrás' },
    { type: 'success', icon: 'check-circle', title: 'Meta Alcançada', message: 'Receita mensal atingiu 105% da meta estabelecida.', time: '5 horas atrás' },
    { type: 'info', icon: 'info-circle', title: 'Relatório Disponível', message: 'Relatório financeiro trimestral está pronto para análise.', time: '1 dia atrás' }
];

function renderAlerts() {
    const alertsList = document.getElementById('alertsList');
    alertsList.innerHTML = alerts.map(alert => `
        <div class="alert-item alert-${alert.type}">
            <div class="alert-icon">
                <i class="fas fa-${alert.icon}"></i>
            </div>
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-message">${alert.message}</div>
                <div class="alert-time">
                    <i class="fas fa-clock"></i>
                    ${alert.time}
                </div>
            </div>
        </div>
    `).join('');
}

renderAlerts();

// ============================================
// LEAFLET MAP
// ============================================
const map = L.map('map', {
    center: [-14.2350, -51.9253],
    zoom: 4,
    zoomControl: true
});

// Mapa claro ao invés de escuro
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
}).addTo(map);

// Array para armazenar marcadores
let mapMarkers = [];
let currentPeriodDays = 365; // Período padrão é 1 ano
let currentPeriodLabel = 'Último ano';

function getMarkerColor(status) {
    switch(status) {
        case 'high': return '#43e97b';
        case 'medium': return '#fa709a';
        case 'low': return '#667eea';
        default: return '#6366f1';
    }
}

// Função para renderizar o mapa
function renderMap() {
    // Remove marcadores existentes
    mapMarkers.forEach(marker => map.removeLayer(marker));
    mapMarkers = [];
    
    // Adiciona novos marcadores
    financialData.regions.forEach(region => {
        const markerColor = getMarkerColor(region.status);
        
        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                background: ${markerColor};
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 3px solid #fff;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <i class="fas fa-dollar-sign" style="font-size: 12px; color: white;"></i>
            </div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        const marker = L.marker([region.lat, region.lng], { icon: customIcon }).addTo(map);
        
        marker.bindPopup(`
            <div style="padding: 12px; min-width: 220px; background: white; border-radius: 8px;">
                <h4 style="margin: 0 0 12px 0; color: #1e293b; font-size: 16px; font-weight: 600;">
                    <i class="fas fa-map-marker-alt" style="color: ${markerColor};"></i> 
                    ${region.name}
                </h4>
                <p style="margin: 4px 0; color: #64748b; font-size: 12px; font-weight: 500; font-style: italic;">
                    📅 ${currentPeriodLabel}
                </p>
                <p style="margin: 8px 0; color: #000000; font-size: 14px; font-weight: 500;">
                    <strong style="color: #000000;">Lucro:</strong> 
                    <span style="color: #000000; font-weight: 600;">${formatCurrency(region.profit)}</span>
                </p>
                <p style="margin: 8px 0; color: #000000; font-size: 14px; font-weight: 500;">
                    <strong style="color: #000000;">Status:</strong> 
                    <span style="color: ${markerColor}; font-weight: 600; text-transform: capitalize;">
                        ${region.status === 'high' ? 'Alto' : region.status === 'medium' ? 'Médio' : 'Baixo'}
                    </span>
                </p>
            </div>
        `);
        
        mapMarkers.push(marker);
    });
}

// Renderiza o mapa inicialmente
renderMap();

// ============================================
// UPDATE CHARTS THEME
// ============================================
function updateChartsTheme() {
    // Atualiza a cor dos gráficos quando o tema muda
    const root = getComputedStyle(document.documentElement);
    Chart.defaults.color = root.getPropertyValue('--text-secondary');
    
    [revenueExpenseChart, costDistributionChart, monthlyPerformanceChart, growthTrendChart].forEach(chart => {
        if (chart) chart.update();
    });
}

// ============================================
// LOGOUT & RESPONSIVE
// ============================================
// SCROLL TO MAP
// ============================================
const mapLink = document.getElementById('mapLink');
if (mapLink) {
    mapLink.addEventListener('click', (e) => {
        e.preventDefault();
        const mapSection = document.getElementById('map');
        if (mapSection) {
            mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Remove active de todos e adiciona ao link do mapa temporariamente
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            mapLink.classList.add('active');
            
            // Volta o Dashboard para ativo depois de 2 segundos
            setTimeout(() => {
                document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                document.querySelector('.nav-item').classList.add('active');
            }, 2000);
        }
    });
}

// ============================================
document.querySelector('.logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
});

if (window.innerWidth <= 768) {
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });
}

console.log('🚀 Dashboard carregado com sucesso!');
console.log('📊 Versão aprimorada com API financeira, temas e filtros');
console.log('🎨 Tema atual:', savedTheme);

// ============================================
// INICIALIZA DASHBOARD COM DADOS DO ANO COMPLETO
// ============================================
updateDataByDateRange(365);
