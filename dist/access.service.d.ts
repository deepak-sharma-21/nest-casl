import { AnyAbility } from '@casl/ability';
import { AnyObject, Subject } from '@casl/ability/dist/types/types';
import { AuthorizableRequest } from './interfaces/request.interface';
import { AbilityFactory } from './factories/ability.factory';
import { AbilityMetadata } from './interfaces/ability-metadata.interface';
import { AuthorizableUser } from './interfaces/authorizable-user.interface';
export declare class AccessService {
    private abilityFactory;
    constructor(abilityFactory: AbilityFactory);
    getAbility<User extends AuthorizableUser<string, unknown> = AuthorizableUser>(user: User): AnyAbility;
    hasAbility<User extends AuthorizableUser<string, unknown> = AuthorizableUser>(user: User, action: string, subject: Subject, field?: string): boolean;
    assertAbility<User extends AuthorizableUser<string, unknown> = AuthorizableUser>(user: User, action: string, subject: Subject, field?: string): void;
    canActivateAbility<Subject = AnyObject>(request: AuthorizableRequest, ability?: AbilityMetadata<Subject>): Promise<boolean>;
    private isThereAnyFieldRestriction;
}
