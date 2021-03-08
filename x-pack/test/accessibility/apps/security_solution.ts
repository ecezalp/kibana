/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { FtrProviderContext } from '../ftr_provider_context';

export default function ({ getService, getPageObjects }: FtrProviderContext) {
  const testSubjects = getService('testSubjects');
  const browser = getService('browser');
  const { common, detections } = getPageObjects(['common', 'detections']);

  describe('Security Solution', () => {
    before(async () => {
      browser.setWindowSize(1600, 1200);
      await common.navigateToApp('security');
      await testSubjects.exists('navigation-overview');
    });

    describe('Detections', () => {
      describe('Home', () => {
        it('default view meets a11y requirements', async () => {
          await detections.navigateHome(true);
        });
      });

      describe('Rules', () => {
        it('default tab view meets a11y requirements', async () => {
          await detections.navigateToRules(true);
        });

        it('rule monitoring tab view meets a11y requirements', async () => {
          await detections.navigateToRuleMonitoring(true);
        });

        it('exception list tab view meets a11y requirements', async () => {
          await detections.navigateToExceptionList(true);
        });

        describe('Create Rule Flow', () => {
          beforeEach(async () => {
            await common.navigateToUrl('securitySolution', 'detections/rules/create', {
              shouldUseHashForSubUrl: false,
            });
          });

          it('Custom Query Rule creation meets a11y requirements', async () => {
            await detections.customQueryRule.create(
              '_id',
              'test custom query rule',
              'test custom query description',
              true,
              true
            );
          });

          it('Machine Learning Rule creation meets a11y requirements', async () => {
            await detections.machineLearningRule.create(
              'test machine learning rule',
              'test machine learning description',
              true
            );
          });

          it('Threshold Rule creation meets a11y requirements', async () => {
            await detections.thresholdRule.create(
              '_id',
              'test threshold rule',
              'test threshold description',
              true
            );
          });

          it('Event Correlation Rule creation meets a11y requirements', async () => {
            await detections.eventCorrelationRule.create(
              'any where true',
              'test event correlation rule',
              'test event correlation description',
              true
            );
          });

          it('Indicator Match Rule creation meets a11y requirements', async () => {
            await detections.indicatorMatchRule.create(
              'logs-*',
              'test indicator match rule',
              'test indicator match description',
              true
            );
          });
        });
      });
    });
  });
}
