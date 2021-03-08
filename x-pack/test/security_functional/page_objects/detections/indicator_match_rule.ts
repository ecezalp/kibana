/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { DetectionsPageHelper } from './detections_page_helper';

class IndicatorMatchRule extends DetectionsPageHelper {
  constructor(injectedA11y: any, injectedFind: any, injectedTestSubjects: any) {
    super(injectedA11y, injectedFind, injectedTestSubjects);
  }

  async create(
    indexPatterns: string = 'logs-*',
    name: string = 'test rule',
    description: string = 'test description',
    isA11yTestInProgress: boolean = false,
    isA11yTestComprehensive: boolean = false
  ): Promise<void> {
    await this.createRule(
      async () => await this.createRuleStepOne(isA11yTestInProgress, indexPatterns),
      name,
      description,
      isA11yTestComprehensive
    );
  }

  async createRuleStepOne(isA11yTestInProgress: boolean, indexPatterns: string): Promise<void> {
    await this._clickAndValidate('threatMatchRuleType', 'comboBoxInput');
    if (isA11yTestInProgress) {
      await this.a11y.testAppSnapshot();

      await this.openAddFilterPopover();
      await this.a11y.testAppSnapshot();
      await this.viewQueryDslTextarea();
      await this.a11y.testAppSnapshot();
      await this.closeFilterPopover();

      await this.toggleLanguageSwitcher();
      await this.a11y.testAppSnapshot();
      await this.toggleLanguageSwitcher();

      await this.toggleFilterActions();
      await this.a11y.testAppSnapshot();
      await this.toggleFilterActions();

      await this.toggleSavedQueries();
      await this.a11y.testAppSnapshot();
      await this.toggleSavedQueries();

      await this.testSubjects('andButton').click();
      await this.testSubjects('orButton').click();
      await this.a11y.testAppSnapshot();
    }
    // await this.addIndicatorIndexPatterns(indexPatterns);
    // await this.continue('define');
  }

  async openAddFilterPopover(): Promise<void> {
    const addButtons = await this.find.allByCssSelector('[data-test-subj="addFilter"]');
    await addButtons[1].click();
    await this.find('saveFilter');
  }

  async viewQueryDslTextarea(): Promise<void> {
    await this._clickAndValidate('editQueryDSL', 'codeEditorHint');
  }

  async closeFilterPopover(): Promise<void> {
    await this.testSubjects.find('cancelSaveFilter').click();
  }

  async toggleLanguageSwitcher(): Promise<void> {
    const languageSwitchers = await this.find.allByCssSelector(
      '[data-test-subj="switchQueryLanguageButton"]'
    );
    await languageSwitchers[1].click();
  }

  async toggleFilterActions(): Promise<void> {
    const filterActions = await this.find.allByCssSelector('[data-test-subj="addFilter"]');
    await filterActions[1].click();
  }

  async toggleSavedQueries(): Promise<void> {
    const filterActions = await this.find.allByCssSelector(
      '[data-test-subj="saved-query-management-popover-button"]'
    );
    await filterActions[1].click();
  }

  // async addIndicatorIndexPatterns(indexPatterns: string): Promise<void> {
  //  await this._typeToElement('comboBoxInput', indexPatterns);
  // }
}

export { IndicatorMatchRule };
