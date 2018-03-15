(function () {
    'use strict';

    const docHeight = document.body.clientHeight;
    const docWidth = document.body.clientWidth;
    const centerX = docWidth / 2;
    const centerY = docHeight / 2;

    const app = (function() {
        const fps = 30;
        const state = {
            isTouched: false,
            touchX: 0,
            touchY: 0,
            frame: 0,
            fps
        };
        const listeners = [];

        function scheduleTick() {
            setTimeout(tick, 1000 / fps);
        }


        function tick() {
            state.frame++;
            listeners.forEach(cb => {
                cb(state);
            });
            scheduleTick();
        }


        function setPosition(e) {
            e.preventDefault();
            state.touchX = e.touches[0].clientX;
            state.touchY = e.touches[0].clientY;
        }


        function onTouchStart(e) {
            e.preventDefault();
            state.isTouched = true;
        }


        function onTouchEnd(e) {
            e.preventDefault();
            state.isTouched = false;
        }


        function ontick(cb) {
            listeners.push(cb);
        }

        document.addEventListener('touchstart', setPosition, { passive: false });
        document.addEventListener('touchstart', onTouchStart, { passive: false });
        document.addEventListener('touchend', onTouchEnd, { passive: false });
        document.addEventListener('touchmove', setPosition, { passive: false });

        scheduleTick();

        return { ontick };
    })();

    function main() {
        initBeam();
        initTutorial();
    }


    function initTutorial() {
        const elt = document.querySelector('.tutorial');
        elt.addEventListener('touchstart', hideTutorial, { passive: false });

        function hideTutorial() {
            elt.style.display = 'none';
        }
    }



    /* ------------------------
    RADAR BEAM
    ------------------------ */
    function initBeam() {
        const elt = document.querySelector('.beam');
        const loopTime = 2;

        function getBeamAngle(appState) {
            const tau = Math.PI * 2;
            const framesPerLoop = Math.round(loopTime * 1000 / appState.fps);
            const currFrame = appState.frame % framesPerLoop;
            return (tau * currFrame / framesPerLoop) - Math.PI;
        }


        function update(appState) {
            const beamAngle = getBeamAngle(appState);
            elt.style.transform = (`rotate(${beamAngle}rad)`);

            if (checkAngle(beamAngle, appState)) {
                createBlip(appState);
            }
        }

        app.ontick(update)
    }


    function getBlipCoordinates(appState) {
        const offsetX = appState.touchX - centerX;
        const offsetY = appState.touchY - (centerY * 1.5);

        const x = Math.max(0, offsetX * 2);
        const y = Math.max(0, offsetY * 2);
        const d = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

        return { x, y, d };
    }


    /* ------------------------
    RADAR BLIP
    ------------------------ */
    function checkAngle(beamAngle, appState) {
        if (!appState.isTouched) {
            return false;
        }

        const { x, y } = getBlipCoordinates(appState);
        const blipAngle = Math.atan((x - centerX) / (centerY - y));
        const deltaAngle = Math.abs(blipAngle - beamAngle);

        return deltaAngle < 0.05;
    }


    function createBlip(appState) {
        const { x, y, d } = getBlipCoordinates(appState);
        console.log({x, y, d});
        const elt = document.createElement('div');
        elt.className = 'blip';

        if (d < 50) {
            elt.className += ' blip--active';
        }

        elt.style.left = x + 'px';
        elt.style.top = y + 'px';

        document.body.appendChild(elt);
    }


    // Deal with resize events, the easy way
    window.addEventListener('resize', location.reload.bind(location));

    main();

})();
