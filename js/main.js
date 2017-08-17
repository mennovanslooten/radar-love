(function () {
    'use strict';

    const tau = Math.PI * 2;

    const docHeight = document.body.clientHeight;
    const docWidth = document.body.clientWidth;
    const centerX = docWidth / 2;
    const centerY = docHeight / 2;


    function main() {
        const target = initTarget();
        initBeam(target);
    }


    /* ------------------------
    RADAR BEAM
    ------------------------ */
    function initBeam(target) {
        const elt = document.querySelector('.beam');
        const startTime = new Date().valueOf();

        function getLoopPerc() {
            const currTime = new Date().valueOf();
            const deltaTime = currTime - startTime;
            const loopTime = 2000;
            return (deltaTime % loopTime) / loopTime * 100;
        }


        function rotateBeam() {
            const perc = getLoopPerc();
            const beamAngle = (tau / 100 * perc) - Math.PI;
            elt.style.transform = (`rotate(${beamAngle}rad)`);
            target.notify(beamAngle);
            loop();
        }


        function loop() {
            requestAnimationFrame(rotateBeam);
        }

        loop()
    }


    /* ------------------------
    RADAR TARGET
    ------------------------ */
    function initTarget() {
        const elt = document.querySelector('.target');
        let isVisible = false;
        const coordinates = {
            x: 0,
            y: 0
        };


        function moveTarget(e) {
            e.preventDefault();
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            repositionTarget(touchX, touchY);
        }


        function getPosition(touchX, touchY) {
            const offsetX = touchX - centerX;
            const offsetY = touchY - (centerY * 1.5);
            if (offsetX < 0 || offsetY < 0) {
                return { x: 0, y: 0 };
            }
            const x = offsetX * 2;
            const y = offsetY * 2;
            return { x, y };
        }


        function setCoordinates(x, y) {
            coordinates.x = x - centerX;
            coordinates.y = centerY - y;
        }


        function getAngle() {
            if (!isVisible) {
                return;
            }

            const { x, y } = coordinates;
            const targetAngle = Math.atan(x / y);
            return targetAngle;
        }


        function notify(beamAngle) {
            const targetAngle = getAngle();
            if (targetAngle) {
                const deltaAngle = Math.abs(targetAngle - beamAngle);
                toggleTarget(deltaAngle < 0.2);
            }
        }


        function repositionTarget(touchX, touchY) {
            const { x, y } = getPosition(touchX, touchY);
            elt.style.left = x + 'px';
            elt.style.top = y + 'px';
            setCoordinates(x, y);
        }


        function getDistanceFromCenter() {
            const { x, y } = coordinates;
            return Math.sqrt(x * x + y * y);
        }


        function toggleTarget(isActive) {
            const distance = getDistanceFromCenter();
            elt.classList.toggle('target--active', isActive);
            elt.classList.toggle('target--close', distance < 50);
        }


        function showTarget(e) {
            e.preventDefault();
            isVisible = true;
            elt.classList.add('target--visible');
        }


        function hideTarget() {
            isVisible = false;
            elt.classList.remove('target--visible');
        }

        document.addEventListener("touchstart", showTarget, { passive: false });
        document.addEventListener("touchend", hideTarget, { passive: false });
        document.addEventListener("touchmove", moveTarget, { passive: false });

        return {
            notify: notify
        }
    }

    // Deal with resize events, the easy way
    window.addEventListener("resize", location.reload.bind(location));

    main();

})();
