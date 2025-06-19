// 食材データ
const ingredients = {
    'chicken-breast': { name: '鶏ささみ', protein: 28 },
    'chicken-thigh': { name: '鶏むね肉', protein: 23 },
    'beef': { name: '牛肉（赤身）', protein: 22 },
    'pork': { name: '豚肉（赤身）', protein: 23 },
    'white-fish': { name: '白身魚', protein: 18 },
    'blue-fish': { name: '青魚', protein: 19 }
};

// 年齢別タンパク質必要量
const proteinPerKg = {
    'adult': 6.5,
    'puppy': 9.0
};

let sliders = {};

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeSliders();
    setupEventListeners();
    updateResults();
});

function initializeSliders() {
    Object.keys(ingredients).forEach(id => {
        sliders[id] = document.getElementById(id);
    });
}

function setupEventListeners() {
    // 体重と年齢の変更を監視
    document.getElementById('dogWeight').addEventListener('input', updateResults);
    document.getElementById('dogAge').addEventListener('change', updateResults);
    
    // スライダーの変更を監視
    Object.values(sliders).forEach(slider => {
        slider.addEventListener('input', function() {
            updatePercentages();
            updateResults();
        });
    });
}

function updatePercentages() {
    const values = Object.values(sliders).map(s => parseInt(s.value));
    const total = values.reduce((sum, val) => sum + val, 0);
    
    if (total === 0) {
        // すべて0の場合は均等に分配
        const equalValue = Math.floor(100 / values.length);
        Object.values(sliders).forEach((slider, index) => {
            slider.value = equalValue;
        });
        updatePercentages();
        return;
    }
    
    // 合計が100%になるように正規化
    Object.values(sliders).forEach(slider => {
        const percentage = Math.round((parseInt(slider.value) / total) * 100);
        // スライダーの値も更新
        slider.value = percentage;
        slider.nextElementSibling.textContent = percentage + '%';
    });
    
    document.getElementById('totalPercentage').textContent = '100';
}

function updateResults() {
    const weight = parseFloat(document.getElementById('dogWeight').value);
    const age = document.getElementById('dogAge').value;
    
    if (!weight || weight <= 0) {
        document.getElementById('resultsSection').style.display = 'none';
        return;
    }
    
    // タンパク質必要量を計算
    const dailyProtein = weight * proteinPerKg[age];
    
    document.getElementById('dailyProtein').textContent = dailyProtein.toFixed(1);
    document.getElementById('proteinPerKg').textContent = proteinPerKg[age];
    
    // 各食材の必要量を計算
    const mealItems = document.getElementById('mealItems');
    mealItems.innerHTML = '';
    
    Object.keys(ingredients).forEach(id => {
        const slider = sliders[id];
        const percentage = parseInt(slider.nextElementSibling.textContent);
        const ingredient = ingredients[id];
        
        if (percentage > 0) {
            // その食材で必要なタンパク質の量
            const proteinNeeded = (dailyProtein * percentage) / 100;
            // 食材の必要量（g）
            const amountNeeded = (proteinNeeded / ingredient.protein) * 100;
            
            const mealItem = document.createElement('div');
            mealItem.className = 'meal-item';
            mealItem.innerHTML = `
                <span class="meal-item-name">${ingredient.name}</span>
                <span class="meal-item-amount">${amountNeeded.toFixed(1)}g</span>
            `;
            
            mealItems.appendChild(mealItem);
        }
    });
    
    document.getElementById('resultsSection').style.display = 'block';
}

// 初期パーセンテージを設定
updatePercentages(); 