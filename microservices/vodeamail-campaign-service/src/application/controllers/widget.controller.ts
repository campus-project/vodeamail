import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WidgetService } from '../../domain/services/widget.service';
import {
  ChartDashboardWidgetDto,
  DashboardWidgetDto,
} from '../dtos/widget.dto';

@Controller()
export class WidgetController {
  constructor(
    @Inject('CAMPAIGN_WIDGET_SERVICE')
    private readonly widgetService: WidgetService,
  ) {}

  @MessagePattern('MS_CAMPAIGN_DASHBOARD_WIDGET')
  dashboardWidget(@Payload() dashboardWidgetDto: DashboardWidgetDto) {
    return this.widgetService.dashboardWidget(dashboardWidgetDto);
  }

  @MessagePattern('MS_CAMPAIGN_CHART_DASHBOARD_WIDGET')
  chartDashboardWidget(
    @Payload() chartDashboardWidgetDto: ChartDashboardWidgetDto,
  ) {
    return this.widgetService.chartDashboardWidget(chartDashboardWidgetDto);
  }
}
