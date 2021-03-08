/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { FtrProviderContext } from '../../../functional/ftr_provider_context';
import { CustomQueryRule } from './custom_query_rule';
import { DetectionsPageHelper } from './detections_page_helper';
import { MachineLearningRule } from './machine_learning_rule';
import { ThresholdRule } from './threshold_rule';
import { EventCorrelationRule } from './event_correlation_rule';
import { IndicatorMatchRule } from './indicator_match_rule';

export function DetectionsPageProvider({ getService }: FtrProviderContext) {
  const a11y = getService('a11y');
  const find = getService('find');
  const testSubjects = getService('testSubjects');

  class DetectionsPage extends DetectionsPageHelper {
    customQueryRule;
    eventCorrelationRule;
    indicatorMatchRule;
    machineLearningRule;
    thresholdRule;

    constructor() {
      super(a11y, find, testSubjects);
      this.customQueryRule = new CustomQueryRule(a11y, find, testSubjects);
      this.eventCorrelationRule = new EventCorrelationRule(a11y, find, testSubjects);
      this.indicatorMatchRule = new IndicatorMatchRule(a11y, find, testSubjects);
      this.machineLearningRule = new MachineLearningRule(a11y, find, testSubjects);
      this.thresholdRule = new ThresholdRule(a11y, find, testSubjects);
    }

    async navigateHome(isA11yTestInProgress: boolean = false): Promise<void> {
      await this._clickAndValidate('navigation-detections', 'manageDetectionRulesButtonExists');
      if (isA11yTestInProgress) await a11y.testAppSnapshot();
    }

    async navigateToRules(isA11yTestInProgress: boolean = false): Promise<void> {
      await this._navigate(
        'manage-alert-detection-rules',
        () => this.navigateHome(isA11yTestInProgress),
        'allRulesTableTab-rules',
        isA11yTestInProgress
      );
    }

    async navigateToRuleMonitoring(isA11yTestInProgress: boolean = false): Promise<void> {
      await this._navigate(
        'allRulesTableTab-monitoring',
        () => this.navigateToRules(isA11yTestInProgress),
        'monitoring-table',
        isA11yTestInProgress
      );
    }

    async navigateToExceptionList(isA11yTestInProgress: boolean = false): Promise<void> {
      await this._navigate(
        'allRulesTableTab-exceptions',
        () => this.navigateToRules(isA11yTestInProgress),
        'exceptions-table',
        isA11yTestInProgress
      );
    }

    async navigateToCreateRule(isA11yTestInProgress: boolean = false): Promise<void> {
      await this._navigate(
        'create-new-rule',
        () => this.navigateToRules(isA11yTestInProgress),
        'customRuleType',
        isA11yTestInProgress
      );
    }
  }

  return new DetectionsPage();
}
