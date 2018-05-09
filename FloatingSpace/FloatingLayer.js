﻿
function newFloatingLayer() {

    const MODULE_NAME = "Floating Layer";
    const INFO_LOG = false;
    const ERROR_LOG = true;
    const logger = newDebugLog();
    logger.fileName = MODULE_NAME;

    let thisObject = {
        addFloatingObject: addFloatingObject,
        killFloatingObject: killFloatingObject,
        getFloatingObject: getFloatingObject,
        physicsLoop: physicsLoop,
        isInside: isInside,
        isInsideFloatingObject: isInsideFloatingObject,
        changeTargetRepulsion: changeTargetRepulsion,
        initialize: initialize
    };

    let visibleFloatingObjects = [];
    let invisibleFloatingObjects = [];
    let dyingFloatingObjects = [];

    let maxTargetRepulsionForce = 0.0005;

    return thisObject;

    function initialize(callBackFunction) {

        if (INFO_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }

        callBackFunction();
    }

    function addFloatingObject(pFloatingObject) {

        if (INFO_LOG === true) { logger.write("[INFO] addFloatingObject -> Entering function."); }

        invisibleFloatingObjects.push(pFloatingObject);

        if (INFO_LOG === true) { logger.write("[INFO] addFloatingObject -> invisibleFloatingObjects.length = " + invisibleFloatingObjects.length); }

        pFloatingObject.handle = Math.floor((Math.random() * 10000000) + 1);

        if (INFO_LOG === true) { logger.write("[INFO] addFloatingObject -> pFloatingObject.handle = " + pFloatingObject.handle); }
        if (INFO_LOG === true) { logger.write("[INFO] addFloatingObject -> pFloatingObject.type = " + pFloatingObject.type); }

    }

    function killFloatingObject(pFloatingObjectHandle) {

        if (INFO_LOG === true) { logger.write("[INFO] killFloatingObject -> Entering function."); }

        for (let i = 0; i < invisibleFloatingObjects.length; i++) {

            let floatingObject = invisibleFloatingObjects[i];

            if (floatingObject.handle === pFloatingObjectHandle) {
                invisibleFloatingObjects.splice(i, 1);  // Delete item from array.

                if (INFO_LOG === true) { logger.write("[INFO] killFloatingObject -> floatingObject.handle = " + floatingObject.handle); }
                if (INFO_LOG === true) { logger.write("[INFO] killFloatingObject -> Removing floatingObject from invisibleFloatingObjects."); }
                if (INFO_LOG === true) { logger.write("[INFO] killFloatingObject -> invisibleFloatingObjects.length = " + invisibleFloatingObjects.length); }

                sendToDie(floatingObject);
                return;
            }
        }

        for (let i = 0; i < visibleFloatingObjects.length; i++) {

            let floatingObject = visibleFloatingObjects[i];

            if (floatingObject.handle === pFloatingObjectHandle) {
                visibleFloatingObjects.splice(i, 1);  // Delete item from array.

                if (INFO_LOG === true) { logger.write("[INFO] killFloatingObject -> floatingObject.handle = " + floatingObject.handle); }
                if (INFO_LOG === true) { logger.write("[INFO] killFloatingObject -> Removing floatingObject from visibleFloatingObjects."); }
                if (INFO_LOG === true) { logger.write("[INFO] killFloatingObject -> visibleFloatingObjects.length = " + visibleFloatingObjects.length); }

                sendToDie(floatingObject);
                return;
            }
        }

        function sendToDie(pFloatingObject) {

            /* Lets mofigy the targerRadius */

            pFloatingObject.targetRadius = 0;

            /* Lets transfer the payload to a new payload structure. */

            let payload = {};

            switch (pFloatingObject.type) {

                case "Profile Ball": {

                    if (pFloatingObject.payload.profile.visible === false) { return;}

                    payload.profile = {
                        position: {
                            x: pFloatingObject.payload.profile.position.x,
                            y: pFloatingObject.payload.profile.position.y
                        },
                        visible: pFloatingObject.payload.profile.visible
                    }

                    pFloatingObject.payload = payload;
                    break;
                }
                case "Note": {

                    if (pFloatingObject.payload.notes[pFloatingObject.payloadNoteIndex].visible === false) { return; }

                    payload.notes = [];
                    let note = {
                        title: pFloatingObject.payload.notes[pFloatingObject.payloadNoteIndex].title,
                        body: pFloatingObject.payload.notes[pFloatingObject.payloadNoteIndex].body,
                        date: pFloatingObject.payload.notes[pFloatingObject.payloadNoteIndex].date,
                        rate: pFloatingObject.payload.notes[pFloatingObject.payloadNoteIndex].rate,
                        position: {
                            x: pFloatingObject.payload.notes[pFloatingObject.payloadNoteIndex].position.x,
                            y: pFloatingObject.payload.notes[pFloatingObject.payloadNoteIndex].position.y
                        },
                        visible: pFloatingObject.payload.notes[pFloatingObject.payloadNoteIndex].visible
                    };
                    payload.notes.push(note);
                    pFloatingObject.payloadNoteIndex = 0;

                    pFloatingObject.payload = payload;
                    break;
                }
                default: {

                    break;
                }
            }

            dyingFloatingObjects.push(pFloatingObject);

            if (INFO_LOG === true) { logger.write("[INFO] killFloatingObject -> Adding floatingObject to dyingFloatingObjects."); }
            if (INFO_LOG === true) { logger.write("[INFO] killFloatingObject -> dyingFloatingObjects.length = " + dyingFloatingObjects.length); }
        }
    }

    function getFloatingObject(pFloatingObjectHandle, pFloatingObjectIndex) {

        if (INFO_LOG === true) { logger.write("[INFO] getFloatingObject -> Entering function."); }

        if (pFloatingObjectHandle !== undefined) {

            for (let i = 0; i < invisibleFloatingObjects.length; i++) {

                let floatingObject = invisibleFloatingObjects[i];

                if (floatingObject.handle === pFloatingObjectHandle) {

                    return floatingObject;
                }
            }

            for (let i = 0; i < visibleFloatingObjects.length; i++) {

                let floatingObject = visibleFloatingObjects[i];

                if (floatingObject.handle === pFloatingObjectHandle) {

                    return floatingObject;
                }
            }
        }

        if (pFloatingObjectIndex !== undefined) {

            for (let i = 0; i < visibleFloatingObjects.length; i++) {

                let floatingObject = visibleFloatingObjects[i];

                if (i === pFloatingObjectIndex) {

                    return floatingObject;
                }
            }
        }
    }


    /******************************************/
    /*                                        */
    /*        Physics Engine Follows          */
    /*                                        */
    /******************************************/

    function physicsLoop() {

        /* This function makes all the calculations to apply phisycs on all floatingObjects in this space. */

        for (let i = 0; i < visibleFloatingObjects.length; i++) {

            let floatingObject = visibleFloatingObjects[i];

            /* Change position based on speed */

            floatingObject.currentPosition.x = floatingObject.currentPosition.x + floatingObject.currentSpeed.x;
            floatingObject.currentPosition.y = floatingObject.currentPosition.y + floatingObject.currentSpeed.y;

            /* Apply some friction to desacelerate */

            floatingObject.currentSpeed.x = floatingObject.currentSpeed.x * floatingObject.friction;  // Desaceleration factor.
            floatingObject.currentSpeed.y = floatingObject.currentSpeed.y * floatingObject.friction;  // Desaceleration factor.

            // Gives a minimun speed towards their taget.

            let payload = {
                position: undefined,
                visible: false
            };

            switch (floatingObject.type) {

                case "Profile Ball": {

                    payload.position = floatingObject.payload.profile.position;
                    payload.visible = floatingObject.payload.profile.visible;
                    break;
                }
                case "Note": {

                    payload.position = floatingObject.payload.notes[floatingObject.payloadNoteIndex].position;
                    payload.visible = floatingObject.payload.notes[floatingObject.payloadNoteIndex].visible;

                    break;
                }
                default: {

                    break;
                }
            }

            if (floatingObject.currentPosition.x < payload.position.x) {
                floatingObject.currentSpeed.x = floatingObject.currentSpeed.x + .005;
            } else {
                floatingObject.currentSpeed.x = floatingObject.currentSpeed.x - .005;
            }

            if (floatingObject.currentPosition.y < payload.position.y) {
                floatingObject.currentSpeed.y = floatingObject.currentSpeed.y + .005;
            } else {
                floatingObject.currentSpeed.y = floatingObject.currentSpeed.y - .005;
            }

            // Lets put a maximun speed also.

            const MAX_SPEED = 50;

            if (floatingObject.currentSpeed.x > MAX_SPEED) {
                floatingObject.currentSpeed.x = MAX_SPEED;
            }

            if (floatingObject.currentSpeed.y > MAX_SPEED) {
                floatingObject.currentSpeed.y = MAX_SPEED;
            }

            if (floatingObject.currentSpeed.x < -MAX_SPEED) {
                floatingObject.currentSpeed.x = -MAX_SPEED;
            }

            if (floatingObject.currentSpeed.y < -MAX_SPEED) {
                floatingObject.currentSpeed.y = -MAX_SPEED;
            }

            // The radius also have a target.

            if (Math.abs(floatingObject.currentRadius - floatingObject.targetRadius) >= 1) {

                if (floatingObject.currentRadius < floatingObject.targetRadius) {
                    floatingObject.currentRadius = floatingObject.currentRadius + .5;
                } else {
                    floatingObject.currentRadius = floatingObject.currentRadius - .5;
                }
            }

            // The imageSize also have a target.

            if (Math.abs(floatingObject.currentImageSize - floatingObject.targetImageSize) >= 1) {

                if (floatingObject.currentImageSize < floatingObject.targetImageSize) {
                    floatingObject.currentImageSize = floatingObject.currentImageSize + 1;
                } else {
                    floatingObject.currentImageSize = floatingObject.currentImageSize - 1;
                }
            }


            /* Collision Control */

            for (let k = i + 1; k < visibleFloatingObjects.length; k++) {

                if (colliding(visibleFloatingObjects[i], visibleFloatingObjects[k])) {

                    resolveCollision(visibleFloatingObjects[k], visibleFloatingObjects[i]);

                }
            }

            /* Calculate repulsion force produced by all other floatingObjects */

            currentRepulsionForce(i);

            targetRepulsionForce(i);

            gravityForce(floatingObject, payload);

        }

        /* We draw all the visibleFloatingObjects. */

        for (let i = 0; i < visibleFloatingObjects.length; i++) {
            let floatingObject = visibleFloatingObjects[i];
            floatingObject.drawBackground();
        }

        for (let i = 0; i < visibleFloatingObjects.length; i++) {
            let floatingObject = visibleFloatingObjects[visibleFloatingObjects.length - i - 1];
            floatingObject.drawForeground();
        }

        /* Now we check if any of the created FloatingObjects where enabled to run under the Physics Engine. */

        for (let i = 0; i < invisibleFloatingObjects.length; i++) {

            let floatingObject = invisibleFloatingObjects[i];

            let payload = {
                position: undefined,
                visible: false
            };

            switch (floatingObject.type) {

                case "Profile Ball": {

                    payload.position = floatingObject.payload.profile.position;
                    payload.visible = floatingObject.payload.profile.visible;
                    break;
                }
                case "Note": {

                    payload.position = floatingObject.payload.notes[floatingObject.payloadNoteIndex].position;
                    payload.visible = floatingObject.payload.notes[floatingObject.payloadNoteIndex].visible;
                    break;
                }
                default: {

                    break;
                }
            }

            if (payload.visible === true) {

                if (INFO_LOG === true) { logger.write("[INFO] physicsLoop -> payload.visible = " + payload.visible); }

                /* The first time that the floatingObject becomes visible, we need to do this. */

                floatingObject.radomizeCurrentPosition(payload.position);
                floatingObject.radomizeCurrentSpeed();

                visibleFloatingObjects.push(floatingObject);

                if (INFO_LOG === true) { logger.write("[INFO] physicsLoop -> floatingObject.handle = " + floatingObject.handle); }
                if (INFO_LOG === true) { logger.write("[INFO] physicsLoop -> floatingObject added to visibleFloatingObjects"); }
                if (INFO_LOG === true) { logger.write("[INFO] physicsLoop -> visibleFloatingObjects.length = " + visibleFloatingObjects.length); }

                invisibleFloatingObjects.splice(i, 1);  // Delete item from array.

                if (INFO_LOG === true) { logger.write("[INFO] physicsLoop -> floatingObject.handle = " + floatingObject.handle); }
                if (INFO_LOG === true) { logger.write("[INFO] physicsLoop -> floatingObject removed from invisibleFloatingObjects"); }
                if (INFO_LOG === true) { logger.write("[INFO] physicsLoop -> invisibleFloatingObjects.length = " + invisibleFloatingObjects.length); }

                return;                     // Only one at the time. 

            }
        }

        /* Finally we check if any of the currently visible floatingObjects has become invisible and must be removed from the Physics Engine. */

        for (let i = 0; i < visibleFloatingObjects.length; i++) {

            let floatingObject = visibleFloatingObjects[i];

            let payload = {
                position: undefined,
                visible: true
            };

            switch (floatingObject.type) {

                case "Profile Ball": {

                    payload.visible = floatingObject.payload.profile.visible;
                    break;
                }
                case "Note": {

                    payload.visible = floatingObject.payload.notes[floatingObject.payloadNoteIndex].visible;
                    break;
                }
                default: {

                    break;
                }
            }

            if (payload.visible === false) {

                if (INFO_LOG === true) { logger.write("[INFO] physicsLoop -> payload.visible = " + payload.visible); }

                invisibleFloatingObjects.push(floatingObject);

                if (INFO_LOG === true) { logger.write("[INFO] physicsLoop -> floatingObject.handle = " + floatingObject.handle); }
                if (INFO_LOG === true) { logger.write("[INFO] physicsLoop -> floatingObject added to invisibleFloatingObjects"); }
                if (INFO_LOG === true) { logger.write("[INFO] physicsLoop -> invisibleFloatingObjects.length = " + invisibleFloatingObjects.length); }

                visibleFloatingObjects.splice(i, 1);  // Delete item from array.

                if (INFO_LOG === true) { logger.write("[INFO] physicsLoop -> floatingObject.handle = " + floatingObject.handle); }
                if (INFO_LOG === true) { logger.write("[INFO] physicsLoop -> floatingObject removed from visibleFloatingObjects"); }
                if (INFO_LOG === true) { logger.write("[INFO] physicsLoop -> visibleFloatingObjects.length = " + visibleFloatingObjects.length); }

                return;                     // Only one at the time. 

            }
        }

        /* We animate some parts of the dying objects */

        for (let i = 0; i < dyingFloatingObjects.length; i++) {

            let floatingObject = dyingFloatingObjects[i];

            if (Math.abs(floatingObject.currentRadius - floatingObject.targetRadius) >= 5) {

                let speed = Math.random();

                floatingObject.currentRadius = floatingObject.currentRadius - speed * 3;

            } else {

                /* Here is when the floatingObjects are definetelly killed. */

                dyingFloatingObjects.splice(i, 1);  // Delete item from array.
                break;  // only one at the time. 
            }
        }

        /* We also draw all the dyingFloatingObjects */

        for (let i = 0; i < dyingFloatingObjects.length; i++) {
            let floatingObject = dyingFloatingObjects[i];
            floatingObject.drawBackground();
        }

        for (let i = 0; i < dyingFloatingObjects.length; i++) {
            let floatingObject = dyingFloatingObjects[dyingFloatingObjects.length - i - 1];
            floatingObject.drawForeground();
        }
    }

    function gravityForce(floatingObject, payload) {

        /* We simulate a kind of gravity towards the target point of each floatingObject. This force will make the floatingObject to keep pushing to reach that point. */

        const coulomb = .00001;
        const minForce = 0.01;

        var d = Math.sqrt(Math.pow(payload.position.x - floatingObject.currentPosition.x, 2) + Math.pow(payload.position.y - floatingObject.currentPosition.y, 2));  // ... we calculate the distance ...

        var force = coulomb * d * d / floatingObject.currentMass;  // In this case the mass of the floatingObject affects the gravity force that it receives, that gives priority to target position to bigger floatingObjects. 

        if (force < minForce) { // We need this attraction force to overcome the friction we imposed to the system.
            force = minForce;
        }

        var pos1 = {
            x: floatingObject.currentPosition.x,
            y: floatingObject.currentPosition.y
        };

        var pos2 = {
            x: payload.position.x,
            y: payload.position.y
        };

        var posDiff = {             // Next we need the vector resulting from the 2 positions.
            x: pos2.x - pos1.x,
            y: pos2.y - pos1.y
        };

        var unitVector = {          // To find the unit vector, we divide each component by the magnitude of the vector.
            x: posDiff.x / d,
            y: posDiff.y / d
        };

        var forceVector = {
            x: unitVector.x * force,
            y: unitVector.y * force
        };

        /* We add the force vector to the speed vector */

        floatingObject.currentSpeed.x = floatingObject.currentSpeed.x + forceVector.x;
        floatingObject.currentSpeed.y = floatingObject.currentSpeed.y + forceVector.y;

    }

    function currentRepulsionForce(currentFloatingObject) {

        /* We generate a repulsion force between floatingObjects, that prevents them to be collisioning so often. */

        const coulomb = 2;

        var floatingObject1 = visibleFloatingObjects[currentFloatingObject];

        for (var i = 0; i < visibleFloatingObjects.length; i++) {  // The force to be applied is considering all other floatingObjects...

            if (i !== currentFloatingObject) {  // ... except for the current one. 

                var floatingObject2 = visibleFloatingObjects[i];   // So, for each floatingObject...

                var d = Math.sqrt(Math.pow(floatingObject2.currentPosition.x - floatingObject1.currentPosition.x, 2) + Math.pow(floatingObject2.currentPosition.y - floatingObject1.currentPosition.y, 2));  // ... we calculate the distance ...

                var force = coulomb * floatingObject2.currentMass / (d * d);  // ... and with it the repulsion force.

                /* We need to put a hard limit to this force, in order to to eject very little floatingObjects to the infinite and beyond. */

                if (force > 1) {
                    force = 1;
                }

                var pos1 = {
                    x: floatingObject1.currentPosition.x,
                    y: floatingObject1.currentPosition.y
                };

                var pos2 = {
                    x: floatingObject2.currentPosition.x,
                    y: floatingObject2.currentPosition.y
                };

                var posDiff = {             // Next we need the vector resulting from the 2 positions.
                    x: pos2.x - pos1.x,
                    y: pos2.y - pos1.y
                };

                var unitVector = {          // To find the unit vector, we divide each component by the magnitude of the vector.
                    x: posDiff.x / d,
                    y: posDiff.y / d
                };

                var forceVector = {
                    x: unitVector.x * force,
                    y: unitVector.y * force
                };

                /* We substract the force vector to the speed vector of the current floatingObject */

                floatingObject1.currentSpeed.x = floatingObject1.currentSpeed.x - forceVector.x;
                floatingObject1.currentSpeed.y = floatingObject1.currentSpeed.y - forceVector.y;

            }

        }

    }

    function targetRepulsionForce(currentFloatingObject) {

        /* We generate a repulsion force between floatingObjects, that prevents them to be collisioning so often. */

        const coulomb = 2;

        var floatingObject1 = visibleFloatingObjects[currentFloatingObject];

        for (var i = 0; i < visibleFloatingObjects.length; i++) {  // The force to be applied is considering all other floatingObjects...

            var floatingObject2 = visibleFloatingObjects[i];   // So, for each floatingObject...

            let payload = {
                position: undefined
            };

            switch (floatingObject2.type) {

                case "Profile Ball": {

                    payload.position = floatingObject2.payload.profile.position;
                    break;
                }
                case "Note": {

                    payload.position = floatingObject2.payload.notes[floatingObject2.payloadNoteIndex].position;
                    break;
                }
                default: {

                    break;
                }
            }

            var d = Math.sqrt(Math.pow(payload.position.x - floatingObject1.currentPosition.x, 2) + Math.pow(payload.position.y - floatingObject1.currentPosition.y, 2));  // ... we calculate the distance ...

            var force = coulomb * floatingObject2.currentMass / (d * d);  // ... and with it the repulsion force.

            /* We need to put a hard limit to this force, in order to to eject very little floatingObjects to the infinite and beyond. */

            if (force > maxTargetRepulsionForce) {
                force = maxTargetRepulsionForce;
            }
            
            var pos1 = {
                x: floatingObject1.currentPosition.x,
                y: floatingObject1.currentPosition.y
            };

            var pos2 = {
                x: payload.position.x,
                y: payload.position.y
            };

            var posDiff = {             // Next we need the vector resulting from the 2 positions.
                x: pos2.x - pos1.x,
                y: pos2.y - pos1.y
            };

            var unitVector = {          // To find the unit vector, we divide each component by the magnitude of the vector.
                x: posDiff.x / d,
                y: posDiff.y / d
            };

            var forceVector = {
                x: unitVector.x * force,
                y: unitVector.y * force
            };

            /* We substract the force vector to the speed vector of the current floatingObject */

            floatingObject1.currentSpeed.x = floatingObject1.currentSpeed.x - forceVector.x;
            floatingObject1.currentSpeed.y = floatingObject1.currentSpeed.y - forceVector.y;

        }

    }

    function changeTargetRepulsion(pDelta) {

        if (pDelta > 0) {

            pDelta = 1;
            
        } else {

            pDelta = -1;

        }

        maxTargetRepulsionForce = maxTargetRepulsionForce + pDelta / 10000;

        if (maxTargetRepulsionForce < 0.0001) {

            maxTargetRepulsionForce = 0.0001
        }
    }

    function colliding(floatingObject1, floatingObject2) {
        /* This function detects weather 2 floatingObjects collide with each other. */

        var r1 = floatingObject1.currentRadius;
        var r2 = floatingObject2.currentRadius;

        var distance = Math.sqrt(Math.pow(floatingObject2.currentPosition.x - floatingObject1.currentPosition.x, 2) + Math.pow(floatingObject2.currentPosition.y - floatingObject1.currentPosition.y, 2));

        if (distance > (r1 + r2)) {
            // No solutions, the circles are too far apart.  
            return false;
        }
        else if (distance <= r1 + r2) {
            // One circle contains the other.
            return true;
        }
        else if ((distance === 0) && (r1 === r2)) {
            // the circles coincide.
            return true;
        }
        else return true;
    }

    function isInside(x, y) {

        /* This function detects weather the point x,y is inside any of the floatingObjects. */

        for (var i = 0; i < visibleFloatingObjects.length; i++) {
            var floatingObject = visibleFloatingObjects[i];
            var distance = Math.sqrt(Math.pow(floatingObject.currentPosition.x - x, 2) + Math.pow(floatingObject.currentPosition.y - y, 2));

            if (distance < floatingObject.currentRadius) {
                return i;
            }
        }
        return -1;

    }

    function isInsideFloatingObject(floatingObjectIndex, x, y) {

        /* This function detects weather the point x,y is inside one particular floatingObjects. */


        var floatingObject = visibleFloatingObjects[floatingObjectIndex];
        var distance = Math.sqrt(Math.pow(floatingObject.currentPosition.x - x, 2) + Math.pow(floatingObject.currentPosition.y - y, 2));

        if (distance < floatingObject.currentRadius) {
            return true;
        }

        return false;

    }

    function distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    function resolveCollision(floatingObject1, floatingObject2) {

        /* This function changes speed and position of floatingObjects that are in collision */

        var collisionision_angle = Math.atan2((floatingObject2.currentPosition.y - floatingObject1.currentPosition.y), (floatingObject2.currentPosition.x - floatingObject1.currentPosition.x));

        var speed1 = Math.sqrt(floatingObject1.currentSpeed.x * floatingObject1.currentSpeed.x + floatingObject1.currentSpeed.y * floatingObject1.currentSpeed.y);  // Magnitude of Speed Vector for floatingObject 1
        var speed2 = Math.sqrt(floatingObject2.currentSpeed.x * floatingObject2.currentSpeed.x + floatingObject2.currentSpeed.y * floatingObject2.currentSpeed.y);  // Magnitude of Speed Vector for floatingObject 2

        var direction_1 = Math.atan2(floatingObject1.currentSpeed.y, floatingObject1.currentSpeed.x);
        var direction_2 = Math.atan2(floatingObject2.currentSpeed.y, floatingObject2.currentSpeed.x);

        var new_xspeed_1 = speed1 * Math.cos(direction_1 - collisionision_angle);
        var new_yspeed_1 = speed1 * Math.sin(direction_1 - collisionision_angle);
        var new_xspeed_2 = speed2 * Math.cos(direction_2 - collisionision_angle);
        var new_yspeed_2 = speed2 * Math.sin(direction_2 - collisionision_angle);

        var final_xspeed_1 = ((floatingObject1.currentMass - floatingObject2.currentMass) * new_xspeed_1 + (floatingObject2.currentMass + floatingObject2.currentMass) * new_xspeed_2) / (floatingObject1.currentMass + floatingObject2.currentMass);
        var final_xspeed_2 = ((floatingObject1.currentMass + floatingObject1.currentMass) * new_xspeed_1 + (floatingObject2.currentMass - floatingObject1.currentMass) * new_xspeed_2) / (floatingObject1.currentMass + floatingObject2.currentMass);
        var final_yspeed_1 = new_yspeed_1;
        var final_yspeed_2 = new_yspeed_2;

        var cosAngle = Math.cos(collisionision_angle);
        var sinAngle = Math.sin(collisionision_angle);

        floatingObject1.currentSpeed.x = cosAngle * final_xspeed_1 - sinAngle * final_yspeed_1;
        floatingObject1.currentSpeed.y = sinAngle * final_xspeed_1 + cosAngle * final_yspeed_1;

        floatingObject2.currentSpeed.x = cosAngle * final_xspeed_2 - sinAngle * final_yspeed_2;
        floatingObject2.currentSpeed.y = sinAngle * final_xspeed_2 + cosAngle * final_yspeed_2;

        var pos1 = {
            x: floatingObject1.currentPosition.x,
            y: floatingObject1.currentPosition.y
        };

        var pos2 = {
            x: floatingObject2.currentPosition.x,
            y: floatingObject2.currentPosition.y
        };

        // get the mtd
        var posDiff = {
            x: pos1.x - pos2.x,
            y: pos1.y - pos2.y
        };

        var d = Math.sqrt(Math.pow(floatingObject2.currentPosition.x - floatingObject1.currentPosition.x, 2) + Math.pow(floatingObject2.currentPosition.y - floatingObject1.currentPosition.y, 2));

        // minimum translation distance to push floatingObjects apart after intersecting
        var scalar = (((floatingObject1.currentRadius + floatingObject2.currentRadius) - d) / d);

        var minTD = {
            x: posDiff.x * scalar,
            y: posDiff.y * scalar
        };

        // resolve intersection --
        // computing inverse mass quantities
        var im1 = 1 / floatingObject1.currentMass;
        var im2 = 1 / floatingObject2.currentMass;

        // push-pull them apart based off their mass

        pos1.x = pos1.x + minTD.x * (im1 / (im1 + im2));
        pos1.y = pos1.y + minTD.y * (im1 / (im1 + im2));
        pos2.x = pos2.x - minTD.x * (im2 / (im1 + im2));
        pos2.y = pos2.y - minTD.y * (im2 / (im1 + im2));

        floatingObject1.currentPosition = pos1;
        floatingObject2.currentPosition = pos2;
    }
}

