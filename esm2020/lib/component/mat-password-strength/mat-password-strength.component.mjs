import { ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { Colors, Criteria } from '../../enum';
import { MatPasswordStrengthValidator } from '../../validator';
import { RegExpValidator } from '../../validator/regexp.class';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/progress-bar";
export class MatPasswordStrengthComponent {
    constructor() {
        this.enableLengthRule = true;
        this.enableLowerCaseLetterRule = true;
        this.enableUpperCaseLetterRule = true;
        this.enableDigitRule = true;
        this.enableSpecialCharRule = true;
        this.min = 8;
        this.max = 30;
        this.warnThreshold = 21;
        this.accentThreshold = 81;
        this.onStrengthChanged = new EventEmitter();
        this.criteriaMap = new Map();
        // TO ACCESS VIA CONTENT CHILD
        this.passwordFormControl = new FormControl();
        this.passwordConfirmationFormControl = new FormControl();
        this.validatorsArray = [];
        this.matPasswordStrengthValidator = new MatPasswordStrengthValidator();
        this._strength = 0;
        this.propagateChange = (_) => {
        };
    }
    get strength() {
        return this._strength ? this._strength : 0;
    }
    get color() {
        if (this._strength < this.warnThreshold) {
            return Colors.warn;
        }
        else if (this._strength < this.accentThreshold) {
            return Colors.accent;
        }
        else {
            return Colors.primary;
        }
    }
    ngOnInit() {
        this.setRulesAndValidators();
    }
    ngOnChanges(changes) {
        if ((changes.externalError && changes.externalError.firstChange) || changes.password.isFirstChange()) {
            return;
        }
        else if (changes.externalError && changes.externalError.currentValue) {
            this._color = Colors.warn;
            return;
        }
        else if (changes.password.previousValue === changes.password.currentValue && !changes.password.firstChange) {
            this.calculatePasswordStrength();
        }
        else {
            this.password && this.password.length > 0 ?
                this.calculatePasswordStrength() : this.reset();
        }
    }
    parseCustomValidatorsRegex(value = this.customValidator) {
        if (this.customValidator instanceof RegExp) {
            return this.customValidator;
        }
        else if (typeof this.customValidator === 'string') {
            return RegExp(this.customValidator);
        }
    }
    setRulesAndValidators() {
        this.validatorsArray = [];
        this.criteriaMap = new Map();
        this.passwordConfirmationFormControl
            .setValidators(Validators.compose([
            Validators.required, this.matPasswordStrengthValidator.confirm(this.password)
        ]));
        this.validatorsArray.push(Validators.required);
        if (this.enableLengthRule) {
            this.criteriaMap.set(Criteria.at_least_eight_chars, RegExp(`^.{${this.min},${this.max}}$`));
            this.validatorsArray.push(Validators.minLength(this.min));
            this.validatorsArray.push(Validators.maxLength(this.max));
        }
        if (this.enableLowerCaseLetterRule) {
            this.criteriaMap.set(Criteria.at_least_one_lower_case_char, RegExpValidator.lowerCase);
            this.validatorsArray.push(Validators.pattern(RegExpValidator.lowerCase));
        }
        if (this.enableUpperCaseLetterRule) {
            this.criteriaMap.set(Criteria.at_least_one_upper_case_char, RegExpValidator.upperCase);
            this.validatorsArray.push(Validators.pattern(RegExpValidator.upperCase));
        }
        if (this.enableDigitRule) {
            this.criteriaMap.set(Criteria.at_least_one_digit_char, RegExpValidator.digit);
            this.validatorsArray.push(Validators.pattern(RegExpValidator.digit));
        }
        if (this.enableSpecialCharRule) {
            this.criteriaMap.set(Criteria.at_least_one_special_char, RegExpValidator.specialChar);
            this.validatorsArray.push(Validators.pattern(RegExpValidator.specialChar));
        }
        if (this.customValidator) {
            this.criteriaMap.set(Criteria.at_custom_chars, this.parseCustomValidatorsRegex());
            this.validatorsArray.push(Validators.pattern(this.parseCustomValidatorsRegex()));
        }
        this.criteriaMap.forEach((value, key) => {
            this.validatorsArray.push(this.matPasswordStrengthValidator.validate(key, value));
        });
        this.passwordFormControl.setValidators(Validators.compose([...this.validatorsArray]));
        this.Validators = Validators.compose([...this.validatorsArray]);
    }
    calculatePasswordStrength() {
        const requirements = [];
        const unit = 100 / this.criteriaMap.size;
        // console.log('this.criteriaMap.size = ', this.criteriaMap.size);
        // console.log('unit = ', unit);
        requirements.push(this.enableLengthRule ? this._containAtLeastMinChars() : false, this.enableLowerCaseLetterRule ? this._containAtLeastOneLowerCaseLetter() : false, this.enableUpperCaseLetterRule ? this._containAtLeastOneUpperCaseLetter() : false, this.enableDigitRule ? this._containAtLeastOneDigit() : false, this.enableSpecialCharRule ? this._containAtLeastOneSpecialChar() : false, this.customValidator ? this._containCustomChars() : false);
        this._strength = requirements.filter(v => v).length * unit;
        this.propagateChange(this.strength);
        // console.log('length = ', this._strength / unit);
        this.onStrengthChanged.emit(this.strength);
        this.setRulesAndValidators();
    }
    reset() {
        this._strength = 0;
        this.containAtLeastMinChars =
            this.containAtLeastOneLowerCaseLetter =
                this.containAtLeastOneUpperCaseLetter =
                    this.containAtLeastOneDigit =
                        this.containAtCustomChars =
                            this.containAtLeastOneSpecialChar = false;
    }
    writeValue(obj) {
        if (obj) {
            this._strength = obj;
        }
    }
    registerOnChange(fn) {
        this.propagateChange = fn;
    }
    registerOnTouched(fn) {
        // throw new Error("Method not implemented.");
    }
    setDisabledState(isDisabled) {
        // throw new Error("Method not implemented.");
    }
    _containAtLeastMinChars() {
        this.containAtLeastMinChars = this.password.length >= this.min;
        return this.containAtLeastMinChars;
    }
    _containAtLeastOneLowerCaseLetter() {
        this.containAtLeastOneLowerCaseLetter =
            this.criteriaMap
                .get(Criteria.at_least_one_lower_case_char)
                .test(this.password);
        return this.containAtLeastOneLowerCaseLetter;
    }
    _containAtLeastOneUpperCaseLetter() {
        this.containAtLeastOneUpperCaseLetter =
            this.criteriaMap
                .get(Criteria.at_least_one_upper_case_char)
                .test(this.password);
        return this.containAtLeastOneUpperCaseLetter;
    }
    _containAtLeastOneDigit() {
        this.containAtLeastOneDigit =
            this.criteriaMap
                .get(Criteria.at_least_one_digit_char)
                .test(this.password);
        return this.containAtLeastOneDigit;
    }
    _containAtLeastOneSpecialChar() {
        this.containAtLeastOneSpecialChar =
            this.criteriaMap
                .get(Criteria.at_least_one_special_char)
                .test(this.password);
        return this.containAtLeastOneSpecialChar;
    }
    _containCustomChars() {
        this.containAtCustomChars =
            this.criteriaMap
                .get(Criteria.at_custom_chars)
                .test(this.password);
        return this.containAtCustomChars;
    }
    ngAfterContentChecked() {
        if (this.password) {
            this.calculatePasswordStrength();
        }
    }
}
MatPasswordStrengthComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: MatPasswordStrengthComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MatPasswordStrengthComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "13.0.0", type: MatPasswordStrengthComponent, selector: "mat-password-strength", inputs: { password: "password", externalError: "externalError", enableLengthRule: "enableLengthRule", enableLowerCaseLetterRule: "enableLowerCaseLetterRule", enableUpperCaseLetterRule: "enableUpperCaseLetterRule", enableDigitRule: "enableDigitRule", enableSpecialCharRule: "enableSpecialCharRule", min: "min", max: "max", customValidator: "customValidator", warnThreshold: "warnThreshold", accentThreshold: "accentThreshold" }, outputs: { onStrengthChanged: "onStrengthChanged" }, providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MatPasswordStrengthComponent),
            multi: true
        }
    ], exportAs: ["matPasswordStrength"], usesOnChanges: true, ngImport: i0, template: "<mat-progress-bar [color]=\"color\"\n                  [value]=\"strength\"\n                  mode=\"determinate\">\n</mat-progress-bar>\n", styles: [".green :host::ng-deep .mat-progress-bar.mat-primary .mat-progress-bar-fill:after{background-color:#43a047}\n"], components: [{ type: i1.MatProgressBar, selector: "mat-progress-bar", inputs: ["color", "value", "bufferValue", "mode"], outputs: ["animationEnd"], exportAs: ["matProgressBar"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: MatPasswordStrengthComponent, decorators: [{
            type: Component,
            args: [{ selector: 'mat-password-strength', exportAs: 'matPasswordStrength', changeDetection: ChangeDetectionStrategy.OnPush, providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => MatPasswordStrengthComponent),
                            multi: true
                        }
                    ], template: "<mat-progress-bar [color]=\"color\"\n                  [value]=\"strength\"\n                  mode=\"determinate\">\n</mat-progress-bar>\n", styles: [".green :host::ng-deep .mat-progress-bar.mat-primary .mat-progress-bar-fill:after{background-color:#43a047}\n"] }]
        }], propDecorators: { password: [{
                type: Input
            }], externalError: [{
                type: Input
            }], enableLengthRule: [{
                type: Input
            }], enableLowerCaseLetterRule: [{
                type: Input
            }], enableUpperCaseLetterRule: [{
                type: Input
            }], enableDigitRule: [{
                type: Input
            }], enableSpecialCharRule: [{
                type: Input
            }], min: [{
                type: Input
            }], max: [{
                type: Input
            }], customValidator: [{
                type: Input
            }], warnThreshold: [{
                type: Input
            }], accentThreshold: [{
                type: Input
            }], onStrengthChanged: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0LXBhc3N3b3JkLXN0cmVuZ3RoLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItbWF0ZXJpYWwtZXh0ZW5zaW9ucy9wYXNzd29yZC1zdHJlbmd0aC9zcmMvbGliL2NvbXBvbmVudC9tYXQtcGFzc3dvcmQtc3RyZW5ndGgvbWF0LXBhc3N3b3JkLXN0cmVuZ3RoLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItbWF0ZXJpYWwtZXh0ZW5zaW9ucy9wYXNzd29yZC1zdHJlbmd0aC9zcmMvbGliL2NvbXBvbmVudC9tYXQtcGFzc3dvcmQtc3RyZW5ndGgvbWF0LXBhc3N3b3JkLXN0cmVuZ3RoLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFFTCx1QkFBdUIsRUFDdkIsU0FBUyxFQUNULFlBQVksRUFDWixVQUFVLEVBQ1YsS0FBSyxFQUdMLE1BQU0sRUFFUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQXVCLFdBQVcsRUFBRSxpQkFBaUIsRUFBZSxVQUFVLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUM3RyxPQUFPLEVBQUMsTUFBTSxFQUFFLFFBQVEsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUM1QyxPQUFPLEVBQUMsNEJBQTRCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUM3RCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sOEJBQThCLENBQUM7OztBQWtCN0QsTUFBTSxPQUFPLDRCQUE0QjtJQWR6QztRQW1CVyxxQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUFDeEIsOEJBQXlCLEdBQUcsSUFBSSxDQUFDO1FBQ2pDLDhCQUF5QixHQUFHLElBQUksQ0FBQztRQUNqQyxvQkFBZSxHQUFHLElBQUksQ0FBQztRQUN2QiwwQkFBcUIsR0FBRyxJQUFJLENBQUM7UUFFN0IsUUFBRyxHQUFH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QzNELEtBQUssRUFBRSxJQUFJO1NBQ1o7S0FDRixrRkMvQkgsNklBSUE7MkZENkJhLDRCQUE0QjtrQkFkeEMsU0FBUzsrQkFDRSx1QkFBdUIsWUFDdkIscUJBQXFCLG1CQUdkLHVCQUF1QixDQUFDLE1BQU0sYUFDcEM7d0JBQ1Q7NEJBQ0UsT0FBTyxFQUFFLGlCQUFpQjs0QkFDMUIsV0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsNkJBQTZCLENBQUM7NEJBQzNELEtBQUssRUFBRSxJQUFJO3lCQUNaO3FCQUNGOzhCQUlRLFFBQVE7c0JBQWhCLEtBQUs7Z0JBQ0csYUFBYTtzQkFBckIsS0FBSztnQkFFRyxnQkFBZ0I7c0JBQXhCLEtBQUs7Z0JBQ0cseUJBQXlCO3NCQUFqQyxLQUFLO2dCQUNHLHlCQUF5QjtzQkFBakMsS0FBSztnQkFDRyxlQUFlO3NCQUF2QixLQUFLO2dCQUNHLHFCQUFxQjtzQkFBN0IsS0FBSztnQkFFRyxHQUFHO3NCQUFYLEtBQUs7Z0JBQ0csR0FBRztzQkFBWCxLQUFLO2dCQUNHLGVBQWU7c0JBQXZCLEtBQUs7Z0JBRUcsYUFBYTtzQkFBckIsS0FBSztnQkFDRyxlQUFlO3NCQUF2QixLQUFLO2dCQUdOLGlCQUFpQjtzQkFEaEIsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEFmdGVyQ29udGVudENoZWNrZWQsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDb21wb25lbnQsXG4gIEV2ZW50RW1pdHRlcixcbiAgZm9yd2FyZFJlZixcbiAgSW5wdXQsXG4gIE9uQ2hhbmdlcyxcbiAgT25Jbml0LFxuICBPdXRwdXQsXG4gIFNpbXBsZUNoYW5nZXNcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NvbnRyb2xWYWx1ZUFjY2Vzc29yLCBGb3JtQ29udHJvbCwgTkdfVkFMVUVfQUNDRVNTT1IsIFZhbGlkYXRvckZuLCBWYWxpZGF0b3JzfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQge0NvbG9ycywgQ3JpdGVyaWF9IGZyb20gJy4uLy4uL2VudW0nO1xuaW1wb3J0IHtNYXRQYXNzd29yZFN0cmVuZ3RoVmFsaWRhdG9yfSBmcm9tICcuLi8uLi92YWxpZGF0b3InO1xuaW1wb3J0IHtSZWdFeHBWYWxpZGF0b3J9IGZyb20gJy4uLy4uL3ZhbGlkYXRvci9yZWdleHAuY2xhc3MnO1xuaW1wb3J0IHtUaGVtZVBhbGV0dGV9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ21hdC1wYXNzd29yZC1zdHJlbmd0aCcsXG4gIGV4cG9ydEFzOiAnbWF0UGFzc3dvcmRTdHJlbmd0aCcsXG4gIHRlbXBsYXRlVXJsOiAnLi9tYXQtcGFzc3dvcmQtc3RyZW5ndGguY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi9tYXQtcGFzc3dvcmQtc3RyZW5ndGguY29tcG9uZW50LnNjc3MnXSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIHByb3ZpZGVyczogW1xuICAgIHtcbiAgICAgIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxuICAgICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTWF0UGFzc3dvcmRTdHJlbmd0aENvbXBvbmVudCksXG4gICAgICBtdWx0aTogdHJ1ZVxuICAgIH1cbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBNYXRQYXNzd29yZFN0cmVuZ3RoQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMsIEFmdGVyQ29udGVudENoZWNrZWQsIENvbnRyb2xWYWx1ZUFjY2Vzc29yIHtcblxuICBASW5wdXQoKSBwYXNzd29yZDogc3RyaW5nO1xuICBASW5wdXQoKSBleHRlcm5hbEVycm9yOiBib29sZWFuO1xuXG4gIEBJbnB1dCgpIGVuYWJsZUxlbmd0aFJ1bGUgPSB0cnVlO1xuICBASW5wdXQoKSBlbmFibGVMb3dlckNhc2VMZXR0ZXJSdWxlID0gdHJ1ZTtcbiAgQElucHV0KCkgZW5hYmxlVXBwZXJDYXNlTGV0dGVyUnVsZSA9IHRydWU7XG4gIEBJbnB1dCgpIGVuYWJsZURpZ2l0UnVsZSA9IHRydWU7XG4gIEBJbnB1dCgpIGVuYWJsZVNwZWNpYWxDaGFyUnVsZSA9IHRydWU7XG5cbiAgQElucHV0KCkgbWluID0gODtcbiAgQElucHV0KCkgbWF4ID0gMzA7XG4gIEBJbnB1dCgpIGN1c3RvbVZhbGlkYXRvcjogUmVnRXhwO1xuXG4gIEBJbnB1dCgpIHdhcm5UaHJlc2hvbGQgPSAyMTtcbiAgQElucHV0KCkgYWNjZW50VGhyZXNob2xkID0gODE7XG5cbiAgQE91dHB1dCgpXG4gIG9uU3RyZW5ndGhDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8bnVtYmVyPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBjcml0ZXJpYU1hcCA9IG5ldyBNYXA8Q3JpdGVyaWEsIFJlZ0V4cD4oKTtcblxuICBjb250YWluQXRMZWFzdE1pbkNoYXJzOiBib29sZWFuO1xuICBjb250YWluQXRMZWFzdE9uZUxvd2VyQ2FzZUxldHRlcjogYm9vbGVhbjtcbiAgY29udGFpbkF0TGVhc3RPbmVVcHBlckNhc2VMZXR0ZXI6IGJvb2xlYW47XG4gIGNvbnRhaW5BdExlYXN0T25lRGlnaXQ6IGJvb2xlYW47XG4gIGNvbnRhaW5BdExlYXN0T25lU3BlY2lhbENoYXI6IGJvb2xlYW47XG4gIGNvbnRhaW5BdEN1c3RvbUNoYXJzOiBib29sZWFuO1xuXG4gIC8vIFRPIEFDQ0VTUyBWSUEgQ09OVEVOVCBDSElMRFxuICBwYXNzd29yZEZvcm1Db250cm9sOiBGb3JtQ29udHJvbCA9IG5ldyBGb3JtQ29udHJvbCgpO1xuICBwYXNzd29yZENvbmZpcm1hdGlvbkZvcm1Db250cm9sOiBGb3JtQ29udHJvbCA9IG5ldyBGb3JtQ29udHJvbCgpO1xuXG4gIHZhbGlkYXRvcnNBcnJheTogVmFsaWRhdG9yRm5bXSA9IFtdO1xuICBWYWxpZGF0b3JzOiBWYWxpZGF0b3JGbjtcbiAgbWF0UGFzc3dvcmRTdHJlbmd0aFZhbGlkYXRvciA9IG5ldyBNYXRQYXNzd29yZFN0cmVuZ3RoVmFsaWRhdG9yKCk7XG5cbiAgcHJpdmF0ZSBfc3RyZW5ndGggPSAwO1xuXG4gIGdldCBzdHJlbmd0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9zdHJlbmd0aCA/IHRoaXMuX3N0cmVuZ3RoIDogMDtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbG9yOiBUaGVtZVBhbGV0dGU7XG5cbiAgZ2V0IGNvbG9yKCk6IFRoZW1lUGFsZXR0ZSB7XG5cbiAgICBpZiAodGhpcy5fc3RyZW5ndGggPCB0aGlzLndhcm5UaHJlc2hvbGQpIHtcbiAgICAgIHJldHVybiBDb2xvcnMud2FybjtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3N0cmVuZ3RoIDwgdGhpcy5hY2NlbnRUaHJlc2hvbGQpIHtcbiAgICAgIHJldHVybiBDb2xvcnMuYWNjZW50O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gQ29sb3JzLnByaW1hcnk7XG4gICAgfVxuICB9XG5cbiAgcHJvcGFnYXRlQ2hhbmdlID0gKF86IGFueSkgPT4ge1xuICB9O1xuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIHRoaXMuc2V0UnVsZXNBbmRWYWxpZGF0b3JzKCk7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XG4gICAgaWYgKChjaGFuZ2VzLmV4dGVybmFsRXJyb3IgJiYgY2hhbmdlcy5leHRlcm5hbEVycm9yLmZpcnN0Q2hhbmdlKSB8fCBjaGFuZ2VzLnBhc3N3b3JkLmlzRmlyc3RDaGFuZ2UoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoY2hhbmdlcy5leHRlcm5hbEVycm9yICYmIGNoYW5nZXMuZXh0ZXJuYWxFcnJvci5jdXJyZW50VmFsdWUpIHtcbiAgICAgIHRoaXMuX2NvbG9yID0gQ29sb3JzLndhcm47XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmIChjaGFuZ2VzLnBhc3N3b3JkLnByZXZpb3VzVmFsdWUgPT09IGNoYW5nZXMucGFzc3dvcmQuY3VycmVudFZhbHVlICYmICFjaGFuZ2VzLnBhc3N3b3JkLmZpcnN0Q2hhbmdlKSB7XG4gICAgICB0aGlzLmNhbGN1bGF0ZVBhc3N3b3JkU3RyZW5ndGgoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wYXNzd29yZCAmJiB0aGlzLnBhc3N3b3JkLmxlbmd0aCA+IDAgP1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZVBhc3N3b3JkU3RyZW5ndGgoKSA6IHRoaXMucmVzZXQoKTtcbiAgICB9XG4gIH1cblxuICBwYXJzZUN1c3RvbVZhbGlkYXRvcnNSZWdleCh2YWx1ZTogc3RyaW5nIHwgUmVnRXhwID0gdGhpcy5jdXN0b21WYWxpZGF0b3IpIHtcbiAgICBpZiAodGhpcy5jdXN0b21WYWxpZGF0b3IgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgIHJldHVybiB0aGlzLmN1c3RvbVZhbGlkYXRvcjtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmN1c3RvbVZhbGlkYXRvciA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBSZWdFeHAodGhpcy5jdXN0b21WYWxpZGF0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHNldFJ1bGVzQW5kVmFsaWRhdG9ycygpOiB2b2lkIHtcbiAgICB0aGlzLnZhbGlkYXRvcnNBcnJheSA9IFtdO1xuICAgIHRoaXMuY3JpdGVyaWFNYXAgPSBuZXcgTWFwPENyaXRlcmlhLCBSZWdFeHA+KCk7XG4gICAgdGhpcy5wYXNzd29yZENvbmZpcm1hdGlvbkZvcm1Db250cm9sXG4gICAgICAuc2V0VmFsaWRhdG9ycyhWYWxpZGF0b3JzLmNvbXBvc2UoW1xuICAgICAgICBWYWxpZGF0b3JzLnJlcXVpcmVkLCB0aGlzLm1hdFBhc3N3b3JkU3RyZW5ndGhWYWxpZGF0b3IuY29uZmlybSh0aGlzLnBhc3N3b3JkKVxuICAgICAgXSkpO1xuICAgIHRoaXMudmFsaWRhdG9yc0FycmF5LnB1c2goVmFsaWRhdG9ycy5yZXF1aXJlZCk7XG4gICAgaWYgKHRoaXMuZW5hYmxlTGVuZ3RoUnVsZSkge1xuICAgICAgdGhpcy5jcml0ZXJpYU1hcC5zZXQoQ3JpdGVyaWEuYXRfbGVhc3RfZWlnaHRfY2hhcnMsIFJlZ0V4cChgXi57JHt0aGlzLm1pbn0sJHt0aGlzLm1heH19JGApKTtcbiAgICAgIHRoaXMudmFsaWRhdG9yc0FycmF5LnB1c2goVmFsaWRhdG9ycy5taW5MZW5ndGgodGhpcy5taW4pKTtcbiAgICAgIHRoaXMudmFsaWRhdG9yc0FycmF5LnB1c2goVmFsaWRhdG9ycy5tYXhMZW5ndGgodGhpcy5tYXgpKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuZW5hYmxlTG93ZXJDYXNlTGV0dGVyUnVsZSkge1xuICAgICAgdGhpcy5jcml0ZXJpYU1hcC5zZXQoQ3JpdGVyaWEuYXRfbGVhc3Rfb25lX2xvd2VyX2Nhc2VfY2hhciwgUmVnRXhwVmFsaWRhdG9yLmxvd2VyQ2FzZSk7XG4gICAgICB0aGlzLnZhbGlkYXRvcnNBcnJheS5wdXNoKFZhbGlkYXRvcnMucGF0dGVybihSZWdFeHBWYWxpZGF0b3IubG93ZXJDYXNlKSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmVuYWJsZVVwcGVyQ2FzZUxldHRlclJ1bGUpIHtcbiAgICAgIHRoaXMuY3JpdGVyaWFNYXAuc2V0KENyaXRlcmlhLmF0X2xlYXN0X29uZV91cHBlcl9jYXNlX2NoYXIsIFJlZ0V4cFZhbGlkYXRvci51cHBlckNhc2UpO1xuICAgICAgdGhpcy52YWxpZGF0b3JzQXJyYXkucHVzaChWYWxpZGF0b3JzLnBhdHRlcm4oUmVnRXhwVmFsaWRhdG9yLnVwcGVyQ2FzZSkpO1xuICAgIH1cbiAgICBpZiAodGhpcy5lbmFibGVEaWdpdFJ1bGUpIHtcbiAgICAgIHRoaXMuY3JpdGVyaWFNYXAuc2V0KENyaXRlcmlhLmF0X2xlYXN0X29uZV9kaWdpdF9jaGFyLCBSZWdFeHBWYWxpZGF0b3IuZGlnaXQpO1xuICAgICAgdGhpcy52YWxpZGF0b3JzQXJyYXkucHVzaChWYWxpZGF0b3JzLnBhdHRlcm4oUmVnRXhwVmFsaWRhdG9yLmRpZ2l0KSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmVuYWJsZVNwZWNpYWxDaGFyUnVsZSkge1xuICAgICAgdGhpcy5jcml0ZXJpYU1hcC5zZXQoQ3JpdGVyaWEuYXRfbGVhc3Rfb25lX3NwZWNpYWxfY2hhciwgUmVnRXhwVmFsaWRhdG9yLnNwZWNpYWxDaGFyKTtcbiAgICAgIHRoaXMudmFsaWRhdG9yc0FycmF5LnB1c2goVmFsaWRhdG9ycy5wYXR0ZXJuKFJlZ0V4cFZhbGlkYXRvci5zcGVjaWFsQ2hhcikpO1xuICAgIH1cbiAgICBpZiAodGhpcy5jdXN0b21WYWxpZGF0b3IpIHtcbiAgICAgIHRoaXMuY3JpdGVyaWFNYXAuc2V0KENyaXRlcmlhLmF0X2N1c3RvbV9jaGFycywgdGhpcy5wYXJzZUN1c3RvbVZhbGlkYXRvcnNSZWdleCgpKTtcbiAgICAgIHRoaXMudmFsaWRhdG9yc0FycmF5LnB1c2goVmFsaWRhdG9ycy5wYXR0ZXJuKHRoaXMucGFyc2VDdXN0b21WYWxpZGF0b3JzUmVnZXgoKSkpO1xuICAgIH1cblxuICAgIHRoaXMuY3JpdGVyaWFNYXAuZm9yRWFjaCgodmFsdWU6IGFueSwga2V5OiBzdHJpbmcpID0+IHtcbiAgICAgIHRoaXMudmFsaWRhdG9yc0FycmF5LnB1c2godGhpcy5tYXRQYXNzd29yZFN0cmVuZ3RoVmFsaWRhdG9yLnZhbGlkYXRlKGtleSwgdmFsdWUpKTtcbiAgICB9KTtcblxuICAgIHRoaXMucGFzc3dvcmRGb3JtQ29udHJvbC5zZXRWYWxpZGF0b3JzKFZhbGlkYXRvcnMuY29tcG9zZShbLi4udGhpcy52YWxpZGF0b3JzQXJyYXldKSk7XG4gICAgdGhpcy5WYWxpZGF0b3JzID0gVmFsaWRhdG9ycy5jb21wb3NlKFsuLi50aGlzLnZhbGlkYXRvcnNBcnJheV0pO1xuXG4gIH1cblxuICBjYWxjdWxhdGVQYXNzd29yZFN0cmVuZ3RoKCk6IHZvaWQge1xuICAgIGNvbnN0IHJlcXVpcmVtZW50czogQXJyYXk8Ym9vbGVhbj4gPSBbXTtcbiAgICBjb25zdCB1bml0ID0gMTAwIC8gdGhpcy5jcml0ZXJpYU1hcC5zaXplO1xuXG4gICAgLy8gY29uc29sZS5sb2coJ3RoaXMuY3JpdGVyaWFNYXAuc2l6ZSA9ICcsIHRoaXMuY3JpdGVyaWFNYXAuc2l6ZSk7XG4gICAgLy8gY29uc29sZS5sb2coJ3VuaXQgPSAnLCB1bml0KTtcblxuICAgIHJlcXVpcmVtZW50cy5wdXNoKFxuICAgICAgdGhpcy5lbmFibGVMZW5ndGhSdWxlID8gdGhpcy5fY29udGFpbkF0TGVhc3RNaW5DaGFycygpIDogZmFsc2UsXG4gICAgICB0aGlzLmVuYWJsZUxvd2VyQ2FzZUxldHRlclJ1bGUgPyB0aGlzLl9jb250YWluQXRMZWFzdE9uZUxvd2VyQ2FzZUxldHRlcigpIDogZmFsc2UsXG4gICAgICB0aGlzLmVuYWJsZVVwcGVyQ2FzZUxldHRlclJ1bGUgPyB0aGlzLl9jb250YWluQXRMZWFzdE9uZVVwcGVyQ2FzZUxldHRlcigpIDogZmFsc2UsXG4gICAgICB0aGlzLmVuYWJsZURpZ2l0UnVsZSA/IHRoaXMuX2NvbnRhaW5BdExlYXN0T25lRGlnaXQoKSA6IGZhbHNlLFxuICAgICAgdGhpcy5lbmFibGVTcGVjaWFsQ2hhclJ1bGUgPyB0aGlzLl9jb250YWluQXRMZWFzdE9uZVNwZWNpYWxDaGFyKCkgOiBmYWxzZSxcbiAgICAgIHRoaXMuY3VzdG9tVmFsaWRhdG9yID8gdGhpcy5fY29udGFpbkN1c3RvbUNoYXJzKCkgOiBmYWxzZVxuICAgICk7XG5cbiAgICB0aGlzLl9zdHJlbmd0aCA9IHJlcXVpcmVtZW50cy5maWx0ZXIodiA9PiB2KS5sZW5ndGggKiB1bml0O1xuICAgIHRoaXMucHJvcGFnYXRlQ2hhbmdlKHRoaXMuc3RyZW5ndGgpO1xuICAgIC8vIGNvbnNvbGUubG9nKCdsZW5ndGggPSAnLCB0aGlzLl9zdHJlbmd0aCAvIHVuaXQpO1xuICAgIHRoaXMub25TdHJlbmd0aENoYW5nZWQuZW1pdCh0aGlzLnN0cmVuZ3RoKTtcbiAgICB0aGlzLnNldFJ1bGVzQW5kVmFsaWRhdG9ycygpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5fc3RyZW5ndGggPSAwO1xuICAgIHRoaXMuY29udGFpbkF0TGVhc3RNaW5DaGFycyA9XG4gICAgICB0aGlzLmNvbnRhaW5BdExlYXN0T25lTG93ZXJDYXNlTGV0dGVyID1cbiAgICAgICAgdGhpcy5jb250YWluQXRMZWFzdE9uZVVwcGVyQ2FzZUxldHRlciA9XG4gICAgICAgICAgdGhpcy5jb250YWluQXRMZWFzdE9uZURpZ2l0ID1cbiAgICAgICAgICAgIHRoaXMuY29udGFpbkF0Q3VzdG9tQ2hhcnMgPVxuICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5BdExlYXN0T25lU3BlY2lhbENoYXIgPSBmYWxzZTtcbiAgfVxuXG4gIHdyaXRlVmFsdWUob2JqOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAob2JqKSB7XG4gICAgICB0aGlzLl9zdHJlbmd0aCA9IG9iajtcbiAgICB9XG4gIH1cblxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BhZ2F0ZUNoYW5nZSA9IGZuO1xuICB9XG5cbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46IGFueSk6IHZvaWQge1xuICAgIC8vIHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBub3QgaW1wbGVtZW50ZWQuXCIpO1xuICB9XG5cbiAgc2V0RGlzYWJsZWRTdGF0ZT8oaXNEaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIC8vIHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBub3QgaW1wbGVtZW50ZWQuXCIpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29udGFpbkF0TGVhc3RNaW5DaGFycygpOiBib29sZWFuIHtcbiAgICB0aGlzLmNvbnRhaW5BdExlYXN0TWluQ2hhcnMgPSB0aGlzLnBhc3N3b3JkLmxlbmd0aCA+PSB0aGlzLm1pbjtcbiAgICByZXR1cm4gdGhpcy5jb250YWluQXRMZWFzdE1pbkNoYXJzO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29udGFpbkF0TGVhc3RPbmVMb3dlckNhc2VMZXR0ZXIoKTogYm9vbGVhbiB7XG4gICAgdGhpcy5jb250YWluQXRMZWFzdE9uZUxvd2VyQ2FzZUxldHRlciA9XG4gICAgICB0aGlzLmNyaXRlcmlhTWFwXG4gICAgICAgIC5nZXQoQ3JpdGVyaWEuYXRfbGVhc3Rfb25lX2xvd2VyX2Nhc2VfY2hhcilcbiAgICAgICAgLnRlc3QodGhpcy5wYXNzd29yZCk7XG4gICAgcmV0dXJuIHRoaXMuY29udGFpbkF0TGVhc3RPbmVMb3dlckNhc2VMZXR0ZXI7XG4gIH1cblxuICBwcml2YXRlIF9jb250YWluQXRMZWFzdE9uZVVwcGVyQ2FzZUxldHRlcigpOiBib29sZWFuIHtcbiAgICB0aGlzLmNvbnRhaW5BdExlYXN0T25lVXBwZXJDYXNlTGV0dGVyID1cbiAgICAgIHRoaXMuY3JpdGVyaWFNYXBcbiAgICAgICAgLmdldChDcml0ZXJpYS5hdF9sZWFzdF9vbmVfdXBwZXJfY2FzZV9jaGFyKVxuICAgICAgICAudGVzdCh0aGlzLnBhc3N3b3JkKTtcbiAgICByZXR1cm4gdGhpcy5jb250YWluQXRMZWFzdE9uZVVwcGVyQ2FzZUxldHRlcjtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnRhaW5BdExlYXN0T25lRGlnaXQoKTogYm9vbGVhbiB7XG4gICAgdGhpcy5jb250YWluQXRMZWFzdE9uZURpZ2l0ID1cbiAgICAgIHRoaXMuY3JpdGVyaWFNYXBcbiAgICAgICAgLmdldChDcml0ZXJpYS5hdF9sZWFzdF9vbmVfZGlnaXRfY2hhcilcbiAgICAgICAgLnRlc3QodGhpcy5wYXNzd29yZCk7XG4gICAgcmV0dXJuIHRoaXMuY29udGFpbkF0TGVhc3RPbmVEaWdpdDtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnRhaW5BdExlYXN0T25lU3BlY2lhbENoYXIoKTogYm9vbGVhbiB7XG4gICAgdGhpcy5jb250YWluQXRMZWFzdE9uZVNwZWNpYWxDaGFyID1cbiAgICAgIHRoaXMuY3JpdGVyaWFNYXBcbiAgICAgICAgLmdldChDcml0ZXJpYS5hdF9sZWFzdF9vbmVfc3BlY2lhbF9jaGFyKVxuICAgICAgICAudGVzdCh0aGlzLnBhc3N3b3JkKTtcbiAgICByZXR1cm4gdGhpcy5jb250YWluQXRMZWFzdE9uZVNwZWNpYWxDaGFyO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29udGFpbkN1c3RvbUNoYXJzKCk6IGJvb2xlYW4ge1xuICAgIHRoaXMuY29udGFpbkF0Q3VzdG9tQ2hhcnMgPVxuICAgICAgdGhpcy5jcml0ZXJpYU1hcFxuICAgICAgICAuZ2V0KENyaXRlcmlhLmF0X2N1c3RvbV9jaGFycylcbiAgICAgICAgLnRlc3QodGhpcy5wYXNzd29yZCk7XG4gICAgcmV0dXJuIHRoaXMuY29udGFpbkF0Q3VzdG9tQ2hhcnM7XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudENoZWNrZWQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucGFzc3dvcmQpIHtcbiAgICAgIHRoaXMuY2FsY3VsYXRlUGFzc3dvcmRTdHJlbmd0aCgpO1xuICAgIH1cbiAgfVxufVxuIiwiPG1hdC1wcm9ncmVzcy1iYXIgW2NvbG9yXT1cImNvbG9yXCJcbiAgICAgICAgICAgICAgICAgIFt2YWx1ZV09XCJzdHJlbmd0aFwiXG4gICAgICAgICAgICAgICAgICBtb2RlPVwiZGV0ZXJtaW5hdGVcIj5cbjwvbWF0LXByb2dyZXNzLWJhcj5cbiJdfQ==