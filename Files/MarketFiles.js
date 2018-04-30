﻿
function newMarketFiles() {

    const MODULE_NAME = "Market Files";
    const INFO_LOG = false;
    const ERROR_LOG = true;
    const logger = newDebugLog();
    logger.fileName = MODULE_NAME;

    let thisObject = {
        getFile: getFile,
        getExpectedFiles: getExpectedFiles,
        getFilesLoaded: getFilesLoaded,
        initialize: initialize
    }

    let filesLoaded = 0;

    let fileCloud;

    let files = new Map;
    
    return thisObject;

    function initialize(pDevTeam, pBot, pProduct, pSet, pExchange, pMarket, callBackFunction) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }
            if (INFO_LOG === true) { logger.write("[INFO] initialize -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName); }

            let exchange = ecosystem.getExchange(pProduct, pExchange);

            if (exchange === undefined) {

                throw "Exchange not supoorted by this pProduct of the ecosystem! - pDevTeam.codeName = " + pDevTeam.codeName + ", pBot.codeName = " + pBot.codeName + ", pProduct.codeName = " + pProduct.codeName + ", pExchange = " + pExchange;

            }

            fileCloud = newFileCloud();
            fileCloud.initialize(pBot);

            /* Now we will get the market files */

            for (let i = 0; i < marketFilesPeriods.length; i++) {

                let periodTime = marketFilesPeriods[i][0];
                let periodName = marketFilesPeriods[i][1];

                if (pSet.validPeriods.includes(periodName) === true) {

                    fileCloud.getFile(pDevTeam, pBot, pSet, exchange, pMarket, periodName, undefined, undefined, onFileReceived);

                    function onFileReceived(err, file) {

                        try {

                            if (INFO_LOG === true) { logger.write("[INFO] initialize -> onFileReceived -> Entering function."); }

                            switch (err.result) {
                                case GLOBAL.DEFAULT_OK_RESPONSE.result: {

                                    if (INFO_LOG === true) { logger.write("[INFO] initialize -> onFileReceived -> Received OK Response."); }
                                    break;
                                }

                                case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {

                                    if (INFO_LOG === true) { logger.write("[INFO] initialize -> onFileReceived -> Received FAIL Response."); }
                                    callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
                                    return;
                                }

                                case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {

                                    if (INFO_LOG === true) { logger.write("[INFO] initialize -> onFileReceived -> Received CUSTOM FAIL Response."); }
                                    if (INFO_LOG === true) { logger.write("[INFO] initialize -> onFileReceived -> err.message = " + err.message); }

                                    callBackFunction(err);
                                    return;
                                }

                                default: {

                                    if (INFO_LOG === true) { logger.write("[INFO] initialize -> onFileReceived -> Received Unexpected Response."); }
                                    callBackFunction(err);
                                    return;
                                }
                            }

                            files.set(periodTime, file);

                            filesLoaded++;

                            callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, thisObject); // Note that the callback is called for every file loaded.

                        } catch (err) {

                            if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> onFileReceived -> err = " + err); }
                            callBackFunction(GLOBAL.CUSTOM_FAIL_RESPONSE);
                        }
                    }
                }
            }


        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> err = " + err); }
            callBackFunction(GLOBAL.CUSTOM_FAIL_RESPONSE);
        }
    }
  
    function getFile(pPeriod) {

        if (INFO_LOG === true) { logger.write("[INFO] getFile -> Entering function."); }

        return files.get(pPeriod);

    }

    function getExpectedFiles() {

        if (INFO_LOG === true) { logger.write("[INFO] getExpectedFiles -> Entering function."); }

        return marketFilesPeriods.length;

    }

    function getFilesLoaded() {

        if (INFO_LOG === true) { logger.write("[INFO] getFilesLoaded -> Entering function."); }

        return filesLoaded;

    }

}