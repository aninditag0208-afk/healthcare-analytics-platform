// Global Analytics State Management System
// Tracks analysis queue, status updates, and cross-page state persistence

class AnalyticsState {
    constructor() {
        this.storageKey = 'healthcare_analytics_state';
        this.state = this.loadState();
        this.listeners = [];

        // Bind methods to preserve context
        this.addAnalysis = this.addAnalysis.bind(this);
        this.updateAnalysisStatus = this.updateAnalysisStatus.bind(this);
        this.getAnalyses = this.getAnalyses.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.notify = this.notify.bind(this);
    }

    // Load state from localStorage or initialize default state
    loadState() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const state = JSON.parse(saved);
                // Ensure we have the required structure
                return {
                    analyses: state.analyses || [],
                    currentSession: state.currentSession || null,
                    lastUpdated: state.lastUpdated || Date.now(),
                    sidebarCollapsed: state.sidebarCollapsed || false
                };
            }
        } catch (error) {
            console.warn('Failed to load analytics state:', error);
        }

        return {
            analyses: [
                // Default/demo analyses
                {
                    id: 'demo_1',
                    title: '5 payers?',
                    status: 'completed',
                    timestamp: Date.now() - (24 * 60 * 60 * 1000), // 1 day ago
                    indication: null,
                    analysisType: null
                },
                {
                    id: 'demo_2',
                    title: 'What are the top reasons for denials within UHC?',
                    status: 'in-progress',
                    timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
                    indication: null,
                    analysisType: null
                },
                {
                    id: 'demo_3',
                    title: 'Market Structure analysis',
                    status: 'completed',
                    timestamp: Date.now() - (6 * 60 * 60 * 1000), // 6 hours ago
                    indication: null,
                    analysisType: null
                },
                {
                    id: 'demo_4',
                    title: 'What share of patients get treated on Enhertu?',
                    status: 'completed',
                    timestamp: Date.now() - (12 * 60 * 60 * 1000), // 12 hours ago
                    indication: 'Breast Cancer',
                    analysisType: 'market-access'
                }
            ],
            currentSession: null,
            lastUpdated: Date.now(),
            sidebarCollapsed: false
        };
    }

    // Save state to localStorage
    saveState() {
        try {
            this.state.lastUpdated = Date.now();
            localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        } catch (error) {
            console.warn('Failed to save analytics state:', error);
        }
    }

    // Add a new analysis to the queue
    addAnalysis(indication, indicationDisplayName, analysisType, analysisDisplayName) {
        const analysis = {
            id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: `${indicationDisplayName} - ${analysisDisplayName}`,
            status: 'pending',
            timestamp: Date.now(),
            indication: indication,
            indicationDisplayName: indicationDisplayName,
            analysisType: analysisType,
            analysisDisplayName: analysisDisplayName,
            progress: 0
        };

        // Add to beginning of array (most recent first)
        this.state.analyses.unshift(analysis);

        // Keep only last 20 analyses to prevent storage bloat
        if (this.state.analyses.length > 20) {
            this.state.analyses = this.state.analyses.slice(0, 20);
        }

        this.state.currentSession = analysis.id;
        this.saveState();
        this.notify('analysisAdded', analysis);

        return analysis.id;
    }

    // Update analysis status
    updateAnalysisStatus(analysisId, status, progress = null) {
        const analysis = this.state.analyses.find(a => a.id === analysisId);
        if (analysis) {
            analysis.status = status;
            if (progress !== null) {
                analysis.progress = progress;
            }
            analysis.lastUpdated = Date.now();

            this.saveState();
            this.notify('analysisUpdated', analysis);
        }
    }

    // Get all analyses
    getAnalyses() {
        return [...this.state.analyses];
    }

    // Get current session analysis
    getCurrentAnalysis() {
        if (this.state.currentSession) {
            return this.state.analyses.find(a => a.id === this.state.currentSession);
        }
        return null;
    }

    // Set current session
    setCurrentSession(analysisId) {
        this.state.currentSession = analysisId;
        this.saveState();
        this.notify('sessionChanged', this.getCurrentAnalysis());
    }

    // Subscribe to state changes
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    // Notify all listeners of state changes
    notify(event, data) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.warn('State listener error:', error);
            }
        });
    }

    // Sidebar state management
    setSidebarCollapsed(collapsed) {
        this.state.sidebarCollapsed = collapsed;
        this.saveState();
        this.notify('sidebarToggled', collapsed);
    }

    isSidebarCollapsed() {
        return this.state.sidebarCollapsed;
    }

    // Get analysis by ID
    getAnalysisById(id) {
        return this.state.analyses.find(a => a.id === id);
    }

    // Remove analysis
    removeAnalysis(analysisId) {
        this.state.analyses = this.state.analyses.filter(a => a.id !== analysisId);
        if (this.state.currentSession === analysisId) {
            this.state.currentSession = null;
        }
        this.saveState();
        this.notify('analysisRemoved', analysisId);
    }

    // Clear all analyses
    clearAnalyses() {
        this.state.analyses = [];
        this.state.currentSession = null;
        this.saveState();
        this.notify('analysesCleared');
    }

    // Format timestamp for display
    formatTimestamp(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) {
            return 'Just now';
        } else if (minutes < 60) {
            return `${minutes} min ago`;
        } else if (hours < 24) {
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const date = new Date(timestamp);
            return date.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        }
    }

    // Get status display info
    getStatusInfo(status) {
        const statusMap = {
            'pending': {
                text: 'Pending',
                color: 'text-gray-500',
                bgColor: 'bg-gray-500',
                icon: 'fas fa-clock'
            },
            'in-progress': {
                text: 'In-Progress',
                color: 'text-orange-500',
                bgColor: 'bg-orange-500',
                icon: 'fas fa-spinner fa-spin'
            },
            'running': {
                text: 'Running',
                color: 'text-blue-500',
                bgColor: 'bg-blue-500',
                icon: 'fas fa-play'
            },
            'completed': {
                text: 'Completed',
                color: 'text-green-500',
                bgColor: 'bg-green-500',
                icon: 'fas fa-check'
            },
            'failed': {
                text: 'Failed',
                color: 'text-red-500',
                bgColor: 'bg-red-500',
                icon: 'fas fa-exclamation-triangle'
            }
        };

        return statusMap[status] || statusMap['pending'];
    }

    // Simulate analysis progress (for demo purposes)
    simulateAnalysisProgress(analysisId, duration = 5000) {
        let progress = 0;
        const interval = 100;
        const increment = 100 / (duration / interval);

        this.updateAnalysisStatus(analysisId, 'running', 0);

        const progressInterval = setInterval(() => {
            progress += increment;

            if (progress >= 100) {
                progress = 100;
                this.updateAnalysisStatus(analysisId, 'completed', 100);
                clearInterval(progressInterval);
            } else {
                this.updateAnalysisStatus(analysisId, 'running', Math.floor(progress));
            }
        }, interval);

        return progressInterval;
    }
}

// Create global instance
window.analyticsState = new AnalyticsState();

// Utility functions for easy access
window.addAnalysis = window.analyticsState.addAnalysis;
window.updateAnalysisStatus = window.analyticsState.updateAnalysisStatus;
window.getAnalyses = window.analyticsState.getAnalyses;

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsState;
}