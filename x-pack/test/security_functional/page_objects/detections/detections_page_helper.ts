/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { WebElementWrapper } from '../../../../../test/functional/services/lib/web_element_wrapper';

class DetectionsPageHelper {
  a11y: any;
  find: any;
  testSubjects: any;

  constructor(injectedA11y: any, injectedFind: any, injectedTestSubjects: any) {
    this.a11y = injectedA11y;
    this.find = injectedFind;
    this.testSubjects = injectedTestSubjects;
  }

  async createRule(
    createRuleStepOne: () => Promise<void>,
    name: string = 'test rule',
    description: string = 'test description',
    isA11yTestInProgress: boolean
  ): Promise<void> {
    await createRuleStepOne();
    await this.createRuleStepTwo(name, description, isA11yTestInProgress);
    await this.createRuleStepThree(isA11yTestInProgress);
    await this.createRuleStepFour(isA11yTestInProgress);
  }

  async createRuleStepTwo(
    name: string,
    description: string,
    isA11yTestInProgress: boolean
  ): Promise<void> {
    if (isA11yTestInProgress) {
      await this.a11y.testAppSnapshot();
    }
    await this.addNameAndDescription(name, description);
    if (isA11yTestInProgress) {
      await this.revealAdvancedSettings();
      await this.a11y.testAppSnapshot();
    }
    await this.continue('about');
  }

  async createRuleStepThree(isA11yTestInProgress: boolean): Promise<void> {
    if (isA11yTestInProgress) {
      await this.a11y.testAppSnapshot();
    }
    await this.continue('schedule');
  }

  async createRuleStepFour(isA11yTestInProgress: boolean): Promise<void> {
    if (isA11yTestInProgress) {
      await this.a11y.testAppSnapshot();
    }
    await this._clickAndValidate('create-activate', 'ruleDetailsBackToAllRules');
    await this.goBackToAllRules();
  }

  async addNameAndDescription(name: string, description: string): Promise<void> {
    const nameInput = await this._getElementByDescription('detectionEngineStepAboutRuleName');
    await nameInput.type(name);
    const descriptionTextArea = await this._getElementByDescription(
      'detectionEngineStepAboutRuleDescription'
    );
    await descriptionTextArea.type(description);
  }

  async goBackToAllRules(): Promise<void> {
    await this._clickAndValidate('ruleDetailsBackToAllRules', 'create-new-rule');
  }

  async revealAdvancedSettings(): Promise<void> {
    await this._clickAndValidate('advancedSettings', 'detectionEngineStepAboutRuleReferenceUrls');
  }

  async preview(): Promise<void> {
    await this._clickAndValidate('queryPreviewButton', 'queryPreviewCustomHistogram');
  }

  async continue(prefix: string): Promise<void> {
    await this.testSubjects.click(`${prefix}-continue`);
  }

  async addCustomQuery(query: string): Promise<void> {
    await this._typeToElement('queryInput', query);
  }

  async _actIfTargetIsMissing(selector: string, callback: () => Promise<void>): Promise<void> {
    const isElementPresent = await this.testSubjects.exists(selector);
    if (!isElementPresent) {
      await callback();
    }
  }

  async _clickAndValidate(
    clickTarget: string,
    validator: string,
    isValidatorCssString: boolean = false
  ): Promise<void> {
    await this.testSubjects.click(clickTarget);
    const validate = isValidatorCssString ? this.find.byCssSelector : this.testSubjects.exists;
    await validate(validator);
  }

  async _getElementByDescription(describedBy: string): Promise<WebElementWrapper> {
    return await this.find.byCssSelector(this._getAriaDescribedBySelector(describedBy));
  }

  async _navigate(
    selector: string,
    missingTargetCallback: () => Promise<void>,
    validator: string,
    isA11yTestInProgress: boolean
  ): Promise<void> {
    await this._actIfTargetIsMissing(selector, missingTargetCallback);
    await this._clickAndValidate(selector, validator);
    if (isA11yTestInProgress) await this.a11y.testAppSnapshot();
  }

  async _typeToElement(selector: string, text: string): Promise<void> {
    const textAreaElement = await this.testSubjects.find(selector);
    await textAreaElement.type(text);
  }

  _getAriaDescribedBySelector(describedBy: string): string {
    return `[aria-describedby="${describedBy}"]`;
  }
}

export { DetectionsPageHelper };
