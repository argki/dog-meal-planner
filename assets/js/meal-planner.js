// 食材データ
const ingredients = {
    'chicken-breast': { name: '鶏ささみ', protein: 28 },
    'chicken-thigh': { name: '鶏むね肉', protein: 23 },
    'beef': { name: '牛肉（赤身）', protein: 22 },
    'pork': { name: '豚肉（赤身）', protein: 23 },
    'white-fish': { name: '白身魚', protein: 18 },
    'blue-fish': { name: '青魚', protein: 19 },
    'egg': { name: '卵', protein: 12.3 },
    'tofu': { name: '絹豆腐', protein: 7.2 }
};

// 年齢別タンパク質必要量
const proteinPerKg = {
    'adult': 6.5,
    'puppy': 9.0
};

let sliders = {};
let isAdjusting = false; // 調整中フラグ

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeSliders();
    setupEventListeners();
    // 初期値を均等に分配
    distributeEvenly();
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
            if (!isAdjusting) {
                adjustOtherSliders(this);
                updatePercentages();
                updateResults();
            }
        });
    });
}

function distributeEvenly() {
    const sliderCount = Object.keys(sliders).length;
    const equalValue = Math.floor(100 / sliderCount);
    const remainder = 100 % sliderCount;
    
    let currentTotal = 0;
    Object.values(sliders).forEach((slider, index) => {
        let value = equalValue;
        if (index < remainder) {
            value += 1;
        }
        slider.value = value;
        currentTotal += value;
    });
    
    updatePercentages();
}

function adjustOtherSliders(changedSlider) {
    isAdjusting = true;
    
    const sliderIds = Object.keys(sliders);
    const changedIndex = sliderIds.findIndex(id => sliders[id] === changedSlider);
    const changedValue = parseInt(changedSlider.value);
    
    // 他のスライダーの値を取得
    const otherValues = [];
    sliderIds.forEach((id, index) => {
        if (index !== changedIndex) {
            otherValues.push(parseInt(sliders[id].value));
        }
    });
    
    const otherTotal = otherValues.reduce((sum, val) => sum + val, 0);
    const newTotal = changedValue + otherTotal;
    
    if (newTotal > 100) {
        // 合計が100を超える場合、他のスライダーを比例的に減らす
        const excess = newTotal - 100;
        const reductionRatio = (otherTotal - excess) / otherTotal;
        
        sliderIds.forEach((id, index) => {
            if (index !== changedIndex) {
                const newValue = Math.max(0, Math.round(parseInt(sliders[id].value) * reductionRatio));
                sliders[id].value = newValue;
            }
        });
    } else if (newTotal < 100) {
        // 合計が100未満の場合、他のスライダーを比例的に増やす
        const deficit = 100 - newTotal;
        if (otherTotal > 0) {
            const increaseRatio = (otherTotal + deficit) / otherTotal;
            
            sliderIds.forEach((id, index) => {
                if (index !== changedIndex) {
                    const newValue = Math.min(100, Math.round(parseInt(sliders[id].value) * increaseRatio));
                    sliders[id].value = newValue;
                }
            });
        } else {
            // 他のスライダーがすべて0の場合、均等に分配
            const equalValue = Math.floor(deficit / (sliderIds.length - 1));
            const remainder = deficit % (sliderIds.length - 1);
            
            let distributed = 0;
            sliderIds.forEach((id, index) => {
                if (index !== changedIndex) {
                    let value = equalValue;
                    if (distributed < remainder) {
                        value += 1;
                    }
                    sliders[id].value = value;
                    distributed++;
                }
            });
        }
    }
    
    isAdjusting = false;
}

function updatePercentages() {
    Object.values(sliders).forEach(slider => {
        const percentage = parseInt(slider.value);
        const percentageElement = slider.parentElement.querySelector('.percentage');
        percentageElement.textContent = percentage + '%';
    });
    
    const total = Object.values(sliders).reduce((sum, slider) => sum + parseInt(slider.value), 0);
    document.getElementById('totalPercentage').textContent = total;
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
        const percentageElement = slider.parentElement.querySelector('.percentage');
        const percentage = parseInt(percentageElement.textContent);
        const ingredient = ingredients[id];
        
        if (percentage > 0) {
            // その食材で必要なタンパク質の量
            const proteinNeeded = (dailyProtein * percentage) / 100;
            // 食材の必要量（g）
            const amountNeeded = (proteinNeeded / ingredient.protein) * 100;
            
            const mealItem = document.createElement('div');
            mealItem.className = 'meal-item';
            mealItem.innerHTML = `
                <div>
                    <span class="meal-item-name">${ingredient.name}</span>
                    <div class="meal-item-formula">${dailyProtein.toFixed(1)}g × ${percentage}% ÷ ${ingredient.protein}g/100g = ${amountNeeded.toFixed(1)}g</div>
                </div>
                <span class="meal-item-amount">${amountNeeded.toFixed(1)}g</span>
            `;
            
            mealItems.appendChild(mealItem);
        }
    });
    
    document.getElementById('resultsSection').style.display = 'block';
} 