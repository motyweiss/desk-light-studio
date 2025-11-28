// Sync logging utility for debugging Home Assistant integration

interface SyncMetrics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  blockedUpdates: number;
  averageLatency: number;
  lastSyncTime: number;
}

class SyncLogger {
  private metrics: SyncMetrics = {
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    blockedUpdates: 0,
    averageLatency: 0,
    lastSyncTime: 0,
  };

  private latencies: number[] = [];

  logSync(duration: number, success: boolean) {
    this.metrics.totalSyncs++;
    this.metrics.lastSyncTime = Date.now();

    if (success) {
      this.metrics.successfulSyncs++;
      this.latencies.push(duration);
      
      // Keep only last 100 latencies
      if (this.latencies.length > 100) {
        this.latencies.shift();
      }
      
      // Calculate average
      this.metrics.averageLatency = 
        this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length;
    } else {
      this.metrics.failedSyncs++;
    }
  }

  logBlockedUpdate() {
    this.metrics.blockedUpdates++;
  }

  getMetrics(): SyncMetrics {
    return { ...this.metrics };
  }

  printSummary() {
    const successRate = this.metrics.totalSyncs > 0
      ? ((this.metrics.successfulSyncs / this.metrics.totalSyncs) * 100).toFixed(1)
      : '0';

    console.group('📊 Sync Statistics');
    console.log(`Total Syncs: ${this.metrics.totalSyncs}`);
    console.log(`✅ Successful: ${this.metrics.successfulSyncs} (${successRate}%)`);
    console.log(`❌ Failed: ${this.metrics.failedSyncs}`);
    console.log(`🚫 Blocked Updates: ${this.metrics.blockedUpdates}`);
    console.log(`⏱️  Average Latency: ${Math.round(this.metrics.averageLatency)}ms`);
    console.log(`🕐 Last Sync: ${new Date(this.metrics.lastSyncTime).toLocaleTimeString()}`);
    console.groupEnd();
  }

  reset() {
    this.metrics = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      blockedUpdates: 0,
      averageLatency: 0,
      lastSyncTime: 0,
    };
    this.latencies = [];
  }
}

export const syncLogger = new SyncLogger();

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).syncLogger = syncLogger;
  (window as any).printSyncStats = () => syncLogger.printSummary();
  console.log('💡 Debug commands available:');
  console.log('  - window.printSyncStats() - Show sync statistics');
  console.log('  - window.syncLogger.reset() - Reset statistics');
}
