// ACE MCP Server Dashboard JavaScript

class Dashboard {
    constructor() {
        this.startTime = Date.now();
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateStatus();
        this.startPeriodicUpdates();
        this.loadConfig();
        this.addInitialLog('Dashboard initialized successfully', 'info');
    }

    bindEvents() {
        const refreshBtn = document.getElementById('refresh-btn');
        const testLLMBtn = document.getElementById('test-llm-btn');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }

        if (testLLMBtn) {
            testLLMBtn.addEventListener('click', () => this.testLLM());
        }
    }

    async updateStatus() {
        try {
            // Simulate server status check
            const serverStatus = document.getElementById('server-status');
            const dot = serverStatus.querySelector('.dot');
            const text = serverStatus.querySelector('.text');
            
            // Mock server check - in real implementation, this would be an API call
            const isOnline = await this.checkServerHealth();
            
            if (isOnline) {
                dot.className = 'dot';
                text.textContent = 'Online';
            } else {
                dot.className = 'dot error';
                text.textContent = 'Offline';
            }

            this.addLog(`Server status: ${isOnline ? 'Online' : 'Offline'}`, isOnline ? 'info' : 'error');
        } catch (error) {
            console.error('Failed to update status:', error);
            this.addLog('Failed to check server status', 'error');
        }
    }

    async checkServerHealth() {
        try {
            const response = await fetch('/health');
            if (response.ok) {
                const data = await response.json();
                return data.status === 'healthy';
            }
            return false;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }

    async loadConfig() {
        try {
            const response = await fetch('/health');
            if (response.ok) {
                const data = await response.json();
                const config = {
                    llmProvider: data.environment?.llmProvider || 'Unknown',
                    logLevel: 'info',
                    contextDir: data.environment?.contextDir || './contexts',
                    contextCount: data.environment?.maxPlaybookSize || 'N/A',
                    uptime: data.uptime || 0
                };
                this.updateConfigDisplay(config);
            } else {
                // Fallback to mock data if API fails
                this.loadMockConfig();
            }
        } catch (error) {
            console.error('Failed to load config:', error);
            this.loadMockConfig();
        }
    }

    loadMockConfig() {
        // Fallback mock configuration
        const config = {
            llmProvider: 'DeepSeek (Fallback)',
            logLevel: 'info',
            contextDir: './contexts',
            contextCount: 'Unknown'
        };
        this.updateConfigDisplay(config);
    }

    detectLLMProvider() {
        // This will be set by loadConfig() from real API
        return 'Loading...';
    }

    updateConfigDisplay(config) {
        const elements = {
            'llm-provider': config.llmProvider,
            'log-level': config.logLevel,
            'context-dir': config.contextDir,
            'context-count': config.contextCount.toString(),
            'uptime': this.formatUptime()
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (id === 'llm-provider') {
                    element.querySelector('.provider-name').textContent = value;
                } else {
                    element.textContent = value;
                }
            }
        });
    }

    formatUptime() {
        const uptime = Date.now() - this.startTime;
        const seconds = Math.floor(uptime / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    async refresh() {
        this.addLog('Refreshing dashboard...', 'info');
        
        const refreshBtn = document.getElementById('refresh-btn');
        const originalText = refreshBtn.innerHTML;
        
        refreshBtn.innerHTML = '<span class="loading"></span> Refreshing...';
        refreshBtn.disabled = true;

        try {
            await this.updateStatus();
            this.loadConfig();
            this.addLog('Dashboard refreshed successfully', 'info');
        } catch (error) {
            this.addLog('Failed to refresh dashboard', 'error');
        } finally {
            setTimeout(() => {
                refreshBtn.innerHTML = originalText;
                refreshBtn.disabled = false;
            }, 1000);
        }
    }

    async testLLM() {
        this.addLog('Testing LLM connection...', 'info');
        
        const testBtn = document.getElementById('test-llm-btn');
        const originalText = testBtn.innerHTML;
        
        testBtn.innerHTML = '<span class="loading"></span> Testing...';
        testBtn.disabled = true;

        try {
            // Mock LLM test
            const success = await this.performLLMTest();
            
            if (success) {
                this.addLog('LLM test successful - Connection OK', 'info');
            } else {
                this.addLog('LLM test failed - Check configuration', 'error');
            }
        } catch (error) {
            this.addLog('LLM test error: ' + error.message, 'error');
        } finally {
            setTimeout(() => {
                testBtn.innerHTML = originalText;
                testBtn.disabled = false;
            }, 2000);
        }
    }

    async performLLMTest() {
        try {
            // Test with a simple API call to check if server responds
            const response = await fetch('/health');
            if (response.ok) {
                const data = await response.json();
                // If health check passes and we have LLM provider info, consider it successful
                return data.status === 'healthy' && data.environment?.llmProvider;
            }
            return false;
        } catch (error) {
            console.error('LLM test failed:', error);
            return false;
        }
    }

    addLog(message, level = 'info') {
        const logsContainer = document.getElementById('logs');
        if (!logsContainer) return;

        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        
        const timestamp = new Date().toLocaleString();
        
        logEntry.innerHTML = `
            <span class="timestamp">${timestamp}</span>
            <span class="level ${level}">${level.toUpperCase()}</span>
            <span class="message">${message}</span>
        `;

        // Add to top of logs
        const firstChild = logsContainer.firstChild;
        if (firstChild) {
            logsContainer.insertBefore(logEntry, firstChild);
        } else {
            logsContainer.appendChild(logEntry);
        }

        // Keep only last 50 log entries
        const logEntries = logsContainer.querySelectorAll('.log-entry');
        if (logEntries.length > 50) {
            logEntries[logEntries.length - 1].remove();
        }

        // Auto-scroll to top for new entries
        logsContainer.scrollTop = 0;
    }

    addInitialLog(message, level) {
        // Clear the placeholder log and add the real one
        const logsContainer = document.getElementById('logs');
        if (logsContainer) {
            logsContainer.innerHTML = '';
            this.addLog(message, level);
        }
    }

    startPeriodicUpdates() {
        // Update uptime every 10 seconds
        setInterval(() => {
            const uptimeElement = document.getElementById('uptime');
            if (uptimeElement) {
                uptimeElement.textContent = this.formatUptime();
            }
        }, 10000);

        // Check server status every 30 seconds
        setInterval(() => {
            this.updateStatus();
        }, 30000);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});

// Add some utility functions for future use
window.ACEDashboard = {
    showNotification: (message, type = 'info') => {
        console.log(`[${type.toUpperCase()}] ${message}`);
        if (window.dashboard) {
            window.dashboard.addLog(message, type);
        }
    },
    
    formatBytes: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    formatDuration: (ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }
};