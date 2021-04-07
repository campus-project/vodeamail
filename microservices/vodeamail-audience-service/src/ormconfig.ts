import { ConfigService } from './infrastructure/config/config.service';

export default new ConfigService().getDatabaseConfig();
