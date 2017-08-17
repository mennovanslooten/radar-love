(function () {
    'use strict';

    const target = document.querySelector('.target');
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
        const el = document.querySelector('.beam');
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
            el.style.transform = (`rotate(${beamAngle}rad)`);
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
            const x = touchX;
            const y = (touchY - centerY);
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
                var deltaAngle = Math.abs(targetAngle - beamAngle);
                toggleTarget(deltaAngle < 0.2);
            }
        }


        function repositionTarget(touchX, touchY) {
            const { x, y } = getPosition(touchX, touchY);
            target.style.left = x + 'px';
            target.style.top = y + 'px';
            setCoordinates(x, y);
        }


        function getDistanceFromCenter() {
            const { x, y } = coordinates;
            return Math.sqrt(x * x + y * y);
        }


        function toggleTarget(isActive) {
            const distance = getDistanceFromCenter();
            target.classList.toggle('target--active', isActive);
            target.classList.toggle('target--close', distance < 50);
        }


        function showTarget(e) {
            e.preventDefault();
            isVisible = true;
            target.classList.add('target--visible');
        }


        function hideTarget() {
            isVisible = false;
            target.classList.remove('target--visible');
        }

        document.addEventListener("touchstart", showTarget, { passive: false });
        document.addEventListener("touchend", hideTarget, { passive: false });
        document.addEventListener("touchmove", moveTarget, { passive: false });

        return {
            notify: notify
        }
    }



    main();

})();