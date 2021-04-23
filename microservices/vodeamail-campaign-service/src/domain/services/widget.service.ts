import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  ChartDashboardWidgetDto,
  DashboardWidgetDto,
} from '../../application/dtos/widget.dto';
import { DashboardWidgetView } from '../views/dashboard-widget.view';
import { ChartDashboardWidgetView } from '../views/chart-dashboard-widget.view';

@Injectable()
export class WidgetService {
  constructor(
    @InjectRepository(DashboardWidgetView)
    private readonly dashboardWidgetViewRepository: Repository<DashboardWidgetView>,
    @InjectRepository(ChartDashboardWidgetView)
    private readonly chartDashboardWidgetViewRepository: Repository<ChartDashboardWidgetView>,
  ) {}

  async dashboardWidget(dashboard: DashboardWidgetDto) {
    return await this.dashboardWidgetViewRepository.findOne({
      where: { organization_id: dashboard.organization_id },
    });
  }

  async chartDashboardWidget(chartDashboardWidgetDto: ChartDashboardWidgetDto) {
    return await this.chartDashboardWidgetViewRepository.find({
      where: { organization_id: chartDashboardWidgetDto.organization_id },
    });
  }
}
