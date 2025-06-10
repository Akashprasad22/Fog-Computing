// DOM Elements
const optimizeBtn = document.getElementById('optimize-btn');
const resetBtn = document.getElementById('reset-btn');
const taskTypeSelect = document.getElementById('task-type');
const deviceCountInput = document.getElementById('device-count');
const deviceCountValue = document.getElementById('device-count-value');
const allocationStrategySelect = document.getElementById('allocation-strategy');
const edgeDevices = document.querySelectorAll('.edge-device');

// Metrics Elements
const responseTimeEl = document.getElementById('response-time');
const energyConsumptionEl = document.getElementById('energy-consumption');
const resourceUtilizationEl = document.getElementById('resource-utilization');
const costEfficiencyEl = document.getElementById('cost-efficiency');

// Fog Nodes and Cloud Server Stats
const fogNodes = [
    {
        id: 'fog-node-1',
        cpuEl: document.getElementById('fog1-cpu'),
        memoryEl: document.getElementById('fog1-memory'),
        storageEl: document.getElementById('fog1-storage'),
        proximity: 1, // Closest to devices 1 and 2
        energyEfficiency: 0.8, // High efficiency
        baseStats: { cpu: 30, memory: 25, storage: 20 }
    },
    {
        id: 'fog-node-2',
        cpuEl: document.getElementById('fog2-cpu'),
        memoryEl: document.getElementById('fog2-memory'),
        storageEl: document.getElementById('fog2-storage'),
        proximity: 2, // Medium proximity
        energyEfficiency: 0.6, // Medium efficiency
        baseStats: { cpu: 40, memory: 35, storage: 30 }
    },
    {
        id: 'fog-node-3',
        cpuEl: document.getElementById('fog3-cpu'),
        memoryEl: document.getElementById('fog3-memory'),
        storageEl: document.getElementById('fog3-storage'),
        proximity: 3, // Closest to devices 4 and 5
        energyEfficiency: 0.9, // Very high efficiency
        baseStats: { cpu: 20, memory: 15, storage: 25 }
    }
];

const cloudServer = {
    cpuEl: document.getElementById('cloud-cpu'),
    memoryEl: document.getElementById('cloud-memory'),
    storageEl: document.getElementById('cloud-storage'),
    baseStats: { cpu: 10, memory: 15, storage: 5 }
};

// Initialize the simulation
function initSimulation() {
    // Set initial device count
    updateActiveDevices(parseInt(deviceCountInput.value));
    
    // Update device count display
    deviceCountInput.addEventListener('input', function() {
        deviceCountValue.textContent = this.value;
        updateActiveDevices(parseInt(this.value));
    });
    
    // Set up optimize button
    optimizeBtn.addEventListener('click', optimizeResources);
    
    // Set up reset button
    resetBtn.addEventListener('click', resetSimulation);
    
    // Make edge devices clickable
    edgeDevices.forEach(device => {
        device.addEventListener('click', function() {
            this.classList.toggle('active');
            updateDeviceCount();
        });
    });
    
    // Initial resource allocation
    resetSimulation();
}

// Update active devices based on count
function updateActiveDevices(count) {
    edgeDevices.forEach((device, index) => {
        if (index < count) {
            device.classList.add('active');
        } else {
            device.classList.remove('active');
        }
    });
}

// Update device count based on active devices
function updateDeviceCount() {
    const activeCount = document.querySelectorAll('.edge-device.active').length;
    deviceCountInput.value = activeCount;
    deviceCountValue.textContent = activeCount;
}

// Reset simulation to default values
function resetSimulation() {
    // Reset fog nodes to base stats
    fogNodes.forEach(node => {
        node.cpuEl.textContent = node.baseStats.cpu + '%';
        node.memoryEl.textContent = node.baseStats.memory + '%';
        node.storageEl.textContent = node.baseStats.storage + '%';
        
        // Reset visual state
        document.getElementById(node.id).style.transform = '';
        document.getElementById(node.id).style.boxShadow = '';
    });
    
    // Reset cloud server
    cloudServer.cpuEl.textContent = cloudServer.baseStats.cpu + '%';
    cloudServer.memoryEl.textContent = cloudServer.baseStats.memory + '%';
    cloudServer.storageEl.textContent = cloudServer.baseStats.storage + '%';
    
    // Reset metrics
    responseTimeEl.textContent = '120 ms';
    energyConsumptionEl.textContent = 'Medium';
    resourceUtilizationEl.textContent = '65%';
    costEfficiencyEl.textContent = 'High';
    
    // Reset visual effects
    document.querySelectorAll('.fog-node, .cloud-server').forEach(el => {
        el.style.backgroundColor = '';
    });
}

// Optimize resource allocation based on selected strategy
function optimizeResources() {
    const taskType = taskTypeSelect.value;
    const strategy = allocationStrategySelect.value;
    const activeDeviceCount = parseInt(deviceCountInput.value);
    
    // Reset any previous optimization visual effects
    document.querySelectorAll('.fog-node, .cloud-server').forEach(el => {
        el.style.backgroundColor = '';
    });
    
    // Calculate new resource allocation
    const allocation = calculateResourceAllocation(taskType, strategy, activeDeviceCount);
    
    // Apply new allocation to fog nodes
    fogNodes.forEach((node, index) => {
        const nodeAllocation = allocation.fogNodes[index];
        
        // Update stats with animation
        animateValue(node.cpuEl, parseInt(node.cpuEl.textContent), nodeAllocation.cpu);
        animateValue(node.memoryEl, parseInt(node.memoryEl.textContent), nodeAllocation.memory);
        animateValue(node.storageEl, parseInt(node.storageEl.textContent), nodeAllocation.storage);
        
        // Visual feedback for load
        const load = (nodeAllocation.cpu + nodeAllocation.memory + nodeAllocation.storage) / 3;
        const nodeEl = document.getElementById(node.id);
        
        if (load > 70) {
            nodeEl.style.backgroundColor = '#ffebee'; // Light red for high load
        } else if (load > 50) {
            nodeEl.style.backgroundColor = '#fff8e1'; // Light yellow for medium load
        } else {
            nodeEl.style.backgroundColor = '#e8f5e9'; // Light green for low load
        }
        
        // Apply scale effect to most utilized nodes
        if (nodeAllocation.isMain) {
            nodeEl.style.transform = 'scale(1.05)';
            nodeEl.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
        }
    });
    
    // Update cloud server
    animateValue(cloudServer.cpuEl, parseInt(cloudServer.cpuEl.textContent), allocation.cloud.cpu);
    animateValue(cloudServer.memoryEl, parseInt(cloudServer.memoryEl.textContent), allocation.cloud.memory);
    animateValue(cloudServer.storageEl, parseInt(cloudServer.storageEl.textContent), allocation.cloud.storage);
    
    // Update metrics
    updateMetrics(allocation.metrics);
}

// Calculate resource allocation based on strategy
function calculateResourceAllocation(taskType, strategy, deviceCount) {
    // Base allocation that will be modified based on strategy
    let allocation = {
        fogNodes: [
            { cpu: 30, memory: 25, storage: 20, isMain: false },
            { cpu: 40, memory: 35, storage: 30, isMain: false },
            { cpu: 20, memory: 15, storage: 25, isMain: false }
        ],
        cloud: { cpu: 10, memory: 15, storage: 5 },
        metrics: {
            responseTime: '120 ms',
            energyConsumption: 'Medium',
            resourceUtilization: '65%',
            costEfficiency: 'High'
        }
    };
    
    // Adjust based on task type
    switch (taskType) {
        case 'compute':
            // Increase CPU usage across nodes
            allocation.fogNodes.forEach(node => { node.cpu += 20; });
            allocation.cloud.cpu += 15;
            break;
            
        case 'memory':
            // Increase memory usage across nodes
            allocation.fogNodes.forEach(node => { node.memory += 20; });
            allocation.cloud.memory += 15;
            break;
            
        case 'storage':
            // Increase storage usage across nodes
            allocation.fogNodes.forEach(node => { node.storage += 20; });
            allocation.cloud.storage += 15;
            break;
            
        case 'latency':
            // Prioritize fog nodes over cloud
            allocation.fogNodes.forEach(node => { 
                node.cpu += 15; 
                node.memory += 10;
            });
            allocation.cloud.cpu -= 5;
            break;
    }
    
    // Apply allocation strategy
    switch (strategy) {
        case 'proximity':
            // Prioritize nodes closer to devices
            if (deviceCount <= 2) {
                allocation.fogNodes[0].cpu += 20;
                allocation.fogNodes[0].memory += 15;
                allocation.fogNodes[0].storage += 10;
                allocation.fogNodes[0].isMain = true;
            } else if (deviceCount <= 4) {
                allocation.fogNodes[0].cpu += 15;
                allocation.fogNodes[1].cpu += 15;
                allocation.fogNodes[0].memory += 10;
                allocation.fogNodes[1].memory += 10;
                allocation.fogNodes[0].isMain = true;
                allocation.fogNodes[1].isMain = true;
            } else {
                allocation.fogNodes.forEach(node => {
                    node.cpu += 10;
                    node.memory += 5;
                    node.isMain = true;
                });
            }
            allocation.metrics.responseTime = '45 ms';
            allocation.metrics.energyConsumption = 'High';
            break;
            
        case 'load':
            // Distribute load evenly
            const loadPerNode = Math.min(25, 10 * deviceCount / 3);
            allocation.fogNodes.forEach(node => {
                node.cpu += loadPerNode;
                node.memory += loadPerNode * 0.8;
                node.storage += loadPerNode * 0.5;
                node.isMain = true;
            });
            allocation.metrics.responseTime = '85 ms';
            allocation.metrics.resourceUtilization = '80%';
            break;
            
        case 'energy':
            // Prioritize energy-efficient nodes
            allocation.fogNodes[2].cpu += 30; // Node 3 is most efficient
            allocation.fogNodes[2].memory += 25;
            allocation.fogNodes[2].storage += 20;
            allocation.fogNodes[0].cpu += 15; // Node 1 is second most efficient
            allocation.fogNodes[0].memory += 10;
            allocation.fogNodes[0].storage += 5;
            allocation.fogNodes[2].isMain = true;
            allocation.fogNodes[0].isMain = true;
            allocation.metrics.energyConsumption = 'Low';
            allocation.metrics.costEfficiency = 'Very High';
            break;
            
        case 'hybrid':
            // Balanced approach
            if (deviceCount <= 3) {
                // For fewer devices, prioritize proximity and energy
                allocation.fogNodes[0].cpu += 20;
                allocation.fogNodes[2].cpu += 20;
                allocation.fogNodes[0].memory += 15;
                allocation.fogNodes[2].memory += 15;
                allocation.fogNodes[0].isMain = true;
                allocation.fogNodes[2].isMain = true;
            } else {
                // For more devices, use all nodes but weight by efficiency
                allocation.fogNodes[0].cpu += 15;
                allocation.fogNodes[1].cpu += 10;
                allocation.fogNodes[2].cpu += 20;
                allocation.fogNodes[0].memory += 10;
                allocation.fogNodes[1].memory += 5;
                allocation.fogNodes[2].memory += 15;
                allocation.fogNodes.forEach(node => { node.isMain = true; });
            }
            allocation.metrics.responseTime = '65 ms';
            allocation.metrics.energyConsumption = 'Medium-Low';
            allocation.metrics.resourceUtilization = '75%';
            allocation.metrics.costEfficiency = 'High';
            break;
    }
    
    // Ensure values stay within reasonable ranges (0-100%)
    allocation.fogNodes.forEach(node => {
        node.cpu = Math.min(95, Math.max(5, node.cpu));
        node.memory = Math.min(95, Math.max(5, node.memory));
        node.storage = Math.min(95, Math.max(5, node.storage));
    });
    
    allocation.cloud.cpu = Math.min(95, Math.max(5, allocation.cloud.cpu));
    allocation.cloud.memory = Math.min(95, Math.max(5, allocation.cloud.memory));
    allocation.cloud.storage = Math.min(95, Math.max(5, allocation.cloud.storage));
    
    return allocation;
}

// Update metrics display
function updateMetrics(metrics) {
    responseTimeEl.textContent = metrics.responseTime;
    energyConsumptionEl.textContent = metrics.energyConsumption;
    resourceUtilizationEl.textContent = metrics.resourceUtilization;
    costEfficiencyEl.textContent = metrics.costEfficiency;
}

// Animate value changes
function animateValue(element, start, end) {
    const duration = 1000; // ms
    const startTime = performance.now();
    
    function updateValue(timestamp) {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = Math.floor(start + progress * (end - start));
        
        element.textContent = value + '%';
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    }
    
    requestAnimationFrame(updateValue);
}

// Initialize the simulation when the page loads
window.addEventListener('DOMContentLoaded', initSimulation);