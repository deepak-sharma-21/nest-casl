import { OptionsForRoot } from './interfaces/options.interface';
type DefaultedOptionsForRoot = OptionsForRoot & Required<Pick<OptionsForRoot, 'getUserFromRequest'>>;
export declare class CaslConfig {
    static getRootOptions(): DefaultedOptionsForRoot;
}
export {};
