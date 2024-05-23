"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessService = void 0;
const common_1 = require("@nestjs/common");
const ability_1 = require("@casl/ability");
const flat_1 = require("flat");
const ability_factory_1 = require("./factories/ability.factory");
const user_proxy_1 = require("./proxies/user.proxy");
const casl_config_1 = require("./casl.config");
const request_proxy_1 = require("./proxies/request.proxy");
const conditions_proxy_1 = require("./proxies/conditions.proxy");
let AccessService = class AccessService {
    constructor(abilityFactory) {
        this.abilityFactory = abilityFactory;
    }
    getAbility(user) {
        return this.abilityFactory.createForUser(user);
    }
    hasAbility(user, action, subject, field) {
        var _a;
        // No user - no access
        if (!user) {
            return false;
        }
        // User exists but no ability metadata - deny access
        if (!action || !subject) {
            return false;
        }
        const { superuserRole } = casl_config_1.CaslConfig.getRootOptions();
        const userAbilities = this.abilityFactory.createForUser(user);
        // Always allow access for superuser
        if (superuserRole && ((_a = user.roles) === null || _a === void 0 ? void 0 : _a.includes(superuserRole))) {
            return true;
        }
        return userAbilities.can(action, subject, field);
    }
    assertAbility(user, action, subject, field) {
        if (!this.hasAbility(user, action, subject, field)) {
            const userAbilities = this.abilityFactory.createForUser(user, ability_1.Ability);
            const relatedRules = userAbilities.rulesFor(action, typeof subject === 'object' ? subject.constructor : subject);
            if (relatedRules.some((rule) => rule.conditions)) {
                throw new common_1.NotFoundException();
            }
            throw new common_1.UnauthorizedException();
        }
    }
    async canActivateAbility(request, ability) {
        var _a;
        const { getUserFromRequest, superuserRole } = casl_config_1.CaslConfig.getRootOptions();
        const userProxy = new user_proxy_1.UserProxy(request, getUserFromRequest);
        const req = new request_proxy_1.RequestProxy(request);
        // Attempt to get user from request
        const user = userProxy.getFromRequest();
        // No user - no access
        if (!user) {
            return false;
        }
        // User exists but no ability metadata - deny access
        if (!ability) {
            return false;
        }
        // Always allow access for superuser
        if (superuserRole && ((_a = user.roles) === null || _a === void 0 ? void 0 : _a.includes(superuserRole))) {
            return true;
        }
        let userAbilities = this.abilityFactory.createForUser(user, ability_1.Ability);
        const relevantRules = userAbilities.rulesFor(ability.action, ability.subject);
        req.setConditions(new conditions_proxy_1.ConditionsProxy(userAbilities, ability.action, ability.subject));
        // If no relevant rules with conditions or no subject hook exists check against subject class
        if (!relevantRules.every((rule) => rule.conditions) && !ability.subjectHook) {
            return userAbilities.can(ability.action, ability.subject);
        }
        // Otherwise try to obtain subject
        const subjectInstance = await req.getSubjectHook().run(request);
        req.setSubject(subjectInstance);
        if (!subjectInstance) {
            return userAbilities.can(ability.action, ability.subject);
        }
        const finalUser = await userProxy.get();
        if (finalUser && finalUser !== userProxy.getFromRequest()) {
            userAbilities = this.abilityFactory.createForUser(finalUser);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const actualSubject = (0, ability_1.subject)(ability.subject, subjectInstance);
        const cannotActivateSomeField = this.isThereAnyFieldRestriction(request.body, ability.action, actualSubject, finalUser);
        if (cannotActivateSomeField)
            return false;
        // and match agains subject instance
        return userAbilities.can(ability.action, actualSubject);
    }
    isThereAnyFieldRestriction(body, action, subject, user) {
        if (!user)
            return true;
        const subjectFields = Object.keys((0, flat_1.flatten)(body || {}));
        return subjectFields.some((field) => !this.hasAbility(user, action, subject, field));
    }
};
exports.AccessService = AccessService;
exports.AccessService = AccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ability_factory_1.AbilityFactory])
], AccessService);
//# sourceMappingURL=access.service.js.map