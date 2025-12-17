
// Types for extension options and configurations
import { PerformanceConfig } from '../core/performance';

export interface ExtensionOptions {
    string?: boolean;
    array?: boolean;
    object?: boolean;
    number?: boolean;
    performance?: PerformanceConfig;
}

export { PerformanceConfig };
