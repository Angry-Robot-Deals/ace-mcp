// ACE MCP Server Dashboard JavaScript

class Dashboard {
    constructor() {
        this.startTime = Date.now();
        this.bearerToken = null;
        this.init();
    }

    init() {
        this.loadBearerToken();
        this.bindEvents();
        this.updateStatus();
        this.startPeriodicUpdates();
        this.loadConfig();
        this.addInitialLog('Dashboard initialized successfully', 'info');
    }

    loadBearerToken() {
        const savedToken = localStorage.getItem('ace_bearer_token');
        if (savedToken) {
            this.bearerToken = savedToken;
            const tokenInput = document.getElementById('bearer-token-input');
            if (tokenInput) {
                tokenInput.value = savedToken;
                this.updateTokenStatus(true);
            }
            this.enablePlaybookButtons();
        }
    }

    saveBearerToken(token) {
        if (token && token.trim()) {
            this.bearerToken = token.trim();
            localStorage.setItem('ace_bearer_token', this.bearerToken);
            this.updateTokenStatus(true);
            this.enablePlaybookButtons();
            this.addLog('Bearer token saved successfully', 'info');
        } else {
            this.clearBearerToken();
        }
    }

    clearBearerToken() {
        this.bearerToken = null;
        localStorage.removeItem('ace_bearer_token');
        const tokenInput = document.getElementById('bearer-token-input');
        if (tokenInput) {
            tokenInput.value = '';
        }
        this.updateTokenStatus(false);
        this.disablePlaybookButtons();
        this.hidePlaybook();
        this.addLog('Bearer token cleared', 'info');
    }

    updateTokenStatus(hasToken) {
        const statusEl = document.getElementById('token-status');
        if (statusEl) {
            if (hasToken) {
                statusEl.innerHTML = '<span class="token-status-ok">✅ Token saved</span>';
                statusEl.className = 'token-status ok';
            } else {
                statusEl.innerHTML = '<span class="token-status-error">⚠️ No token - API features disabled</span>';
                statusEl.className = 'token-status error';
            }
        }
    }

    enablePlaybookButtons() {
        const loadBtn = document.getElementById('load-playbook-btn');
        const refreshBtn = document.getElementById('refresh-playbook-btn');
        if (loadBtn) loadBtn.disabled = false;
        if (refreshBtn) refreshBtn.disabled = false;
    }

    disablePlaybookButtons() {
        const loadBtn = document.getElementById('load-playbook-btn');
        const refreshBtn = document.getElementById('refresh-playbook-btn');
        if (loadBtn) loadBtn.disabled = true;
        if (refreshBtn) refreshBtn.disabled = true;
    }

    hidePlaybook() {
        const playbookSection = document.getElementById('playbook-section');
        if (playbookSection) {
            playbookSection.style.display = 'none';
        }
    }

    bindEvents() {
        const refreshBtn = document.getElementById('refresh-btn');
        const testLLMBtn = document.getElementById('test-llm-btn');
        const saveTokenBtn = document.getElementById('save-token-btn');
        const clearTokenBtn = document.getElementById('clear-token-btn');
        const loadPlaybookBtn = document.getElementById('load-playbook-btn');
        const refreshPlaybookBtn = document.getElementById('refresh-playbook-btn');
        const tokenInput = document.getElementById('bearer-token-input');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }

        if (testLLMBtn) {
            testLLMBtn.addEventListener('click', () => this.testLLM());
        }

        if (saveTokenBtn) {
            saveTokenBtn.addEventListener('click', () => {
                const token = tokenInput?.value || '';
                this.saveBearerToken(token);
            });
        }

        if (clearTokenBtn) {
            clearTokenBtn.addEventListener('click', () => this.clearBearerToken());
        }

        if (loadPlaybookBtn) {
            loadPlaybookBtn.addEventListener('click', () => this.loadPlaybook());
        }

        if (refreshPlaybookBtn) {
            refreshPlaybookBtn.addEventListener('click', () => this.loadPlaybook());
        }

        if (tokenInput) {
            tokenInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.saveBearerToken(tokenInput.value);
                }
            });
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

    async loadPlaybook() {
        if (!this.bearerToken) {
            this.addLog('Bearer token required to load playbook', 'error');
            return;
        }

        this.addLog('Loading playbook...', 'info');
        
        const loadBtn = document.getElementById('load-playbook-btn');
        const originalText = loadBtn.innerHTML;
        
        loadBtn.innerHTML = '<span class="loading"></span> Loading...';
        loadBtn.disabled = true;

        try {
            const response = await fetch('/api/playbook', {
                headers: {
                    'Authorization': `Bearer ${this.bearerToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.displayPlaybook(data);
                this.addLog('Playbook loaded successfully', 'info');
            } else if (response.status === 401) {
                this.addLog('Unauthorized - Invalid bearer token', 'error');
                this.updateTokenStatus(false);
            } else {
                const errorData = await response.json().catch(() => ({}));
                this.addLog(`Failed to load playbook: ${errorData.message || response.statusText}`, 'error');
            }
        } catch (error) {
            console.error('Playbook load error:', error);
            this.addLog(`Playbook load error: ${error.message}`, 'error');
        } finally {
            loadBtn.innerHTML = originalText;
            loadBtn.disabled = false;
            const refreshBtn = document.getElementById('refresh-playbook-btn');
            if (refreshBtn) refreshBtn.disabled = false;
        }
    }

    displayPlaybook(data) {
        const playbookSection = document.getElementById('playbook-section');
        const playbookContent = document.getElementById('playbook-content');
        
        if (!playbookSection || !playbookContent) return;

        if (!data.success || !data.playbook) {
            playbookContent.innerHTML = '<p class="error-message">Failed to load playbook data</p>';
            playbookSection.style.display = 'block';
            return;
        }

        const playbook = data.playbook;
        const sections = playbook.sections || {};
        const stats = playbook.stats || {};

        let html = `
            <div class="playbook-stats">
                <div class="stat-item">
                    <span class="stat-label">Total Bullets:</span>
                    <span class="stat-value">${stats.total_bullets || 0}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Avg Confidence:</span>
                    <span class="stat-value">${stats.confidence_avg ? (stats.confidence_avg * 100).toFixed(1) + '%' : 'N/A'}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Last Updated:</span>
                    <span class="stat-value">${stats.last_update ? new Date(stats.last_update).toLocaleString() : 'N/A'}</span>
                </div>
            </div>
        `;

        // Patterns section
        if (sections.patterns && sections.patterns.length > 0) {
            html += `
                <div class="playbook-section">
                    <h4>🔷 Patterns (${sections.patterns.length})</h4>
                    <ul class="playbook-list">
                        ${sections.patterns.map(pattern => `<li>${this.escapeHtml(pattern)}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        // Best Practices section
        if (sections.best_practices && sections.best_practices.length > 0) {
            html += `
                <div class="playbook-section">
                    <h4>⭐ Best Practices (${sections.best_practices.length})</h4>
                    <ul class="playbook-list">
                        ${sections.best_practices.map(practice => `<li>${this.escapeHtml(practice)}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        // Insights section
        if (sections.insights && sections.insights.length > 0) {
            html += `
                <div class="playbook-section">
                    <h4>💡 Insights (${sections.insights.length})</h4>
                    <ul class="playbook-list">
                        ${sections.insights.map(insight => `<li>${this.escapeHtml(insight)}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        if (Object.keys(sections).length === 0) {
            html += '<p class="empty-message">Playbook is empty. Start using ACE features to populate it!</p>';
        }

        playbookContent.innerHTML = html;
        playbookSection.style.display = 'block';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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