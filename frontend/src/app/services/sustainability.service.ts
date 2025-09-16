import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface SustainabilityMetrics {
  totalNoShows: number;
  autoReleasedRooms: number;
  hoursSaved: number;
  energySavedKwh: number;
  co2ReductionKg: number;
  treesEquivalent: number;
  overallGreenScore: number;
}

export interface TeamGreenScore {
  teamName: string;
  department: string;
  greenScore: number;
  noShowRate: number;
  efficiencyRate: number;
  badge?: string;
}

export interface SustainabilityReport {
  metrics: SustainabilityMetrics;
  teamScores: TeamGreenScore[];
  monthlyTrends: { month: string; hoursSaved: number; co2Reduction: number }[];
  badges: { teamName: string; badge: string; achievement: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class SustainabilityService {
  private readonly ENERGY_PER_HOUR_KWH = 2.5; // Average room energy consumption per hour
  private readonly CO2_PER_KWH = 0.4; // kg CO2 per kWh
  private readonly TREES_PER_KG_CO2 = 0.05; // Trees equivalent per kg CO2

  getSustainabilityReport(): Observable<SustainabilityReport> {
    // Mock data - replace with actual API call
    const mockData: SustainabilityReport = {
      metrics: {
        totalNoShows: 45,
        autoReleasedRooms: 32,
        hoursSaved: 128,
        energySavedKwh: 320,
        co2ReductionKg: 128,
        treesEquivalent: 6.4,
        overallGreenScore: 87
      },
      teamScores: [
        { teamName: 'Engineering', department: 'Technology', greenScore: 92, noShowRate: 5, efficiencyRate: 95, badge: 'Eco Champion' },
        { teamName: 'Marketing', department: 'Business', greenScore: 88, noShowRate: 8, efficiencyRate: 92, badge: 'Green Leader' },
        { teamName: 'Sales', department: 'Business', greenScore: 85, noShowRate: 12, efficiencyRate: 88 },
        { teamName: 'HR', department: 'Operations', greenScore: 90, noShowRate: 6, efficiencyRate: 94, badge: 'Sustainability Star' },
        { teamName: 'Finance', department: 'Operations', greenScore: 82, noShowRate: 15, efficiencyRate: 85 },
        { teamName: 'Design', department: 'Technology', greenScore: 89, noShowRate: 7, efficiencyRate: 93 }
      ],
      monthlyTrends: [
        { month: 'Jan', hoursSaved: 95, co2Reduction: 38 },
        { month: 'Feb', hoursSaved: 110, co2Reduction: 44 },
        { month: 'Mar', hoursSaved: 128, co2Reduction: 51 },
        { month: 'Apr', hoursSaved: 142, co2Reduction: 57 },
        { month: 'May', hoursSaved: 135, co2Reduction: 54 },
        { month: 'Jun', hoursSaved: 128, co2Reduction: 51 }
      ],
      badges: [
        { teamName: 'Engineering', badge: 'Eco Champion', achievement: 'Lowest no-show rate (5%)' },
        { teamName: 'Marketing', badge: 'Green Leader', achievement: 'Highest efficiency improvement' },
        { teamName: 'HR', badge: 'Sustainability Star', achievement: 'Best overall green practices' }
      ]
    };

    return of(mockData);
  }

  exportSustainabilityReport(format: 'csv' | 'pdf'): Observable<Blob> {
    // Mock export - replace with actual implementation
    const csvContent = `Team,Green Score,No-Show Rate,Efficiency Rate,Badge
Engineering,92,5%,95%,Eco Champion
Marketing,88,8%,92%,Green Leader
Sales,85,12%,88%,
HR,90,6%,94%,Sustainability Star
Finance,82,15%,85%,
Design,89,7%,93%,`;

    const blob = new Blob([csvContent], { type: format === 'csv' ? 'text/csv' : 'application/pdf' });
    return of(blob);
  }

  calculateGreenScore(noShowRate: number, efficiencyRate: number): number {
    // Green score calculation: 70% efficiency weight, 30% no-show penalty
    const efficiencyScore = efficiencyRate;
    const noShowPenalty = Math.max(0, 100 - (noShowRate * 2));
    return Math.round((efficiencyScore * 0.7) + (noShowPenalty * 0.3));
  }
}