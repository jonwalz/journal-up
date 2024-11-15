export type MetricType = 'resilience' | 'learning' | 'challenge' | 'feedback' | 'effort';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface Metric {
  id: string;
  userId: string;
  type: MetricType;
  value: number;
  notes?: string;
  createdAt: Date;
}

export interface MetricTrend {
  type: MetricType;
  change: number; // percentage change
  trend: 'increasing' | 'decreasing' | 'stable';
  averageValue: number;
  dataPoints: number;
}

export interface GrowthArea {
  type: MetricType;
  strength: number; // 0-1
  suggestions: string[];
}

export interface ProgressAnalysis {
  timeRange: DateRange;
  metrics: {
    [key in MetricType]?: MetricTrend;
  };
  topGrowthAreas: GrowthArea[];
  overallGrowth: number; // 0-1
  insights: string[];
  recommendations: string[];
}
