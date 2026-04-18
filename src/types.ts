export type DQDimension = 'completeness' | 'consistency' | 'uniqueness' | 'validity' | 'accuracy' | 'timeliness';

export interface DQRule {
  id: string;
  name: string;
  dimension: DQDimension;
  targetTable: string;
  targetDataset: string;
  targetProject: string;
  config: {
    column?: string;
    type: 'null_check' | 'range_check' | 'format_check' | 'uniqueness_check' | 'business_rule';
    params: any;
  };
  threshold: number; // 0 to 100
  status: 'active' | 'inactive';
  alignment: {
    framework: 'DAMA-DMBOK' | 'ISO 8000' | 'ISO 25012' | 'DCAM';
    standardId: string;
  };
}

export interface DQScanResult {
  id: string;
  ruleId: string;
  timestamp: string;
  passedCount: number;
  failedCount: number;
  totalCount: number;
  score: number;
  details?: any;
}

export interface GCPAsset {
  id: string;
  name: string;
  type: 'project' | 'dataset' | 'table';
  parentId?: string;
}
