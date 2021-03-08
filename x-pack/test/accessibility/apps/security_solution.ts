/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { FtrProviderContext } from '../ftr_provider_context';

export default function ({ getService, getPageObjects }: FtrProviderContext) {
  const PageObjects = getPageObjects(['common', 'home', 'detections', 'security', 'login']);
  const DetectionsPage = PageObjects.detections;
  const a11y = getService('a11y');
  const testSubjects = getService('testSubjects');
  const browser = getService('browser');

  const clickOnTab = async (tabSelector: string) => {
    await testSubjects.click(tabSelector);
    await testSubjects.exists('navigation-detections');
  };

  describe('Security Solution', () => {
    before(async () => {
      await browser.setWindowSize(1600, 1200);
      // await PageObjects.login.login('test_user', 'changeme');
      // await PageObjects.common.navigateToApp('security');
      await testSubjects.exists('navigation-overview');
    });

    describe('When there is no data in the system', () => {
      describe('Overview', () => {
        it('Overview default view meets a11y requirements', async () => {
          await a11y.testAppSnapshot();
        });
      });

      describe('Hosts', () => {
        it('Hosts default view meets a11y requirements', async () => {
          await clickOnTab('navigation-hosts');
          await a11y.testAppSnapshot();
        });
      });

      describe('Network', () => {
        it('Network default view meets a11y requirements', async () => {
          await clickOnTab('navigation-network');
          await a11y.testAppSnapshot();
        });
      });

      describe('Timelines', () => {
        it('Timelines default view meets a11y requirements', async () => {
          await clickOnTab('navigation-timelines');
          await a11y.testAppSnapshot();
        });
      });

      describe('Cases', () => {
        it('Cases default view meets a11y requirements', async () => {
          await clickOnTab('navigation-case');
          await a11y.testAppSnapshot();
        });
      });

      describe('Administration', () => {
        it('Administration default view meets a11y requirements', async () => {
          await clickOnTab('navigation-administration');
          await a11y.testAppSnapshot();
        });
      });

      describe('Detections', () => {
        describe('When there are no rules', () => {
          it('Detections default view meets a11y requirements', async () => {
            await DetectionsPage.navigateHome();
            await a11y.testAppSnapshot();
          });

          describe('Manage Detection Rules section', () => {
            it('Rules default view meets a11y requirements', async () => {
              await DetectionsPage.navigateToRules();
              await a11y.testAppSnapshot();
            });

            it('Rule Monitoring view meets a11y requirements', async () => {
              await DetectionsPage.navigateToRuleMonitoring();
              await a11y.testAppSnapshot();
            });

            it('Exception Lists view meets a11y requirements', async () => {
              await DetectionsPage.navigateToExceptionList();
              await a11y.testAppSnapshot();
            });
          });
        });

        // describe('Manual Rule Creation Flow', () => {
        //   // before(async () => {
        //   //   await DetectionsPage.navigateToCreateRule();
        //   // });
        //
        //   describe('Creating a Custom Query rule', async () => {
        //     describe('Step 1', () => {
        //       after(() => {
        //         DetectionsPage.createRule_continue('define');
        //       });
        //
        //       it('Default view for 1st step meets a11y requirements', async () => {
        //         await a11y.testAppSnapshot();
        //       });
        //
        //       it('Importing Query from saved timeline meets a11y requirements when there are no timeline events', async () => {
        //         await DetectionsPage.createCustomQueryRule_openImportQueryModal();
        //         await a11y.testAppSnapshot();
        //       });
        //
        //       it('Importing Query from saved timeline template view meets a11y requirements', async () => {
        //         await DetectionsPage.createCustomQueryRule_viewTemplatesInImportQueryModal();
        //         await a11y.testAppSnapshot();
        //         await DetectionsPage.createCustomQueryRule_closeImportQueryModal();
        //       });
        //
        //       it('preview view meets a11y requirements', async () => {
        //         await DetectionsPage.createCustomQueryRule_addCustomQuery('_id');
        //         await DetectionsPage.createCustomQueryRule_preview();
        //         await a11y.testAppSnapshot();
        //       });
        //     });
        //     describe('Step 2', () => {
        //       after(() => {
        //         DetectionsPage.createRule_continue('about');
        //       });
        //
        //       it('Default view for 2nd step meets a11y requirements', async () => {
        //         await a11y.testAppSnapshot();
        //       });
        //
        //       it('Advanced settings meets a11y requirements', async () => {
        //         await DetectionsPage.createCustomQueryRule_addNameAndDescription(
        //           'custom query',
        //           'test'
        //         );
        //         await DetectionsPage.createCustomQueryRule_revealAdvancedSettings();
        //         await a11y.testAppSnapshot();
        //       });
        //     });
        //   });
        //
        //   describe('Creating a Custom Query rule (II)', () => {
        //     DetectionsPage.createCustomQueryRule("_id", a11y.testAppSnapshot);
        //   })
        // });

        // TODO: Add Elastic rules a11y tests
        describe('When Elastic rules are added', () => {});

        // TODO: Add rule import tests
        describe('When Rules are imported', () => {});
      });
    });

    // TODO: Add data & repeat
    describe('When there is data in the system', () => {
      before(() => {
        // load data
      });
    });
  });
}
